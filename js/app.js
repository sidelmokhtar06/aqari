// Aqari shared logic: navbar, language toggle, setup banner, data layer, formatters, card renderer.
import { supabase, isConfigured } from './supabase.js';
import { applyLang, getLang, toggleLang, t } from './i18n.js';

export const PROPERTY_TYPES = [
  'appartement', 'villa', 'terrain', 'local_commercial', 'bureau', 'chambre',
];
export const LOCATIONS = [
  'Tevragh Zeina', 'Ksar', 'Dar Naim', 'Arafat', 'Teyarett', 'Sebkha', 'Riyadh',
];

export const TYPE_ICON = {
  appartement: 'apartment', villa: 'villa', terrain: 'landscape',
  local_commercial: 'storefront', bureau: 'business_center', chambre: 'bed',
};

export const TYPE_BADGE = {
  appartement: 'bg-blue-50 text-blue-800', villa: 'bg-amber-50 text-amber-800',
  terrain: 'bg-emerald-50 text-emerald-800', local_commercial: 'bg-purple-50 text-purple-800',
  bureau: 'bg-slate-100 text-slate-700', chambre: 'bg-rose-50 text-rose-800',
};

// Format price as "150 000 MRU" (space-separated thousands).
export function formatPrice(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('fr-FR').replace(/ |,/g, ' ') + ' MRU';
}

export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(getLang() === 'ar' ? 'ar-u-nu-latn' : 'fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return ''; }
}

export function typeLabel(type) {
  return t('cat.' + type);
}

// WhatsApp link with auto-prefix Mauritania 222 country code.
export function whatsappLink(phone, message = '') {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits.startsWith('222')) digits = '222' + digits;
  const q = message ? '?text=' + encodeURIComponent(message) : '';
  return `https://wa.me/${digits}${q}`;
}

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=60';

// Mock data: 12 Nouakchott listings (fallback when Supabase unavailable).
export const MOCK_LISTINGS = [
  { title: 'Villa de luxe à Tevragh Zeina', type: 'villa', transaction: 'vente', price: 12500000, location: 'Tevragh Zeina', area_m2: 450, rooms: 4, description: 'Magnifique villa moderne avec jardin, garage double et finitions haut de gamme, proche des ambassades.', phone: '22245001122', is_featured: true },
  { title: 'Appartement 3 chambres - Ksar', type: 'appartement', transaction: 'location', price: 45000, location: 'Ksar', area_m2: 120, rooms: 3, description: 'Appartement lumineux au cœur du Ksar, proche commerces et écoles. Idéal pour une famille.', phone: '22246112233', is_featured: true },
  { title: 'Terrain commercial - Teyarett', type: 'terrain', transaction: 'vente', price: 8200000, location: 'Teyarett', area_m2: 600, rooms: null, description: 'Terrain bien situé sur axe principal, zoné commercial. Titre foncier disponible.', phone: '22247223344', is_featured: true },
  { title: 'Maison familiale - Dar Naim', type: 'villa', transaction: 'vente', price: 6800000, location: 'Dar Naim', area_m2: 300, rooms: 5, description: 'Spacieuse maison avec cour intérieure, 5 chambres et deux salons. Quartier calme.', phone: '22248334455', is_featured: true },
  { title: 'Bureau moderne - Tevragh Zeina', type: 'bureau', transaction: 'location', price: 90000, location: 'Tevragh Zeina', area_m2: 150, rooms: 4, description: 'Plateau de bureaux climatisé, parking privé et fibre. Prêt à emménager.', phone: '22249445566', is_featured: true },
  { title: 'Local commercial - Sebkha', type: 'local_commercial', transaction: 'location', price: 75000, location: 'Sebkha', area_m2: 80, rooms: null, description: 'Local sur rue passante, vitrine, idéal commerce de détail ou agence.', phone: '22245556677', is_featured: true },
  { title: 'Chambre meublée - Riyadh', type: 'chambre', transaction: 'location', price: 18000, location: 'Riyadh', area_m2: 25, rooms: 1, description: 'Chambre meublée tout confort, accès cuisine partagée, eau et électricité incluses.', phone: '22246667788', is_featured: false },
  { title: 'Appartement standing - Tevragh Zeina', type: 'appartement', transaction: 'vente', price: 9500000, location: 'Tevragh Zeina', area_m2: 160, rooms: 3, description: 'Appartement de standing dans résidence sécurisée, ascenseur et groupe électrogène.', phone: '22247778899', is_featured: false },
  { title: 'Terrain résidentiel - Arafat', type: 'terrain', transaction: 'vente', price: 3200000, location: 'Arafat', area_m2: 400, rooms: null, description: 'Terrain viabilisé dans zone résidentielle en plein développement.', phone: '22248889900', is_featured: false },
  { title: 'Villa avec piscine - Tevragh Zeina', type: 'villa', transaction: 'location', price: 250000, location: 'Tevragh Zeina', area_m2: 500, rooms: 6, description: 'Villa haut de gamme avec piscine, jardin paysager et personnel de maison.', phone: '22249990011', is_featured: false },
  { title: 'Bureau open-space - Ksar', type: 'bureau', transaction: 'location', price: 60000, location: 'Ksar', area_m2: 100, rooms: 2, description: 'Open-space lumineux, salle de réunion, idéal startup ou PME.', phone: '22245101112', is_featured: false },
  { title: 'Studio meublé - Sebkha', type: 'chambre', transaction: 'location', price: 22000, location: 'Sebkha', area_m2: 30, rooms: 1, description: 'Studio meublé indépendant avec coin cuisine et salle d/'eau privée.', phone: '22246212223', is_featured: false },
].map((l, i) => ({
  id: 'mock-' + (i + 1),
  images: [],
  is_approved: true,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  ...l,
}));

export function listingImage(listing) {
  return (listing.images && listing.images[0]) || PLACEHOLDER_IMG;
}

export async function fetchApprovedListings() {
  if (!isConfigured) return [...MOCK_LISTINGS];
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchApprovedListings', error); throw error; }
  return data || [];
}

export async function fetchFeaturedListings(limit = 6) {
  if (!isConfigured) return MOCK_LISTINGS.filter((l) => l.is_featured).slice(0, limit);
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('is_approved', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('fetchFeaturedListings', error); throw error; }
  return data || [];
}

export async function fetchListingById(id) {
  if (!isConfigured) return MOCK_LISTINGS.find((l) => l.id === id) || null;
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
  if (error) { console.error('fetchListingById', error); return null; }
  return data;
}

export async function fetchSimilarListings(listing, limit = 3) {
  if (!listing) return [];
  if (!isConfigured) {
    return MOCK_LISTINGS
      .filter((l) => l.id !== listing.id && (l.type === listing.type || l.location === listing.location))
      .slice(0, limit);
  }
  const { data, error } = await supabase
    .from('listings').select('*')
    .eq('is_approved', true)
    .neq('id', listing.id)
    .or(`type.eq.${listing.type},location.eq.${listing.location}`)
    .limit(limit);
  if (error) { console.error('fetchSimilarListings', error); return []; }
  return data || [];
}

export async function fetchTypeCounts() {
  const counts = {};
  PROPERTY_TYPES.forEach((tp) => (counts[tp] = 0));
  const all = await fetchApprovedListings().catch(() => []);
  all.forEach((l) => { if (counts[l.type] != null) counts[l.type]++; });
  return counts;
}

export function listingCardHTML(listing) {
  const badge = TYPE_BADGE[listing.type] || 'bg-slate-100 text-slate-700';
  const transBadge = listing.transaction === 'vente'
    ? 'bg-primary text-white'
    : 'bg-success text-white';
  const transText = listing.transaction === 'vente' ? t('listing.for_sale') : t('listing.for_rent');
  const rooms = listing.rooms
    ? `<span class="inline-flex items-center gap-1"><span class="material-symbols-outlined !text-base">bed</span><span class="aq-ltr-num">${listing.rooms}</span></span>`
    : '';
  const area = listing.area_m2
    ? `<span class="inline-flex items-center gap-1"><span class="material-symbols-outlined !text-base">straighten</span><span class="aq-ltr-num">${listing.area_m2} m²</span></span>`
    : '';
  return `
  <article class="aq-card bg-surface rounded-card border border-border-subtle overflow-hidden flex flex-col">
    <a href="listing-detail.html?id=${encodeURIComponent(listing.id)}" class="block relative">
      <img src="${listingImage(listing)}" alt="${escapeHTML(listing.title)}"
           class="w-full h-48 object-cover" loading="lazy">
      <div class="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex gap-2">
        <span class="text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded ${badge}">${typeLabel(listing.type)}</span>
        <span class="text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded ${transBadge}">${transText}</span>
      </div>
    </a>
    <div class="p-4 flex flex-col gap-2 flex-1">
      <a href="listing-detail.html?id=${encodeURIComponent(listing.id)}"
         class="font-bold text-text-main hover:text-primary line-clamp-1">${escapeHTML(listing.title)}</a>
      <p class="text-sm text-text-muted inline-flex items-center gap-1">
        <span class="material-symbols-outlined !text-base">location_on</span>${escapeHTML(listing.location)}
      </p>
      <div class="flex items-center gap-4 text-sm text-text-muted">${rooms}${area}</div>
      <p class="text-primary font-extrabold text-lg mt-auto"><span class="aq-ltr-num">${formatPrice(listing.price)}</span></p>
      <a href="${whatsappLink(listing.phone, listing.title)}" target="_blank" rel="noopener"
         class="mt-1 inline-flex items-center justify-center gap-2 bg-whatsapp hover:brightness-95 text-white font-bold py-2.5 rounded-card transition">
        <span class="material-symbols-outlined !text-lg">chat</span>${t('listing.contact_whatsapp')}
      </a>
    </div>
  </article>`;
}

export function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function wireLangToggle() {
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', toggleLang);
  });
}

function wireMobileMenu() {
  const btn = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));
}

function wireNavShadow() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('shadow-lift', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function showSetupBanner() {
  if (isConfigured) return;
  const bar = document.createElement('div');
  bar.className =
    'bg-amber-100 text-amber-900 text-sm text-center py-2 px-4 border-b border-amber-200';
  bar.setAttribute('data-i18n', 'banner.setup');
  bar.textContent = t('banner.setup');
  document.body.prepend(bar);
}

export function showError(target, message = t('common.error')) {
  if (typeof target === 'string') target = document.querySelector(target);
  if (!target) return;
  target.innerHTML = `<div class="text-center text-danger py-10">${escapeHTML(message)}</div>`;
}

export function initChrome() {
  showSetupBanner();
  applyLang(getLang());
  wireLangToggle();
  wireMobileMenu();
  wireNavShadow();
}

document.addEventListener('DOMContentLoaded', initChrome);
