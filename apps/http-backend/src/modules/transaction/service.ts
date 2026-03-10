import prismaClient, { redisClient } from "@repo/database/client";
import { Order } from "./types.js";
import { AppError } from "../../utlis/AppError.js";
import { v4 as uuidv4 } from 'uuid';


export const placeOrderService = async ({
  qty,
  type,
  price,
  userId,
  assetId,
  method,
}: Order): Promise<Order | any> => {
  console.log("placign order");
  if(!userId){
    throw new AppError("User id is required",409)
  }
  
  try {
let orderid=uuidv4();
    await redisClient.zAdd(`orderBook:${assetId}:${method}`,{
      score:Number(price),
      value:orderid
    })
await redisClient.hSet(`orderBook:${assetId}:${orderid}`,{
  qty,
  price,
  userId,
  assetId,
  method,
  remainingQty:qty,
  timestamp:Date.now()
})
    const placeOrder = await prismaClient.orderbook.create({
      data: {
        qty,
        type,
        price,
        userId,
        assetId,
        method,
        remainingQty:qty
      },
    });

    if (!placeOrder) throw new AppError("Failed to place order", 400);

    const addTransaction = await prismaClient.transaction.create({
      data: {
        assetId: assetId,
        userId,
        executed: false,
        amount: price,
        qty: qty,
        orderBookId: placeOrder?.id,
        type,
        method
      },
    });
    return addTransaction;
  } catch (error) {
    throw error;
  }
};


export const executeOrder = async({
qty,
price,
type,
assetId,
method,
id
}:Order): Promise<{
  success: boolean;
  fullyFiled: boolean;
  remaining: number;
  message: string;
}> => {
try {
  console.log("trying to execute order",id);
  const matchMethod = method === "Buy" ? "Sell" : "Buy";
  const rev = matchMethod === "Buy";

  const order = await redisClient.zRangeWithScores(
    `orderBook:${assetId}:${matchMethod}`,
    0,
    0,
    { REV: rev },
  );
  if (order.length < 0) {
    throw new AppError("No order to match", 409);
  }

  const marketPrice = order[0]?.score as number;
  const makerOrderId = order[0]?.value as string;
  const takerPrice = price;
  if (takerPrice > marketPrice) {
    throw new AppError("Price is not in the order book", 409);
  }


  return await prismaClient.$transaction(async (tx)=>{
  const mainMethod = method ==="Sell"?"Buy":"Sell";
    const findMatchOrder = await tx.$queryRawUnsafe<Order[]>(`
    SELECT * FROM "Orderbook"
    WHERE "assetId"=$1 AND "method"=$2 AND "executed"=false AND "remainingQty">0
    ORDER BY "price" ${method === "Buy" ? "ASC" : "DESC"}, "createdAt" ASC
    FOR UPDATE SKIP LOCKED
    `, assetId, mainMethod)
    let myQty=qty; //15
    // Average price calculation: If order is partially filled with multiple prices,
    // compute weighted average price only based on amount filled so far.
    let totalFilledQty = 0;
    let totalFilledCost = 0;

    for (const order of findMatchOrder) {
      if (myQty <= 0) break;
      console.log("my qty", myQty, "order remaining qty:", order.remainingQty);
      console.log("my price:", price, "order price:", order.price, "matching", price <= order.price);

      const isMatched = method === "Buy" ? price >= order.price : price <= order.price;

      if (!isMatched) break;

      const fillQty = Math.min(myQty, order.remainingQty);
      totalFilledQty += fillQty;
      totalFilledCost += fillQty * order.price;
      myQty -= fillQty;

      const matchNewQty = order.remainingQty - fillQty;

      await tx.orderbook.update({
        where: {
          id: order.id
        },
        data: {
          executed: matchNewQty === 0,
          remainingQty: matchNewQty
        }
      });
      if (matchNewQty === 0) {
        await tx.transaction.updateMany({
          where: {
            orderBookId: order.id
          },
          data: {
            executed: true
          }
        })
      }

      await tx.orderbook.update({
        where: {
          id: id
        },
        data: {
          executed: myQty === 0,
          remainingQty: myQty
        }
      });

      if (myQty === 0) {
        await tx.transaction.updateMany({
          where: {
            orderBookId: id
          },
          data: {
            executed: true
          }
        })
      }

    }

    let averagePrice;
    if (totalFilledQty > 0) {
      averagePrice = totalFilledCost / totalFilledQty;
    } else {
      averagePrice = price; // fallback to input price if nothing matched
    }

    await tx.transaction.updateMany({
      where: {
        orderBookId: id
      },
      data: {
        amount: averagePrice,
        qty: totalFilledQty
      }
    });
    return{
      success:myQty<qty,
      fullyFiled :myQty===0,
      remaining:myQty,
      message:myQty===qty?"Order fully filled":"Order partially filled"
    }
  })
  

} catch (error) {
  throw error
}
}