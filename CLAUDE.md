# Aqari (عقاري) — project context for Claude Code

> Auto-loaded each session. For full detail read `HANDOFF.md`. Keep this file updated as the project evolves.

## What this is
Bilingual (French default / Arabic RTL) real-estate listings site for Nouakchott, Mauritania.
Static front end + Supabase backend. No server, no build step. Deployable to Netlify by drag-and-drop.

- **Stack:** HTML + Tailwind (CDN) + vanilla JS ES modules + Supabase (DB, Auth, Storage)
- **Brand:** navy `#1A2B4A`, sand gold `#C8A96E`, WhatsApp green `#25D366`; fonts DM Sans + Tajawal (Arabic)
- **Status:** fully built and verified live; the post → approve → publish loop works against real Supabase.

## Layout
- Pages: `index.html`, `listings.html`, `listing-detail.html`, `post-listing.html`, `admin.html`
- JS: `js/{tailwind-config,supabase,i18n,app,listings,detail,post,admin}.js`
  (`app.js` = data layer + mock fallback + card renderer + formatters; `i18n.js` = FR/AR strings)
- CSS: `css/{theme,rtl}.css`
- Backend: `supabase/schema.sql` (tables + RLS + storage bucket + seed)
- Hosting: `netlify.toml` + `netlify/edge-functions/listing-og.js` (per-listing WhatsApp/OG previews)
- Docs: `HANDOFF.md` (start here), `PLAN.md`, `SETUP.md` (⚠️ stale — predates storage/edge/Tajawal)

## Conventions / gotchas
- **Tailwind config loads AFTER the CDN script** (order matters; loading before silently drops custom colors).
- **Arabic numbers:** wrap prices/areas/phones in `<span class="aq-ltr-num">` (bidi-isolated; Latin numerals).
- **RLS recursion (already fixed):** `admin_users` SELECT policy must use `auth.uid() = id`,
  never a subquery on `admin_users` (else error 42P17 "infinite recursion").
- **Admin is hidden:** no public nav link; reachable only at `/admin.html`. Real protection is RLS + `admin_users`.
- Add new translatable text via `data-i18n` attributes + keys in `js/i18n.js` (both `fr` and `ar`).

## Supabase (already configured, keys live in js/supabase.js)
- Project ref `ahqlzyftbmbhlqgpohwk`. Tables `listings` + `admin_users`, RLS active,
  public storage bucket `listing-images`.
- Admin: `sidielmoktarmed@gmail.com` (in `admin_users`, confirmed). Password not stored in repo.

## Run / verify locally
Preview server "aqari" is in `../.claude/launch.json` (`python -m http.server 5050 --directory aqari`).
Start it and open `http://localhost:5050`. Use preview tools to verify (start → eval/screenshot).

## Likely next steps
1. Deploy to Netlify (drag `aqari/`), then add the URL to Supabase → Auth → URL Configuration.
2. Update `SETUP.md` to match current build (storage bucket, edge function, RLS fix, Tajawal, hidden admin).
3. Optional: Cloudflare Turnstile (hook noted in `js/post.js`), favicon/og-cover, dedupe seed rows.
