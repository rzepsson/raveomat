# Raveomat

*[Polski](README.pl.md)*

Ticketing for techno and rave events: a public catalogue, and a panel where clubs and collectives publish their own lineups.

A solo project, built to learn Astro's server-rendered islands and Svelte 5 runes on something bigger than a todo list.

**Stack:** Astro 6 (SSR) · Svelte 5 · Tailwind v4 · Supabase (Postgres + Auth + Storage) · Zod · TypeScript

## Screenshots

The landing page. Only events with a `pro` promo tier reach the hero slot.

![Landing page](docs/screenshots/home.png)

The catalogue. Search covers the event name and the venue, filters run client side.

![Event catalogue](docs/screenshots/events.png)

The organiser panel. Events are scoped to your organisation, and posters get cropped before they reach Storage.

![Organiser panel](docs/screenshots/panel-events.png)

<details>
<summary>Event page and sign-in</summary>

![Event page](docs/screenshots/event.png)

![Sign in](docs/screenshots/login.png)

</details>

## Running it

```bash
npm install
cp .env.example .env    # PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

You need a Supabase project. `supabase/schema.sql` is a dump of the live one (tables, enums, functions, triggers, RLS), so running it against a fresh project gets you a working database. The numbered files in `supabase/migrations/` are just history and assume the base tables exist.

Upstash is optional. Without it the rate limiter uses an in-memory window.

## What's in it

- **Public side:** landing page, event catalogue with search and filters, event pages with a live availability bar, partner directory, newsletter and contact forms.
- **Organiser panel:** the sidebar is built from your membership, so no organisation means no event tabs. Event CRUD includes a canvas cropper that uploads the cropped poster, not the original.
- **Auth:** Supabase Auth over SSR cookies, `/panel/*` guarded in middleware. Sign-in, registration, password change and reset.
- **Anti-abuse:** public forms go through Astro Actions with Zod schemas, a honeypot field, and a rate limiter keyed on both IP and email. Identifiers are hashed before use, so no raw addresses are stored.
- **Performance and SEO:** Brotli/gzip in middleware, responsive `srcset` via Unsplash and Supabase image transforms, JSON-LD, sitemap, OG tags.

## Notes

**Actions, not API routes.** Validation lives next to the handler and the client gets a typed call instead of a hand-rolled `fetch`. The rate limiter and honeypot got one obvious place to sit.

**One Supabase client.** Browser and server both come from `@supabase/ssr` and read the same cookies. An earlier version used a raw `createClient` on the front end, so the two could disagree about who was signed in after a token refresh.

**The rate limiter degrades instead of breaking.** In-memory counters by default, Upstash Redis when configured, automatic fallback to memory if Redis is unreachable.

## Status

Ticket sales are the unfinished part. The database models `orders`, `tickets`, `ticket_scans`, `refunds` and pricing tiers, but checkout stops at the quantity picker: no payments, no QR generation, no working scanner. The wallet and scanner tabs are placeholders.

Event management, auth and the public side work end to end.
