const $ = id => document.getElementById(id);
const msg = $('msg');
const say = (text, bad) => { msg.textContent = text; msg.className = bad ? 'err' : ''; };

async function api(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed.'), { status: res.status });
  return data;
}
function show(loggedIn) {
  $('login-view').hidden = loggedIn; $('dash-view').hidden = !loggedIn; $('logout').hidden = !loggedIn;
}
async function loadList() {
  const photos = await api('/api/photos');
  const list = $('photo-list');
  list.replaceChildren();
  if (!photos.length) { list.textContent = 'No photos yet. Upload your first one above.'; return; }
  for (const p of photos) {
    const li = document.createElement('li');
    const img = new Image(); img.src = p.src; img.alt = '';
    const label = document.createElement('span'); label.textContent = p.category ? `${p.title} (${p.category})` : p.title;
    const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'btn danger';
    del.addEventListener('click', async () => {
      if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
      try { await api(`/api/admin/photos/${p.id}`, { method: 'DELETE' }); say('Deleted.'); loadList(); }
      catch (e) { say(e.message, true); }
    });
    li.append(img, label, del); list.append(li);
  }
}
async function loadEnquiries() {
  const rows = await api('/api/admin/enquiries');
  const list = $('enq-list');
  list.replaceChildren();
  if (!rows.length) { list.textContent = 'No enquiries yet.'; return; }
  for (const r of rows) {
    const li = document.createElement('li');
    const head = document.createElement('strong'); head.textContent = r.name;
    const meta = document.createElement('small'); meta.textContent = ` ${r.contact || 'no contact given'}, ${r.created_at} UTC`;
    const body = document.createElement('p'); body.textContent = r.message;
    const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'btn danger';
    del.addEventListener('click', async () => {
      if (!confirm('Delete this enquiry?')) return;
      try { await api(`/api/admin/enquiries/${r.id}`, { method: 'DELETE' }); loadEnquiries(); } catch (e) { say(e.message, true); }
    });
    li.append(head, meta, body, del); list.append(li);
  }
}
async function start() {
  try { await api('/api/admin/me'); show(true); loadList(); loadEnquiries(); } catch { show(false); }
}
$('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  try {
    await api('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
    e.target.reset(); say(''); start();
  } catch (err) { say(err.message, true); }
});
$('upload-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button'); btn.disabled = true; say('Uploading...');
  try {
    await api('/api/admin/photos', { method: 'POST', body: new FormData(e.target) });
    e.target.reset(); say('Photo added. It is live on the site now.'); loadList();
  } catch (err) {
    say(err.message, true);
    if (err.status === 401) show(false);
  } finally { btn.disabled = false; }
});
$('logout').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }); say(''); show(false); });
start();
