interface ImageOptions {
  width?: number;
  quality?: number;
}

interface SrcSetOptions extends ImageOptions {
  widths?: number[];
}

function isUnsplashUrl(url: string): boolean {
  return url.includes("unsplash.com");
}

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("supabase.co/storage/");
}

function optimizeSupabaseImageUrl(url: string, width: number): string {
  const pathParts = url.split("/storage/v1/object/public/");
  if (pathParts.length < 2) return url;
  return `${pathParts[0]}/storage/v1/render/image/public/${pathParts[1]}?width=${width}`;
}

export function optimizeImageUrl(
  url: string | undefined,
  options: ImageOptions = {}
): string {
  if (!url) return "";
  const { width = 600, quality = 70 } = options;
  if (isUnsplashUrl(url)) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}auto=format&fm=webp&fit=crop&w=${width}&q=${quality}`;
  }
  if (isSupabaseStorageUrl(url)) {
    return optimizeSupabaseImageUrl(url, width);
  }
  return url;
}

export function buildImageSrcSet(
  url: string | undefined,
  options: SrcSetOptions = {}
): string {
  if (!url) return "";

  const { widths = [320, 480, 640, 960, 1200], quality = 70 } = options;
  const uniqueSortedWidths = [...new Set(widths)].sort((a, b) => a - b);

  if (isUnsplashUrl(url) || isSupabaseStorageUrl(url)) {
    return uniqueSortedWidths
      .map((width) => `${optimizeImageUrl(url, { width, quality })} ${width}w`)
      .join(", ");
  }

  return "";
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
