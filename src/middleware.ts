import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase.server";
import { buildCspHeader } from "./lib/security/csp";
import { brotliCompress, gzip } from "node:zlib";
import { promisify } from "node:util";

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

const STATIC_EXTENSIONS = new Set([
  ".css", ".js", ".mjs", ".png", ".jpg", ".jpeg", ".webp", ".avif",
  ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".mp4", ".webm", ".ogg", ".mp3", ".wav", ".flac", ".pdf", ".woff2",
  ".map", ".webmanifest",
]);

const COMPRESSIBLE_TYPES = new Set([
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/json",
  "text/xml",
  "application/xml",
  "image/svg+xml",
]);

function isStaticAsset(pathname: string): boolean {
  if (pathname.startsWith("/_astro/")) return true;
  if (pathname.startsWith("/content/")) return true;
  const lastDot = pathname.lastIndexOf(".");
  if (lastDot === -1) return false;
  return STATIC_EXTENSIONS.has(pathname.slice(lastDot).toLowerCase());
}

async function maybeCompress(response: Response, acceptEncoding: string): Promise<Response> {
  const contentType = response.headers.get("content-type") ?? "";
  const isCompressible = COMPRESSIBLE_TYPES.has(contentType.split(";")[0].trim());

  if (!isCompressible || !response.body) return response;

  if ((response.body as ReadableStream).locked) return response;

  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) < 512) return response;

  try {
    const bodyBuffer = Buffer.from(await response.arrayBuffer());
    const headers = new Headers(response.headers);
    headers.delete("content-length");

    if (acceptEncoding.includes("br")) {
      const compressed = await brotliAsync(bodyBuffer) as Buffer;
      headers.set("content-encoding", "br");
      headers.set("content-length", String(compressed.length));
      return new Response(compressed, { status: response.status, statusText: response.statusText, headers });
    }

    if (acceptEncoding.includes("gzip")) {
      const compressed = await gzipAsync(bodyBuffer) as Buffer;
      headers.set("content-encoding", "gzip");
      headers.set("content-length", String(compressed.length));
      return new Response(compressed, { status: response.status, statusText: response.statusText, headers });
    }

    return new Response(bodyBuffer, { status: response.status, statusText: response.statusText, headers });
  } catch {
    return response;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (isStaticAsset(context.url.pathname)) {
    return next();
  }

  const rawCookieHeader = context.request.headers.get("cookie") ?? "";
  const authResponseHeaders = new Map<string, string>();

  const supabase = createSupabaseServerClient(
    context.cookies,
    rawCookieHeader,
    authResponseHeaders,
  );

  const [sessionResult, userResult] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ]);

  const session = sessionResult.data.session ?? null;
  const currentUser = userResult.data.user ?? session?.user ?? null;

  context.locals.supabase = supabase;
  context.locals.user = currentUser;
  context.locals.session = session ?? null;

  if (context.url.pathname.startsWith("/panel") && !currentUser) {
    return context.redirect("/?login=1");
  }

  let response = await next();

  const cspHeader = buildCspHeader();
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  for (const [key, value] of authResponseHeaders) {
    response.headers.set(key, value);
  }

  const acceptEncoding = context.request.headers.get("accept-encoding") ?? "";
  response = await maybeCompress(response, acceptEncoding);

  return response;
});
