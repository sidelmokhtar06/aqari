// Admin panel: auth + manage listings (approve/feature/delete). Demo mode if Supabase unconfigured.
import { supabase, isConfigured } from './supabase.js';
import { MOCK_LISTINGS, formatPrice, typeLabel, escapeHTML } from './app.js';
import { t } from './i18n.js';

const loginView = document.getElementById('login-view');
const dashView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const rowsEl = document.getElementById('admin-rows');
const emptyEl = document.getElementById('admin-empty');
const demoNote = document.getElementById('demo-note');

let listings = [];
const DEMO = !isConfigured;

if (DEMO) {
  demoNote.classList.remove('hidden');
  demoNote.textContent = 'Mode démo : toute connexion fonctionne. Configurez Supabase pour la production.';
}

/* ----------------------------------------------------------------- auth */

async function isLoggedIn() {
  if (DEMO) return sessionStorage.getItem('aqari_demo_admin') === '1';
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

async function login(email, password) {
  if (DEMO) {
    sessionStorage.setItem('aqari_demo_admin', '1');
    return { ok: true };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { ok: !error, error };
}

async function logout() {
  if (DEMO) sessionStorage.removeItem('aqari_demo_admin');
  else await supabase.auth.signOut();
  showLogin();
}

/* ----------------------------------------------------------------- data */

async function loadListings() {
  if (DEMO) {
    if (!listings.length) {
      listings = MOCK_LISTINGS.map((l, i) => ({ ...l, is_approved: i % 4 !== 0 }));
    }
    return listings;
  }
  const { data, error } = await supabase
    .from('listings').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  listings = data || [];
  return listings;
}

async function setApproved(id, value) {
  if (DEMO) { const l = listings.find((x) => x.id === id); if (l) l.is_approved = value; return; }
  const { error } = await supabase.from('listings').update({ is_approved: value }).eq('id', id);
  if (error) console.error(error);
}

async function setFeatured(id, value) {
  if (DEMO) { const l = listings.find((x) => x.id === id); if (l) l.is_featured = value; return; }
  const { error } = await supabase.from('listings').update({ is_featured: value }).eq('id', id);
  if (error) console.error(error);
}

async function remove(id) {
  if (DEMO) { listings = listings.filter((x) => x.id !== id); return; }
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) console.error(error);
}

/* ----------------------------------------------------------------- render */

function statusBadge(approved) {
  return approved
    ? `<span class="inline-flex items-center gap-1 text-xs font-semibold text-success"><span class="w-1.5 h-1.5 rounded-full bg-success"></span>${t('admin.approved')}</span>`
    : `<span class="inline-flex items-center gap-1 text-xs font-semibold text-accent"><span class="w-1.5 h-1.5 rounded-full bg-accent"></span>${t('admin.pending')}</span>`;
}

function rowHTML(l) {
  const approveBtn = l.is_approved ? '' : `
    <button data-action="approve" data-id="${l.id}" title="${t('admin.approve')}"
      class="p-1.5 rounded hover:bg-emerald-50 text-success"><span class="material-symbols-outlined !text-lg">check_circle</span></button>`;
  const featureColor = l.is_featured ? 'text-accent' : 'text-text-muted';
  return `
    <tr>
      <td class="px-4 py-3 font-medium max-w-[220px] truncate">${escapeHTML(l.title)}</td>
      <td class="px-4 py-3"><span class="text-xs font-bold uppercase">${typeLabel(l.type)}</span></td>
      <td class="px-4 py-3">${escapeHTML(l.location)}</td>
      <td class="px-4 py-3 font-semibold whitespace-nowrap"><span class="aq-ltr-num">${formatPrice(l.price)}</span></td>
      <td class="px-4 py-3">${statusBadge(l.is_approved)}</td>
      <td class="px-4 py-3">
        <div class="flex items-center justify-end gap-1">
          ${approveBtn}
          <button data-action="feature" data-id="${l.id}" title="${t('admin.feature')}"
            class="p-1.5 rounded hover:bg-amber-50 ${featureColor}"><span class="material-symbols-outlined !text-lg">${l.is_featured ? 'star' : 'star_border'}</span></button>
          <button data-action="delete" data-id="${l.id}" title="${t('admin.delete')}"
            class="p-1.5 rounded hover:bg-red-50 text-danger"><span class="material-symbols-outlined !text-lg">delete</span></button>
        </div>
      </td>
    </tr>`;
}

function renderTable() {
  rowsEl.innerHTML = listings.map(rowHTML).join('');
  emptyEl.classList.toggle('hidden', listings.length > 0);
  document.getElementById('stat-pending').textContent = listings.filter((l) => !l.is_approved).length;
  document.getElementById('stat-approved').textContent = listings.filter((l) => l.is_approved).length;
}

/* ----------------------------------------------------------------- views */

async function showDashboard() {
  loginView.classList.add('hidden');
  dashView.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
  await loadListings();
  renderTable();
}

function showLogin() {
  dashView.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  loginView.classList.remove('hidden');
}

/* ----------------------------------------------------------------- events */

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');
  const fd = new FormData(loginForm);
  const { ok } = await login(fd.get('email'), fd.get('password'));
  if (ok) showDashboard();
  else loginError.classList.remove('hidden');
});

logoutBtn.addEventListener('click', logout);

rowsEl.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'approve') await setApproved(id, true);
  else if (action === 'feature') {
    const l = listings.find((x) => x.id === id);
    await setFeatured(id, !(l && l.is_featured));
  } else if (action === 'delete') {
    if (!confirm(t('admin.confirm_delete'))) return;
    await remove(id);
  }
  if (!DEMO) await loadListings();
  renderTable();
});

document.addEventListener('langchange', () => { if (!dashView.classList.contains('hidden')) renderTable(); });

(async () => { if (await isLoggedIn()) showDashboard(); else showLogin(); })();
