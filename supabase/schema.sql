-- ============================================================
-- Aqari (عقاري) — full Supabase setup
-- Paste this ENTIRE file into the Supabase SQL Editor and run it.
-- Creates tables, RLS policies, and seeds 12 demo listings.
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.listings (
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

create table if not exists public.admin_users (
  id    uuid primary key references auth.users (id) on delete cascade,
  email text
);

-- ---------- Row Level Security ----------

alter table public.listings enable row level security;
alter table public.admin_users enable row level security;

-- Re-running is safe: drop existing policies first.
drop policy if exists "Public read approved listings" on public.listings;
drop policy if exists "Anyone can post listing"        on public.listings;
drop policy if exists "Admin full access"              on public.listings;
drop policy if exists "Admins read admin_users"        on public.admin_users;

-- Visitors can read only approved listings
create policy "Public read approved listings"
on public.listings for select
using (is_approved = true);

-- Anyone can submit a listing (created pending: is_approved = false)
create policy "Anyone can post listing"
on public.listings for insert
with check (true);

-- Admins (rows in admin_users) can read all + update + delete
create policy "Admin full access"
on public.listings for all
using (auth.uid() in (select id from public.admin_users))
with check (auth.uid() in (select id from public.admin_users));

-- NOTE: must reference the row's own id (auth.uid() = id), NOT a subquery on
-- admin_users — a subquery here re-triggers this same policy and causes
-- "infinite recursion detected in policy" (Postgres error 42P17).
create policy "Admins read admin_users"
on public.admin_users for select
using (auth.uid() = id);

-- ---------- Seed data (12 listings) ----------
-- Remove this block if you prefer to start empty.

insert into public.listings
  (title, type, transaction, price, location, area_m2, rooms, description, phone, is_featured, is_approved)
values
  ('Villa de luxe à Tevragh Zeina','villa','vente',12500000,'Tevragh Zeina',450,4,'Magnifique villa moderne avec jardin, garage double et finitions haut de gamme, proche des ambassades.','22245001122',true,true),
  ('Appartement 3 chambres - Ksar','appartement','location',45000,'Ksar',120,3,'Appartement lumineux au cœur du Ksar, proche commerces et écoles. Idéal pour une famille.','22246112233',true,true),
  ('Terrain commercial - Teyarett','terrain','vente',8200000,'Teyarett',600,null,'Terrain bien situé sur axe principal, zoné commercial. Titre foncier disponible.','22247223344',true,true),
  ('Maison familiale - Dar Naim','villa','vente',6800000,'Dar Naim',300,5,'Spacieuse maison avec cour intérieure, 5 chambres et deux salons. Quartier calme.','22248334455',true,true),
  ('Bureau moderne - Tevragh Zeina','bureau','location',90000,'Tevragh Zeina',150,4,'Plateau de bureaux climatisé, parking privé et fibre. Prêt à emménager.','22249445566',true,true),
  ('Local commercial - Sebkha','local_commercial','location',75000,'Sebkha',80,null,'Local sur rue passante, vitrine, idéal commerce de détail ou agence.','22245556677',true,true),
  ('Chambre meublée - Riyadh','chambre','location',18000,'Riyadh',25,1,'Chambre meublée tout confort, accès cuisine partagée, eau et électricité incluses.','22246667788',false,true),
  ('Appartement standing - Tevragh Zeina','appartement','vente',9500000,'Tevragh Zeina',160,3,'Appartement de standing dans résidence sécurisée, ascenseur et groupe électrogène.','22247778899',false,true),
  ('Terrain résidentiel - Arafat','terrain','vente',3200000,'Arafat',400,null,'Terrain viabilisé dans zone résidentielle en plein développement.','22248889900',false,true),
  ('Villa avec piscine - Tevragh Zeina','villa','location',250000,'Tevragh Zeina',500,6,'Villa haut de gamme avec piscine, jardin paysager et personnel de maison.','22249990011',false,true),
  ('Bureau open-space - Ksar','bureau','location',60000,'Ksar',100,2,'Open-space lumineux, salle de réunion, idéal startup ou PME.','22245101112',false,true),
  ('Studio meublé - Sebkha','chambre','location',22000,'Sebkha',30,1,'Studio meublé indépendant avec coin cuisine et salle d''eau privée.','22246212223',false,true);

-- ---------- Storage bucket for listing photos ----------
-- Public bucket so uploaded photos are servable by URL; anyone can upload
-- (photos attach to a pending listing and are reviewed with it in the admin panel).

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "Public upload listing images" on storage.objects;
create policy "Public upload listing images"
on storage.objects for insert
with check (bucket_id = 'listing-images');

drop policy if exists "Public read listing images" on storage.objects;
create policy "Public read listing images"
on storage.objects for select
using (bucket_id = 'listing-images');

-- Admins can delete photos (e.g. when removing a junk listing)
drop policy if exists "Admin delete listing images" on storage.objects;
create policy "Admin delete listing images"
on storage.objects for delete
using (bucket_id = 'listing-images'
  and auth.uid() in (select id from public.admin_users));

-- ============================================================
-- After running this:
-- 1. Authentication → Users → Add user (your admin email + password).
-- 2. Copy that user's UID, then run (replace the UID + email):
--      insert into public.admin_users (id, email)
--      values ('PASTE-USER-UID', 'admin@aqari.mr');
-- 3. Log in at /admin.html.
-- ============================================================
