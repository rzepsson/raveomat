## Implementation Update - 2026-04-23 (Architecture Hardening)

### Done in this iteration

1. Dual Supabase client consolidated to SSR-only auth.
   - Removed: src/lib/supabase.ts (raw createClient with no cookie handling)
   - Added: src/lib/supabase.browser.ts (createBrowserClient from @supabase/ssr)
   - Browser client reads/writes same cookies as server client, eliminating session split-brain
   - Updated: src/lib/authStore.ts, src/components/AuthModal.svelte, src/components/RegisterForm.svelte, src/components/Header.svelte, src/components/dashboard/TabEvents.svelte, src/components/dashboard/TabPromoter.svelte

2. Auth endpoints migrated to Astro Actions with full validation + rate limiting.
   - Added: src/actions/auth.ts (login, register, logout) with Zod schemas and honeypot
   - Deleted: src/pages/api/auth/login.ts, register.ts, logout.ts (replaced by actions)
   - Kept: src/pages/api/auth/callback.ts (required for OAuth redirect)
   - Login response no longer leaks full User/Session objects (returns minimal { id, email })
   - Rate limits: 10 req/15min per IP, 5 req/15min per email for login; 5 req/hour per IP for register

3. Middleware path filtering + security headers + response compression.
   - Updated: src/middleware.ts
   - Static assets (images, fonts, videos, CSS, JS, /_astro/*, /content/*) now bypass Supabase init entirely
   - Session now properly populated from supabase.auth.getSession() (was always null before)
   - CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy headers added
   - Brotli/Gzip response compression for HTML/JSON/CSS/JS/SVG
   - Added: src/lib/security/csp.ts (configurable CSP builder)

4. Distributed rate limiting backend (Redis) implemented.
   - Updated: src/lib/security/rate-limit.ts (checkRateLimit now async, delegates to Redis when configured)
   - Added: src/lib/security/redis-rate-limit.ts (Upstash Redis REST API with Lua fixed-window script)
   - Automatic fallback to in-memory if Redis unavailable
   - Set RATE_LIMIT_DRIVER=redis + UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to activate

5. Non-Unsplash image optimization added (Supabase Storage).
   - Updated: src/lib/utils.ts (optimizeImageUrl + buildImageSrcSet now handle Supabase Storage URLs)
   - Uses Supabase Image Transformation API (/storage/v1/render/image/public/)

6. Shared partners data module eliminates duplication.
   - Added: src/lib/partners.ts (single source of truth for partner list)
   - Updated: src/components/Collectives.astro and src/pages/partnerzy.astro (use shared module)
   - Both pages now show identical data sorted by event count

7. Sidebar active state bug fixed.
   - Updated: src/components/dashboard/Sidebar.svelte (tab IDs now match route segments: bilety, ustawienia, organizacja, wydarzenia, skaner, promotor)

8. SEO infrastructure completed.
   - Added: @astrojs/sitemap integration (generates sitemap-index.xml at build)
   - Added: public/robots.txt (allows all, blocks /panel/ and /api/, references sitemap)
   - Updated: astro.config.mjs (site: 'https://raveomat.pl')

9. Accessibility improvements.
   - Added: skip-to-content link in src/layouts/Layout.astro
   - Added: main landmark wrapper with id="main-content"
   - Added: aria-live="polite" on error/success regions in ContactForm, NewsletterForm, EventCheckout
   - Added: src/components/Notification.svelte (toast component with aria-live)

10. Notification system foundation.
   - Added: src/lib/notification.ts (nanostore-based push/dismiss with auto-dismiss)
   - Added: src/components/Notification.svelte (rendered in Layout.astro)

11. Code quality fixes.
   - Fixed: Icon.svelte dynamic Tailwind classes replaced with SIZE_MAP lookup
   - Fixed: Header.svelte text-1xl → text-xl
   - Fixed: supabase.server.ts cookie options: any → typed CookieOptions interface
   - Fixed: rejestracja.astro video now uses compressed /content/rave_video_720.{webm,mp4}
   - Fixed: wydarzenia.astro now filters past events (.gte date filter) and has error handling
   - Removed: public/content/rave_video.mp4 (23MB uncompressed; replaced by 2MB compressed versions)
   - Updated: src/env.d.ts (added PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY env types)

## Implementation Update - 2026-04-23 (Actions & Anti-Abuse)

### Done in this iteration

1. Public forms moved to Astro Actions with modular structure.
   - Added: src/actions/contact.ts, src/actions/newsletter.ts, src/actions/shared.ts
   - Kept entrypoint as thin orchestrator: src/actions/index.ts

2. Server-side validation contract enforced with Zod.
   - Newsletter and contact payloads are now validated in actions before database writes.

3. Honeypot protection added on both public forms.
   - Client: hidden technical field added in src/components/ContactForm.svelte and src/components/NewsletterForm.svelte
   - Server: honeypot guard added in src/actions/shared.ts and enforced in action handlers

4. Anti-abuse layer prepared for production rollout.
   - Current limiter backend: in-memory fixed window (per-IP and per-email)
   - Added config module for future distributed backend: src/lib/security/rate-limit.config.ts
   - Env contract added in src/env.d.ts: RATE_LIMIT_DRIVER, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

## Implementation Update - 2026-04-23

### Done in this iteration

1. Homepage SSR now uses server Supabase client (removed client SDK import from homepage SSR path).
   - Updated: src/pages/index.astro
   - Uses: src/lib/supabase.server.ts
   - Expected effect: reduces avoidable client-side Supabase coupling for homepage data fetch.

2. Reusable SEO metadata layer implemented in shared layout.
   - Updated: src/layouts/Layout.astro
   - Added support: canonical, robots/noindex, Open Graph, Twitter Card, optional JSON-LD injection.

3. JSON-LD structured data added for key pages.
   - Homepage: WebSite + Organization schema
   - Event page: Event schema with Offer and organizer/location fields
   - Updated: src/pages/index.astro, src/pages/wydarzenie/[id].astro

4. SEO rollout on high-traffic static pages.
   - Updated canonical + OG props on: src/pages/wydarzenia.astro, src/pages/rejestracja.astro, src/pages/partnerzy.astro

5. Image delivery pipeline improvements shipped.
   - Hero poster moved into Astro asset pipeline source: src/assets/rave_poster.jpg
   - Hero poster now generated as optimized WebP via astro:assets getImage in src/components/Hero.astro
   - Unsplash responsive srcset/sizes added in src/components/HeroCarousel.svelte and src/components/TicketCard.svelte
   - New helper added for enterprise-safe srcset generation in src/lib/utils.ts

6. Background video compression strategy shipped.
   - Added compressed 720p assets in public/content:
     - rave_video_720.mp4 (2,001,314 bytes)
     - rave_video_720.webm (2,269,805 bytes)
   - Kept MP4 fallback and now prioritize WebM in src/components/Hero.astro
   - Hero video now uses preload="metadata" and poster from optimized asset pipeline output

### Remaining Priorities (revalidated)

#### High

1. Checkout/Payment integration
   - Implement Stripe or similar payment provider
   - Create order/ticket generation flow
   - Build ticket QR code generation and email delivery

2. Background video optimization (phase 2)
   - Tune CRF/encoding presets with visual QA to target stable quality at minimal size across devices.

#### Medium

3. Partners data migration to Supabase/CMS
   - Current shared module (src/lib/partners.ts) is ready; needs Supabase table + admin UI.

4. RLS policy hardening
   - Audit and tighten Row Level Security policies on all Supabase tables.
   - Ensure organization-scoped data access is properly enforced.

#### Low

5. Accessibility hardening (phase 2)
   - Add keyboard navigation tests
   - Add screen reader testing and ARIA audit
   - Consider focus-visible styling improvements
