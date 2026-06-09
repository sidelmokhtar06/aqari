// Post-listing form: photo upload + validation + anti-spam + insert.
import { supabase, isConfigured } from './supabase.js';
import { LOCATIONS, PROPERTY_TYPES, typeLabel } from './app.js';
import { t } from './i18n.js';

const MAX_FILES = 6;
const MAX_SIZE = 5 * 1024 * 1024;
const MIN_DWELL_MS = 2500;    // Anti-bot: min time on page
const RATE_LIMIT_MS = 60 * 1000;  // Max 1 post per minute per browser
const FORM_LOADED_AT = Date.now();

const form = document.getElementById('post-form');
const errorEl = document.getElementById('form-error');
const successEl = document.getElementById('post-success');
const submitBtn = document.getElementById('submit-btn');
const fileInput = document.getElementById('image-files');
const previews = document.getElementById('image-previews');
const uploadStatus = document.getElementById('upload-status');

let selectedFiles = [];

function fillSelects() {
  const typeSel = form.querySelector('select[name="type"]');
  typeSel.querySelectorAll('option:not(:first-child)').forEach((o) => o.remove());
  PROPERTY_TYPES.forEach((tp) => typeSel.insertAdjacentHTML('beforeend', `<option value="${tp}">${typeLabel(tp)}</option>`));

  const locSel = form.querySelector('select[name="location"]');
  locSel.querySelectorAll('option:not(:first-child)').forEach((o) => o.remove());
  LOCATIONS.forEach((loc) => locSel.insertAdjacentHTML('beforeend', `<option value="${loc}">${loc}</option>`));
}

function renderPreviews() {
  previews.innerHTML = selectedFiles.map((f, i) => {
    const url = URL.createObjectURL(f);
    return `
      <div class="relative group">
        <img src="${url}" alt="" class="w-full h-20 object-cover rounded-card border border-border-subtle">
        <button type="button" data-remove="${i}"
          class="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center shadow">
          <span class="material-symbols-outlined !text-base">close</span>
        </button>
      </div>`;
  }).join('');
}

function showStatus(msg, isError = false) {
  uploadStatus.textContent = msg;
  uploadStatus.classList.toggle('hidden', !msg);
  uploadStatus.classList.toggle('text-danger', isError);
  uploadStatus.classList.toggle('text-text-muted', !isError);
}

fileInput.addEventListener('change', (e) => {
  showStatus('');
  for (const f of e.target.files) {
    if (selectedFiles.length >= MAX_FILES) { showStatus(t('post.too_many_images'), true); break; }
    if (f.size > MAX_SIZE) { showStatus(t('post.image_too_large'), true); continue; }
    selectedFiles.push(f);
  }
  e.target.value = '';
  renderPreviews();
});

previews.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-remove]');
  if (!btn) return;
  selectedFiles.splice(Number(btn.dataset.remove), 1);
  renderPreviews();
});

async function uploadImages() {
  const urls = [];
  for (let i = 0; i < selectedFiles.length; i++) {
    showStatus(`${t('post.uploading')} (${i + 1}/${selectedFiles.length})`);
    const f = selectedFiles[i];
    const ext = (f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('listing-images')
      .upload(path, f, { cacheControl: '3600', contentType: f.type });
    if (error) throw error;
    urls.push(supabase.storage.from('listing-images').getPublicUrl(path).data.publicUrl);
  }
  showStatus('');
  return urls;
}

function clearInvalid() {
  form.querySelectorAll('.aq-invalid').forEach((el) => el.classList.remove('aq-invalid'));
  errorEl.classList.add('hidden');
}

function validate() {
  clearInvalid();
  let valid = true;
  form.querySelectorAll('[required]').forEach((el) => {
    if (!String(el.value).trim()) { el.classList.add('aq-invalid'); valid = false; }
  });
  const phone = form.phone;
  if (phone.value && phone.value.replace(/\D/g, '').length < 8) {
    phone.classList.add('aq-invalid'); valid = false;
  }
  if (!valid) {
    errorEl.textContent = t('post.required_error');
    errorEl.classList.remove('hidden');
    form.querySelector('.aq-invalid')?.focus();
  }
  return valid;
}

function parseImages(raw) {
  return String(raw || '').split(',').map((s) => s.trim()).filter(Boolean);
}

function softFakeSuccess() {
  // Honeypot/dwell hit: fake success but don't record anything.
  form.classList.add('hidden');
  successEl.classList.remove('hidden');
}

async function submit(e) {
  e.preventDefault();

  // Anti-spam: honeypot (hidden field bots autofill, humans don't).
  if (form.website && form.website.value.trim()) { softFakeSuccess(); return; }

  // Anti-spam: dwell time (bots submit instantly).
  if (Date.now() - FORM_LOADED_AT < MIN_DWELL_MS) { softFakeSuccess(); return; }

  // Anti-spam: rate limit per browser.
  const last = Number(localStorage.getItem('aqari_last_post') || 0);
  if (Date.now() - last < RATE_LIMIT_MS) {
    errorEl.textContent = t('post.rate_limited');
    errorEl.classList.remove('hidden');
    return;
  }

  if (!validate()) return;

  submitBtn.disabled = true;
  submitBtn.classList.add('opacity-60');

  try {
    let images = parseImages(form.images.value);
    if (selectedFiles.length && isConfigured) {
      images = [...(await uploadImages()), ...images];
    }

    const fd = new FormData(form);
    const record = {
      title: fd.get('title').trim(),
      type: fd.get('type'),
      transaction: fd.get('transaction'),
      price: Number(fd.get('price')),
      location: fd.get('location'),
      area_m2: fd.get('area_m2') ? Number(fd.get('area_m2')) : null,
      rooms: fd.get('rooms') ? Number(fd.get('rooms')) : null,
      description: fd.get('description').trim(),
      images,
      phone: fd.get('phone').trim(),
      is_approved: false,
      is_featured: false,
    };

    if (isConfigured) {
      const { error } = await supabase.from('listings').insert([record]);
      if (error) throw error;
    } else {
      await new Promise((r) => setTimeout(r, 400));
      console.info('[Aqari] Mock mode: listing not persisted.');
    }

    localStorage.setItem('aqari_last_post', String(Date.now()));
    form.classList.add('hidden');
    successEl.classList.remove('hidden');
    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    console.error('post submit failed', err);
    showStatus('');
    errorEl.textContent = t('post.upload_failed');
    errorEl.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-60');
  }
}

document.getElementById('post-another').addEventListener('click', () => {
  form.reset();
  selectedFiles = [];
  renderPreviews();
  showStatus('');
  clearInvalid();
  successEl.classList.add('hidden');
  form.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

form.addEventListener('input', (e) => e.target.classList?.remove('aq-invalid'));
form.addEventListener('submit', submit);
document.addEventListener('langchange', fillSelects);
fillSelects();
