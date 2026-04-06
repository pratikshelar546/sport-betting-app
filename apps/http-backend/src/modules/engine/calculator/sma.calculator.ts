export const calculateSMA = (prices: number[]): number => {
    console.log(prices,"prices");
    
  if (prices.length === 0) return 0;

  const sum = prices.reduce((acc, price) => acc + price, 0);
  console.log(sum,"sum");
  return sum / prices.length;
};
