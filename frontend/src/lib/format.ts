const LOCALE = "pt-BR";
const CURRENCY = "BRL";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(typeof value === "string" ? new Date(value) : value);
}
