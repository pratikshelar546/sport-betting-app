import prismaClient from "@repo/database/client";
import { Order } from "./types";
import { AppError } from "../../utlis/AppError";

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
}:Order): Promise<Order | any> =>{
try {
  console.log("trying to execute order",id);
  
  const mainMethod = method ==="Sell"?"Buy":"Sell"
  const findMatchOrder = await prismaClient.orderbook.findMany({
    where: {
      type,
      assetId,
      method: mainMethod,
      executed: false,
      remainingQty: {
        gt: 0,
      },
    },
    orderBy: [
      {
        price: method === "Buy" ? "asc" : "desc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  if(findMatchOrder?.length < 0){
    throw new Error("There is no order present")
  }
  // console.log(findMatchOrder,"this are the orders");
  
  let myQty=qty; //15

  for(const order of findMatchOrder){
    console.log("my qty",myQty,"order remaining qty:",order.remainingQty);
    console.log("my price:",price,"order price:",order.price, "mayching",price <= order.price);
    
   if( price<= order.price){ // if the same qty matches
    if(myQty === order.remainingQty){
      console.log("same qty find now executing");
        
      if(!id){
        throw new AppError("order id is required to execute order",404)
      }
       await prismaClient.orderbook.update({
        where:{
          id:id
        },
        data:{
          executed:true,
          remainingQty:0
        }
      });
       await prismaClient.transaction.updateMany({
        where:{
          orderBookId:id
        },
        data:{
          executed:true
        }
      });
       await prismaClient.orderbook.update({
        where:{
          id:order.id
        },
        data:{
          executed:true,
          remainingQty:0
        }
      })
       await prismaClient.transaction.updateMany({
        where:{
          orderBookId:order.id
        },
        data:{
          executed:true
        }
      });
console.log("order executed at best price and updated the orderbook and transaction");

      return {
        sucess:true,
        message:"Order executed at best price"
      }
    }

    //  if the myqty is more than matched order
    
    if(myQty > order.remainingQty){
      console.log("my qty is greater so updating matched to executed and remaingqty");
        
      if(!id){
        throw new AppError("order id is required to execute order",404)
      }
       await prismaClient.orderbook.update({
        where:{
          id:id
        },
        data:{
          remainingQty:myQty-order.remainingQty
        }
      });
     
       await prismaClient.orderbook.update({
        where:{
          id:order.id
        },
        data:{
          executed:true,
          remainingQty:0
        }
      })
       await prismaClient.transaction.updateMany({
        where:{
          orderBookId:order.id
        },
        data:{
          executed:true
        }
      });
      console.log("done with updating previous order to executed");
        
      myQty = myQty-order.remainingQty;
      console.log("order executed at best price and updated the orderbook and transaction but my qty is still pending");
      continue;
    }else if(myQty<order.remainingQty){
      console.log("my qty is less than order qty...but still executing");
      if(!id){
        throw new AppError("order id is required to execute order",404)
      }
      const updateOriginalOrder = await prismaClient.orderbook.update({
        where:{
          id:id
        },
        data:{
          executed:true,
          remainingQty:0
        }
      });
      const updateOriginalTransaction = await prismaClient.transaction.updateMany({
        where:{
          orderBookId:id
        },
        data:{
          executed:true
        }
      });
      const updatePreviousOrder = await prismaClient.orderbook.update({
        where:{
          id:order.id
        },
        data:{
          remainingQty: order.remainingQty-myQty
        }
      })
      // const updatePreviousTransaction = await prismaClient.transaction.updateMany({
      //   where:{
      //     orderBookId:order.id
      //   },
      //   data:{
      //     executed:true
      //   }
      // });
      myQty = order.remainingQty-myQty;
      console.log("order executed at best price and updated the orderbook and transaction but my qty is still pending");
      return{
        success:true,
        message:"Order executed "
      }
    }}
  }

  return {
    success:false,
    message:"Order pending it will get match with best price"
  }
} catch (error) {
  throw error
}
}