# Aqari (عقاري)

A bilingual real estate listings platform for Mauritania, built with HTML, CSS, Vanilla JavaScript, and Supabase.

## Features

- **Bilingual (FR/AR)** — French (LTR) and Arabic (RTL) with Tajawal font
- **Real estate listings** — Browse, filter, and search properties in Nouakchott
- **Photo uploads** — Upload to Supabase Storage via drag-and-drop
- **WhatsApp integration** — One-click contact via WhatsApp links
- **Admin panel** — Approve, feature, and delete listings with Supabase Auth
- **Anti-spam protection** — Honeypot, dwell-time gate, rate limiting
- **Social previews** — Netlify edge function injects per-listing OG tags for WhatsApp/Facebook/Twitter
- **No build step** — Pure static files, deployable anywhere

## Quick Start

### 1. Clone & Set Up

```bash
git clone https://github.com/yourusername/aqari.git
cd aqari
```

### 2. Configure Supabase

Edit `js/supabase.js` with your Supabase project URL and anon key:

```javascript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. Run Locally

Serve on `http://localhost:5050`:

```bash
python -m http.server 5050 --directory .
```

### 4. Set Up Database

Copy-paste the SQL from `supabase/schema.sql` into your Supabase SQL Editor and run it. It creates tables, RLS policies, storage bucket, and seeds 12 demo listings.

### 5. Create Admin User

- **Supabase Dashboard** → Authentication → Users → Add user
- **SQL Editor** → insert your user's UID into `admin_users` table
- Log in at `/admin.html`

## Deploy to Netlify

Drag the `aqari` folder to [app.netlify.com](https://app.netlify.com/drop). The `netlify.toml` edge function deploys automatically for social previews.

## Project Structure

```
aqari/
├── index.html, listings.html, listing-detail.html, post-listing.html, admin.html
├── css/theme.css, rtl.css
├── js/
│   ├── app.js (data layer + formatters + card renderer)
│   ├── listings.js, detail.js, post.js, admin.js
│   ├── i18n.js (FR/AR translations)
│   ├── supabase.js (Supabase client config)
│   └── tailwind-config.js (Tailwind theme)
├── netlify/edge-functions/listing-og.js (WhatsApp preview injection)
├── supabase/schema.sql (database setup)
├── CLAUDE.md (auto-loaded project context)
├── SETUP.md (deployment guide)
└── robots.txt, .gitignore
```

## Tech Stack

- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript (ES modules)
- **Styling:** Tailwind CSS (CDN)
- **Fonts:** DM Sans (French), Tajawal (Arabic)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Netlify (with edge functions)
- **Icons:** Material Symbols Outlined

## Key Features Explained

### Bilingual + RTL

- Toggle between French (LTR) and Arabic (RTL) in the navbar
- Preference saved to `localStorage`
- Numbers/prices use bidi-isolated spans (prevents mirroring in Arabic)
- All text via `data-i18n` attributes + centralized `i18n.js`

### Photo Upload

- Drag-and-drop file input in post form
- Max 6 photos, 5 MB each
- Uploads to Supabase Storage (`listing-images` bucket)
- Fallback to URL input for users without images

### Anti-Spam

- **Honeypot:** hidden off-screen field (bots autofill, humans don't)
- **Dwell time:** 2.5s minimum on form (bots submit instantly)
- **Rate limit:** 1 post per minute per browser
- Hook for Cloudflare Turnstile if you need hard captcha

### Admin Panel

- Supabase Auth login (`/admin.html`)
- Table of all listings (approved + pending)
- One-click approve, feature, delete
- RLS ensures only admins see pending listings

### Social Previews

Netlify edge function (`netlify/edge-functions/listing-og.js`) rewrites `<head>` meta tags on listing-detail.html so WhatsApp/Facebook/Twitter show:
- Real photo from the listing
- Title + price
- Short description

Fallback to generic preview if listing not found or Supabase unavailable.

## Customization

### Change Brand Colors

Edit `js/tailwind-config.js` and `css/theme.css`:

```javascript
primary: "#1A2B4A",      // Navy
accent: "#C8A96E",       // Sand gold
success: "#2E7D52",      // Green
whatsapp: "#25D366",     // WhatsApp
```

### Add Property Types or Locations

Edit `js/app.js`:

```javascript
export const PROPERTY_TYPES = ['appartement', 'villa', ...];
export const LOCATIONS = ['Tevragh Zeina', 'Ksar', ...];
```

### Update Translations

Edit `js/i18n.js` for French (`fr`) and Arabic (`ar`) keys.

## Deployment Checklist

- [ ] Supabase project created
- [ ] Tables created (run `supabase/schema.sql`)
- [ ] Admin user created (Supabase Auth + `admin_users` table)
- [ ] Site deployed to Netlify
- [ ] Netlify URL added to Supabase Auth → URL Configuration
- [ ] Email confirmation enabled or admin email confirmed
- [ ] Tested post → approve → publish flow

## License

MIT

## Support

For issues or questions, check `CLAUDE.md` (auto-loaded context) or `SETUP.md` (deployment guide).
