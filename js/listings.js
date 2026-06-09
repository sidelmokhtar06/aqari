// Browse page: fetch approved listings once, then filter/sort client-side.
import {
  LOCATIONS, PROPERTY_TYPES, typeLabel,
  fetchApprovedListings, listingCardHTML,
} from './app.js';
import { t } from './i18n.js';

const PAGE_SIZE = 9;
let ALL = [];
let shown = PAGE_SIZE;
const form = document.getElementById('filters');
const results = document.getElementById('results');
const sortSel = document.getElementById('sort');
const loadMoreWrap = document.getElementById('load-more-wrap');
const loadMoreBtn = document.getElementById('load-more');

function skeletons(n) {
  return Array.from({ length: n }).map(() => `
    <div class="bg-surface rounded-card border border-border-subtle overflow-hidden">
      <div class="aq-skeleton h-48 w-full"></div>
      <div class="p-4 space-y-3">
        <div class="aq-skeleton h-4 w-3/4 rounded"></div>
        <div class="aq-skeleton h-3 w-1/2 rounded"></div>
        <div class="aq-skeleton h-9 w-full rounded"></div>
      </div>
    </div>`).join('');
}

function buildControls() {
  const checks = document.getElementById('type-checks');
  checks.innerHTML = PROPERTY_TYPES.map((tp) => `
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" name="type" value="${tp}" class="accent-primary w-4 h-4">
      <span>${typeLabel(tp)}</span>
    </label>`).join('');
  const locSel = form.querySelector('select[name="location"]');
  locSel.querySelectorAll('option:not(:first-child)').forEach((o) => o.remove());
  LOCATIONS.forEach((loc) => locSel.insertAdjacentHTML('beforeend', `<option value="${loc}">${loc}</option>`));
}

function applyUrlParams() {
  const p = new URLSearchParams(location.search);
  if (p.get('transaction')) {
    const r = form.querySelector(`input[name="transaction"][value="${p.get('transaction')}"]`);
    if (r) r.checked = true;
  }
  if (p.get('location')) {
    const sel = form.querySelector('select[name="location"]');
    if ([...sel.options].some((o) => o.value === p.get('location'))) sel.value = p.get('location');
  }
  if (p.get('type')) {
    const cb = form.querySelector(`input[name="type"][value="${p.get('type')}"]`);
    if (cb) cb.checked = true;
  }
  if (p.get('q')) form.querySelector('input[name="q"]').value = p.get('q');
}

function currentFilters() {
  const fd = new FormData(form);
  return {
    q: (fd.get('q') || '').trim().toLowerCase(),
    transaction: fd.get('transaction') || '',
    location: fd.get('location') || '',
    rooms: Number(fd.get('rooms')) || 0,
    priceMin: Number(fd.get('price_min')) || 0,
    priceMax: Number(fd.get('price_max')) || Infinity,
    types: fd.getAll('type'),
  };
}

function matchesQuery(l, q) {
  if (!q) return true;
  return [l.title, l.description, l.location, l.type]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
}

function applyFilters(list, f) {
  return list.filter((l) => {
    if (!matchesQuery(l, f.q)) return false;
    if (f.transaction && l.transaction !== f.transaction) return false;
    if (f.location && l.location !== f.location) return false;
    if (f.types.length && !f.types.includes(l.type)) return false;
    if (f.rooms && (l.rooms || 0) < f.rooms) return false;
    if (l.price < f.priceMin || l.price > f.priceMax) return false;
    return true;
  });
}

function applySort(list, mode) {
  const out = [...list];
  if (mode === 'price_asc') out.sort((a, b) => a.price - b.price);
  else if (mode === 'price_desc') out.sort((a, b) => b.price - a.price);
  else out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return out;
}

function render() {
  const filtered = applySort(applyFilters(ALL, currentFilters()), sortSel.value);
  document.getElementById('result-count').textContent = filtered.length;
  if (!filtered.length) {
    loadMoreWrap.classList.add('hidden');
    results.innerHTML = `
      <div class="col-span-full text-center py-16 text-text-muted">
        <span class="material-symbols-outlined !text-5xl text-border-subtle">search_off</span>
        <p class="mt-3" data-i18n="listing.empty">${t('listing.empty')}</p>
      </div>`;
    return;
  }
  results.innerHTML = filtered.slice(0, shown).map(listingCardHTML).join('');
  loadMoreWrap.classList.toggle('hidden', filtered.length <= shown);
}

function resetAndRender() {
  shown = PAGE_SIZE;
  render();
}

async function init() {
  buildControls();
  applyUrlParams();
  results.innerHTML = skeletons(6);
  try {
    ALL = await fetchApprovedListings();
    render();
  } catch {
    results.innerHTML = `<div class="col-span-full text-center text-danger py-16">${t('common.error')}</div>`;
  }

  form.addEventListener('input', resetAndRender);
  sortSel.addEventListener('change', resetAndRender);
  loadMoreBtn.addEventListener('click', () => { shown += PAGE_SIZE; render(); });
  document.getElementById('reset-filters').addEventListener('click', () => {
    form.reset();
    resetAndRender();
  });
  document.addEventListener('langchange', () => { buildControls(); render(); });
}

init();
