export const formatNumber = (
  value: number,
  decimals = 2,
  unit?: string
): string => {
  return unit ? `${value.toFixed(decimals)} ${unit}` : value.toFixed(decimals);
};
