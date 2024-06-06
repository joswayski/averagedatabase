export const getPercentageOf = (pct: number, total: number): number => {
  return Math.floor((pct / total) * 100);
};
