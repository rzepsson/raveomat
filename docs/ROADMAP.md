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

### Next anti-abuse milestone

1. Replace in-memory limiter with Redis/KV backend before scale-out.

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

1. Image delivery optimization (phase 2)
  - Extend responsive strategy to any remaining non-Unsplash image sources and OG/social image variants.

2. Background video optimization (phase 2)
  - Tune CRF/encoding presets with visual QA to target stable quality at minimal size across devices.

3. Distributed rate limiting backend (Redis)
  - Replace in-memory limiter with shared Redis/KV storage before production scale-out.

#### Medium

3. Compression at reverse proxy/CDN
  - Enable Brotli/Gzip for HTML/CSS/JS in production edge layer.

4. Rate limiting / anti-abuse for public form submissions
  - Add server-side protection path (RLS policy hardening, edge function limits, or bot mitigation).

5. Hardcoded partners data
  - Move to managed source (Supabase/CMS) for maintainability.

#### Low

6. Accessibility and UX hardening
  - Fix invalid utility class and add skip-to-content navigation.
  - Add standardized retry/error notification pattern.