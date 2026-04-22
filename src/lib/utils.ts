export function optimizeImageUrl(
  url: string | undefined,
  options: { width?: number; quality?: number } = {}
): string {
  if (!url) return "";
  const { width = 600, quality = 75 } = options;
  if (url.includes("unsplash.com")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}auto=format&fm=webp&fit=crop&w=${width}&q=${quality}`;
  }
  return url;
}

export function formatDate(
  dateStr: string,
  locale = "pl-PL",
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(locale, options);
}

export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, "pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateLong(dateStr: string): string {
  return formatDate(dateStr, "pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateFull(dateStr: string): string {
  return formatDate(dateStr, "pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateDashboard(dateStr: string): string {
  return formatDate(dateStr, "pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(amount: number, currency = "PLN"): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
  }).format(amount);
}

export function safePercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}
