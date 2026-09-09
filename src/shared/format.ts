export function formatCurrency(amount: number, currencyCode: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}