const eur0 = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const eur2 = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const int = new Intl.NumberFormat("en-IE", { maximumFractionDigits: 0 });

export const formatEuro = (value: number) => eur0.format(Math.round(value));
export const formatEuroPrecise = (value: number) => eur2.format(value);
export const formatInt = (value: number) => int.format(Math.round(value));
export const formatPercent = (value: number, digits = 1) =>
  `${(value * 100).toFixed(digits)}%`;
