// Admin editor for the About and Services text
(() => {
  const $ = id => document.getElementById(id);
  const form = $('content-form');
  if (!form) return;
  const MAX = 6;
  const msg = $('content-msg'), list = $('svc-list');
  let services = [], cats = [];
  const say = (t, bad) => { msg.textContent = t; msg.className = bad ? 'err' : ''; };

  const labelled = (text, el) => { const l = document.createElement('label'); l.append(text, el); return l; };
  const input = (value, max) => { const i = document.createElement('input'); i.value = value; i.maxLength = max; return i; };
  const button = (text, fn) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn ghost sm'; b.textContent = text; b.addEventListener('click', fn); return b;
  };
  function move(i, d) {
    const j = i + d;
    if (j < 0 || j >= services.length) return;
    [services[i], services[j]] = [services[j], services[i]];
    draw();
  }
  function row(s, i) {
    const box = document.createElement('fieldset'); box.className = 'svc';
    const legend = document.createElement('legend'); legend.textContent = `Service ${i + 1}`;
    const title = input(s.title, 60), price = input(s.price, 40);
    const desc = document.createElement('textarea'); desc.rows = 3; desc.maxLength = 300; desc.value = s.description;
    const sel = document.createElement('select');
    for (const c of ['', ...new Set([...cats, s.category].filter(Boolean))]) {
      const o = document.createElement('option'); o.value = c; o.textContent = c || 'No button'; sel.append(o);
    }
    sel.value = s.category || '';
    title.addEventListener('input', () => { s.title = title.value; });
    desc.addEventListener('input', () => { s.description = desc.value; });
    price.addEventListener('input', () => { s.price = price.value; });
    sel.addEventListener('change', () => { s.category = sel.value; });
    const bar = document.createElement('div'); bar.className = 'svc-bar';
    bar.append(button('Move up', () => move(i, -1)), button('Move down', () => move(i, 1)),
      button('Remove', () => { services.splice(i, 1); draw(); }));
    box.append(legend, labelled('Title', title), labelled('Description', desc),
      labelled('Price (for example From K1,200)', price), labelled('Button shows photos from', sel), bar);
    return box;
  }
  function draw() {
    list.replaceChildren(...services.map(row));
    $('svc-add').hidden = services.length >= MAX;
  }
  async function load() {
    const [c, photos] = await Promise.all([fetch('/api/content').then(r => r.json()), fetch('/api/photos').then(r => r.json())]);
    cats = [...new Set(photos.map(p => p.category).filter(Boolean))];
    services = c.services;
    $('about-h').value = c.about.heading; $('about-b').value = c.about.body;
    draw();
  }

  $('svc-add').addEventListener('click', () => {
    services.push({ title: '', description: '', price: '', category: '' }); draw(); say('');
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    say('Saving...');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about: { heading: $('about-h').value, body: $('about-b').value }, services })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save.');
      say('Saved. The site is updated.');
    } catch (err) { say(err.message, true); }
  });
  $('content-reset').addEventListener('click', async () => {
    if (!confirm('Replace your edited text with the default text?')) return;
    try {
      const res = await fetch('/api/admin/content', { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not reset.');
      await load(); say('Reset to the default text.');
    } catch (err) { say(err.message, true); }
  });
  load().catch(() => say('Could not load the text. Refresh the page.', true));
})();
