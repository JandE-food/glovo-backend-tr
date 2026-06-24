export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('sq-AL', {
    style: 'currency',
    currency: 'ALL',
    maximumFractionDigits: 0
  }).format(value);
