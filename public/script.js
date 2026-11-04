const $ = id => document.getElementById(id);
const lb = $('lb'), grid = $('grid'), chips = $('chips'), stack = $('stack');
let photos = [], shown = [], current = 0;

async function loadSettings() {
  try {
    const s = await (await fetch('/api/settings')).json();
    const show = (sel, fn) => document.querySelectorAll(sel).forEach(a => { fn(a); a.hidden = false; });
    if (s.whatsapp) show('[data-wa]', a => {
      a.href = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent('Hi! I would like to book a shoot.')}`;
      a.target = '_blank'; a.rel = 'noopener';
    });
    if (s.email) show('[data-mail]', a => { a.href = `mailto:${s.email}`; a.textContent = s.email; });
    if (s.instagram) show('[data-ig]', a => { a.href = s.instagram; a.target = '_blank'; a.rel = 'noopener'; });
  } catch { /* contact buttons simply stay hidden */ }
}

const label = p => (p.category ? `${p.title}, ${p.category}` : p.title);

function openAt(i) {
  current = (i + shown.length) % shown.length;
  const p = shown[current];
  lb.querySelector('img').src = p.src; lb.querySelector('img').alt = p.title;
  $('lb-cap').textContent = label(p);
  if (!lb.open) lb.showModal();
}

function render(filter = 'All') {
  grid.replaceChildren();
  shown = photos.filter(p => filter === 'All' || p.category === filter);
  shown.forEach((p, i) => {
    const fig = document.createElement('figure');
    fig.className = `f ${p.layout}`;
    fig.style.animationDelay = `${Math.min(i, 12) * 60}ms`;
    const img = new Image();
    img.src = p.src; img.alt = p.title; img.loading = 'lazy';
    img.addEventListener('click', () => openAt(i));
    const cap = document.createElement('figcaption');
    cap.textContent = label(p); // textContent keeps it XSS-safe
    fig.append(img, cap);
    grid.append(fig);
  });
}

function buildChips() {
  chips.replaceChildren();
  const cats = [...new Set(photos.map(p => p.category).filter(Boolean))];
  if (cats.length < 2) return;
  for (const c of ['All', ...cats]) {
    const b = document.createElement('button');
    b.className = 'chip'; b.textContent = c; b.setAttribute('aria-pressed', c === 'All');
    b.addEventListener('click', () => {
      chips.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b));
      render(c);
    });
    chips.append(b);
  }
}

async function loadGallery() {
  try {
    photos = await (await fetch('/api/photos')).json();
    if (!photos.length) { grid.textContent = 'New work is on the way.'; return; }
    buildChips(); render();
    photos.slice(0, 3).forEach((p, i) => {
      const img = new Image(); img.src = p.src; img.alt = ''; img.className = `s${i + 1}`;
      stack.append(img);
    });
  } catch { grid.textContent = 'Could not load the gallery. Refresh to try again.'; }
}

$('lb-prev').addEventListener('click', () => openAt(current - 1));
$('lb-next').addEventListener('click', () => openAt(current + 1));
$('lb-close').addEventListener('click', () => lb.close());
lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
document.addEventListener('keydown', e => {
  if (!lb.open) return;
  if (e.key === 'ArrowLeft') openAt(current - 1);
  if (e.key === 'ArrowRight') openAt(current + 1);
});
loadSettings(); loadGallery();

const form = $('form'), status = $('status'), waOpen = $('wa-open');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.disabled = true; status.className = ''; status.textContent = 'Sending...'; waOpen.hidden = true;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    form.reset();
    if (data.waLink) { // free mode: WhatsApp opens with the message ready, the visitor presses Send
      status.textContent = 'Saved. WhatsApp is opening: press Send there to finish.';
      waOpen.href = data.waLink; waOpen.hidden = false;
      window.open(data.waLink, '_blank', 'noopener');
    } else {
      status.textContent = 'Sent. We will reply on WhatsApp or by email soon.';
    }
  } catch (err) {
    status.className = 'err'; status.textContent = err.message || 'Something went wrong.';
  } finally { btn.disabled = false; }
});
