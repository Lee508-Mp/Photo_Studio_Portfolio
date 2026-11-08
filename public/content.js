// Fills the About and Services sections from /api/content (edited in the admin page)
(async () => {
  const list = document.getElementById('services-list');
  const head = document.getElementById('about-heading');
  const body = document.getElementById('about-body');
  let c;
  try { c = await (await fetch('/api/content')).json(); } catch { return; }

  head.textContent = c.about.heading;
  body.replaceChildren(...c.about.body.split(/\n\s*\n/).filter(Boolean).map(t => {
    const p = document.createElement('p'); p.textContent = t; return p;
  }));

  list.replaceChildren();
  document.getElementById('services').hidden = !c.services.length;
  for (const s of c.services) {
    const card = document.createElement('article'); card.className = 'card';
    const h = document.createElement('h3'); h.textContent = s.title;
    const d = document.createElement('p'); d.textContent = s.description;
    card.append(h, d);
    if (s.price) { const pr = document.createElement('p'); pr.className = 'price'; pr.textContent = s.price; card.append(pr); }
    if (s.category) {
      const a = document.createElement('a');
      a.className = 'btn ghost sm'; a.href = '#work'; a.textContent = 'View photos'; a.setAttribute('aria-label', `View ${s.category} photos`);
      a.addEventListener('click', () => { // pick the matching filter button, then the page scrolls to the work
        const chip = [...document.querySelectorAll('#chips .chip')].find(x => x.textContent === s.category);
        if (chip) chip.click();
      });
      card.append(a);
    }
    list.append(card);
  }
})();
