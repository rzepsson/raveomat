interface CspDirective {
  name: string;
  values: string[];
}

function getSupabaseOrigin(): string {
  const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

export function buildCspHeader(): string {
  const supabaseOrigin = getSupabaseOrigin();

  const directives: CspDirective[] = [
    { name: "default-src", values: ["'self'"] },
    { name: "script-src", values: ["'self'", "'unsafe-inline'"] },
    { name: "style-src", values: ["'self'", "'unsafe-inline'"] },
    {
      name: "img-src",
      values: ["'self'", "data:", "blob:", "https://images.unsplash.com", supabaseOrigin].filter(Boolean),
    },
    { name: "font-src", values: ["'self'"] },
    {
      name: "connect-src",
      values: ["'self'", supabaseOrigin].filter(Boolean),
    },
    // Astro client-side navigation can rely on same-origin framing internals.
    { name: "frame-src", values: ["'self'"] },
    { name: "frame-ancestors", values: ["'self'"] },
    { name: "object-src", values: ["'none'"] },
    { name: "media-src", values: ["'self'"] },
    { name: "base-uri", values: ["'self'"] },
    { name: "form-action", values: ["'self'"] },
  ];

  return directives.map((d) => `${d.name} ${d.values.join(" ")}`).join("; ");
}
