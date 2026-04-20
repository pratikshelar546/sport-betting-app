export const averageVolume = (volume: number[]) => {
  if (volume.length === 0) return 0;
  const sum = volume.reduce((acc, volume) => acc + volume, 0);
  return sum / volume.length;
}

export const calculateSMA = (prices: number[]): number => {    
  if (prices.length === 0) return 0;

  const sum = prices.reduce((acc, price) => acc + price, 0);
  return sum / prices.length;
};
