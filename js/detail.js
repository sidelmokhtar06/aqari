// Single listing page: read ?id= from URL, render full details + similar listings.
import {
  fetchListingById, fetchSimilarListings, listingCardHTML,
  formatPrice, formatDate, typeLabel, listingImage, whatsappLink,
  escapeHTML, TYPE_BADGE,
} from './app.js';
import { t } from './i18n.js';

const root = document.getElementById('detail-root');
let current = null;

function notFound() {
  root.innerHTML = `
    <div class="text-center py-20">
      <span class="material-symbols-outlined !text-5xl text-border-subtle">error_outline</span>
      <p class="mt-3 text-text-muted">${t('listing.not_found')}</p>
      <a href="listings.html" class="inline-block mt-6 bg-primary text-white font-bold px-6 py-2.5 rounded-card" data-i18n="featured.see_all">${t('featured.see_all')}</a>
    </div>`;
}

function galleryHTML(listing) {
  const imgs = (listing.images && listing.images.length) ? listing.images : [listingImage(listing)];
  const main = imgs[0];
  const thumbs = imgs.slice(1, 4).map((src) => `
    <img src="${escapeHTML(src)}" alt="" class="w-full h-[120px] sm:h-[140px] object-cover rounded-card border border-border-subtle">`).join('');
  const fillers = Array.from({ length: Math.max(0, 3 - (imgs.length - 1)) }).map(() => `
    <div class="w-full h-[120px] sm:h-[140px] rounded-card bg-surface-container border border-border-subtle flex items-center justify-center text-border-subtle">
      <span class="material-symbols-outlined">image</span>
    </div>`).join('');
  return `
    <div class="grid sm:grid-cols-[2fr_1fr] gap-3">
      <img src="${escapeHTML(main)}" alt="${escapeHTML(listing.title)}" class="w-full h-[260px] sm:h-[440px] object-cover rounded-panel border border-border-subtle">
      <div class="grid grid-cols-3 sm:grid-cols-1 gap-3">${thumbs}${fillers}</div>
    </div>`;
}

function specPill(icon, label, value) {
  if (!value) return '';
  return `
    <div class="flex items-center gap-2 bg-surface border border-border-subtle rounded-card px-4 py-3">
      <span class="material-symbols-outlined text-accent">${icon}</span>
      <div><p class="text-xs text-text-muted">${label}</p><p class="font-bold">${value}</p></div>
    </div>`;
}

function render(listing) {
  const badge = TYPE_BADGE[listing.type] || 'bg-slate-100 text-slate-700';
  const transText = listing.transaction === 'vente' ? t('listing.for_sale') : t('listing.for_rent');
  const transBadge = listing.transaction === 'vente' ? 'bg-primary text-white' : 'bg-success text-white';

  root.innerHTML = `
    <a href="listings.html" class="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-4">
      <span class="material-symbols-outlined !text-base rtl:rotate-180">arrow_back</span><span data-i18n="nav.listings">${t('nav.listings')}</span>
    </a>

    ${galleryHTML(listing)}

    <div class="grid lg:grid-cols-[1fr_360px] gap-8 mt-8">
      <div>
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span class="text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded ${badge}">${typeLabel(listing.type)}</span>
          <span class="text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded ${transBadge}">${transText}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-primary">${escapeHTML(listing.title)}</h1>
        <p class="mt-2 text-text-muted inline-flex items-center gap-1">
          <span class="material-symbols-outlined !text-base">location_on</span>${escapeHTML(listing.location)}, Nouakchott
        </p>
        <p class="mt-4 text-3xl font-extrabold text-primary"><span class="aq-ltr-num">${formatPrice(listing.price)}</span></p>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          ${specPill('bed', t('listing.rooms_label'), listing.rooms || '')}
          ${specPill('straighten', t('listing.area_label'), listing.area_m2 ? listing.area_m2 + ' m²' : '')}
          ${specPill('event', t('listing.posted_on'), formatDate(listing.created_at))}
        </div>

        <h2 class="text-lg font-bold text-primary mt-8 mb-2" data-i18n="listing.description">${t('listing.description')}</h2>
        <p class="text-text-main leading-relaxed whitespace-pre-line">${escapeHTML(listing.description || '')}</p>
      </div>

      <aside class="lg:sticky lg:top-24 h-fit">
        <div class="bg-surface border border-border-subtle rounded-panel p-6 shadow-lift">
          <p class="text-sm text-text-muted" data-i18n="listing.contact_seller">${t('listing.contact_seller')}</p>
          <p class="font-bold text-lg mt-1"><span class="aq-ltr-num">${escapeHTML(listing.phone)}</span></p>
          <a href="${whatsappLink(listing.phone, listing.title)}" target="_blank" rel="noopener"
             class="mt-4 w-full inline-flex items-center justify-center gap-2 bg-whatsapp hover:brightness-95 text-white font-bold py-3 rounded-card">
            <span class="material-symbols-outlined">chat</span>${t('listing.contact_whatsapp')}
          </a>
          <a href="tel:${escapeHTML(listing.phone)}"
             class="mt-3 w-full inline-flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 rounded-card transition">
            <span class="material-symbols-outlined">call</span>${t('listing.call')}
          </a>
        </div>
      </aside>
    </div>

    <section class="mt-14">
      <h2 class="text-xl font-bold text-primary mb-5" data-i18n="listing.similar">${t('listing.similar')}</h2>
      <div id="similar-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    </section>`;
}

async function renderSimilar(listing) {
  const grid = document.getElementById('similar-grid');
  if (!grid) return;
  const items = await fetchSimilarListings(listing, 3);
  grid.innerHTML = items.length
    ? items.map(listingCardHTML).join('')
    : `<p class="text-text-muted col-span-full">${t('listing.empty')}</p>`;
}

async function init() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return notFound();
  current = await fetchListingById(id);
  if (!current) return notFound();
  document.title = `${current.title} — Aqari`;
  render(current);
  renderSimilar(current);
  document.addEventListener('langchange', () => { render(current); renderSimilar(current); });
}

init();
