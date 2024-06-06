export const getPercentageOf = (
  pct: number,
  total: number,
  round = true
): number => {
  const v = ((pct / 100) * total).toFixed(2);

  return round ? Math.round(Number(v)) : Number(v);
};
