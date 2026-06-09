# Aqari (عقاري) — Setup & Deployment Guide

Aqari is a static site (HTML + Tailwind CDN + vanilla JS modules) backed by **Supabase**.
There is no build step and no server. You can open it locally, then connect Supabase and
deploy free on Netlify.

> **Works immediately without Supabase.** Until you add your keys, the site runs on 12 built-in
> mock listings and shows a yellow "setup" banner. The admin panel runs in a local demo mode
> (any email/password logs in; changes are in-memory only).

---

## 1. Run locally

Because the app uses ES modules, open it through a tiny web server (not `file://`):

```bash
# from the aqari/ folder — pick one:
npx serve .
# or
python -m http.server 8000
```

Then visit the printed URL (e.g. http://localhost:8000). Browse, filter, open a listing,
submit the post form, and log into `/admin.html` — all work on mock data.

---

## 2. Create a free Supabase project

1. Go to <https://supabase.com> → **Start your project** → sign in.
2. **New project** → name it `aqari`, choose a region close to Mauritania (e.g. EU West),
   set a database password, and create it.
3. Wait ~2 minutes for provisioning.

---

## 3. Create the tables

Open **SQL Editor** in the Supabase dashboard and run:

```sql
-- Listings
create table public.listings (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  type         text not null check (type in
                 ('appartement','villa','terrain','local_commercial','bureau','chambre')),
  transaction  text not null check (transaction in ('vente','location')),
  price        numeric not null,
  location     text,
  area_m2      numeric,
  rooms        integer,
  description  text,
  phone        text not null,
  images       text[] default '{}',
  is_featured  boolean default false,
  is_approved  boolean default false,
  created_at   timestamptz default now()
);

-- Admin allow-list (links to Supabase Auth users)
create table public.admin_users (
  id    uuid primary key references auth.users (id) on delete cascade,
  email text
);
```

---

## 4. Enable Row Level Security (RLS) policies

```sql
alter table public.listings enable row level security;

-- Anyone can read approved listings
create policy "Public read approved listings"
on public.listings for select
using (is_approved = true);

-- Anyone can post a listing (created as pending: is_approved = false)
create policy "Anyone can post listing"
on public.listings for insert
with check (true);

-- Admins (rows in admin_users) get full access — read all, update, delete
create policy "Admin full access"
on public.listings for all
using (auth.uid() in (select id from public.admin_users))
with check (auth.uid() in (select id from public.admin_users));

-- Lock down the admin_users table itself
alter table public.admin_users enable row level security;
create policy "Admins read admin_users"
on public.admin_users for select
using (auth.uid() in (select id from public.admin_users));
```

> The admin panel needs to see **pending** listings. The "Admin full access" policy grants
> that; the public policy only exposes approved ones to regular visitors.

---

## 5. Paste your keys into the app

1. In Supabase: **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open [`js/supabase.js`](js/supabase.js) and replace the two placeholders:

```javascript
export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJ...your-anon-key...';
```

Reload the site — the yellow banner disappears and the app now reads/writes Supabase.

---

## 6. Create the first admin user

1. Supabase dashboard → **Authentication → Users → Add user**.
2. Enter an email + password (this is your admin login). Confirm the user.
3. Copy that user's **UID** (User ID), then in **SQL Editor** run:

```sql
insert into public.admin_users (id, email)
values ('PASTE-THE-USER-UID', 'admin@aqari.mr');
```

Now log in at `/admin.html` with that email/password to approve, feature, and delete listings.

---

## 7. Deploy free on Netlify

**Option A — drag & drop (fastest):**
1. Go to <https://app.netlify.com/drop>.
2. Drag the entire `aqari/` folder onto the page.
3. Netlify gives you a live URL instantly.

**Option B — Git:** push the repo to GitHub and "Import from Git" in Netlify.
No build command, publish directory = the `aqari/` folder root.

> After deploying, add your Netlify URL to Supabase **Authentication → URL Configuration →
> Site URL / Redirect URLs** so admin login works in production.

---

## 8. Test the full flow

1. Open the deployed site → **Publier** → fill the form → submit.
   You should see: *"Votre annonce est en attente de validation…"*
2. The listing is now in Supabase with `is_approved = false` (not yet visible publicly).
3. Open `/admin.html`, log in as the admin user → the new listing appears as **En attente**.
4. Click **Approuver** (✓). Optionally click the star to feature it.
5. Open `/listings.html` (or the homepage if featured) → the listing is now live with a
   working **WhatsApp** button.

---

## File map

| Path | Purpose |
|---|---|
| `index.html` | Homepage: hero search, categories, featured |
| `listings.html` + `js/listings.js` | Browse, filter, sort |
| `listing-detail.html` + `js/detail.js` | Single listing + similar |
| `post-listing.html` + `js/post.js` | Submit form (pending) |
| `admin.html` + `js/admin.js` | Auth + approve/feature/delete |
| `js/supabase.js` | **Edit this** — your URL + anon key |
| `js/app.js` | Data layer, mock data, card renderer, formatters |
| `js/i18n.js` | FR + AR strings + language engine |
| `js/tailwind-config.js` | Tailwind theme (brand colors/fonts) |
| `css/theme.css`, `css/rtl.css` | Base styles + Arabic RTL overrides |

---

*Aqari (عقاري) — Real estate listings for Mauritania · Nouakchott*
