const os = require('os'), path = require('path'), fs = require('fs');
const { test, before, after } = require('node:test');
const assert = require('node:assert');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-'));
Object.assign(process.env, {
  DB_PATH: path.join(tmp, 't.db'), UPLOAD_DIR: path.join(tmp, 'up'),
  ADMIN_USERNAME: 'owner', ADMIN_PASSWORD: 'correct-horse-battery', SESSION_SECRET: 'x'.repeat(40),
  SITE_WHATSAPP: '+260 97 123-4567', CONTACT_EMAIL: 'bad email', INSTAGRAM_URL: 'https://instagram.com/x',
  WHATSAPP_TOKEN: '', WHATSAPP_PHONE_ID: '', OWNER_WHATSAPP: '260971234567'
});
const { createApp } = require('../app');

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
let server, base, cookie;
const json = (body) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const upload = (buf, type, title = 'Test shot') => {
  const fd = new FormData();
  fd.append('photo', new Blob([buf], { type }), 'x.png');
  fd.append('title', title); fd.append('layout', 'wide');
  return fetch(base + '/api/admin/photos', { method: 'POST', headers: { cookie: cookie || '' }, body: fd });
};

before(() => new Promise(r => { server = createApp().listen(0, () => { base = `http://localhost:${server.address().port}`; r(); }); }));
after(() => server.close());

test('pages load', async () => {
  for (const p of ['/', '/admin.html']) assert.strictEqual((await fetch(base + p)).status, 200);
});
test('public settings expose only clean contact details', async () => {
  const s = await (await fetch(base + '/api/settings')).json();
  assert.deepStrictEqual(s, { whatsapp: '260971234567', email: '', instagram: 'https://instagram.com/x' });
});
test('gallery is seeded and public', async () => {
  const photos = await (await fetch(base + '/api/photos')).json();
  assert.strictEqual(photos.length, 7);
  assert.ok(!('file' in photos[0]));
});
test('contact validates, traps bots, reports missing setup', async () => {
  assert.strictEqual((await fetch(base + '/api/contact', json({ name: 'A', message: 'hi' }))).status, 400);
  assert.strictEqual((await fetch(base + '/api/contact', json({ name: 'Bot', message: 'spam spam', website: 'x' }))).status, 200);
  const ok = await fetch(base + '/api/contact', json({ name: 'Lee', contact: '0977', message: 'Wedding in June' }));
  assert.strictEqual(ok.status, 200);
  const body = await ok.json();
  assert.match(body.waLink, /^https:\/\/wa\.me\/260971234567\?text=/);
  assert.match(decodeURIComponent(body.waLink), /Wedding in June/);
});
test('admin routes reject visitors', async () => {
  assert.strictEqual((await upload(PNG, 'image/png')).status, 401);
  assert.strictEqual((await fetch(base + '/api/admin/photos/1', { method: 'DELETE' })).status, 401);
  assert.strictEqual((await fetch(base + '/api/admin/enquiries')).status, 401);
  assert.strictEqual((await fetch(base + '/api/admin/me', { headers: { cookie: 'admin_session=fake.token' } })).status, 401);
});
test('wrong password fails, right password logs in', async () => {
  assert.strictEqual((await fetch(base + '/api/admin/login', json({ username: 'owner', password: 'nope' }))).status, 401);
  assert.strictEqual((await fetch(base + '/api/admin/login', json({ username: 'ghost', password: 'nope' }))).status, 401);
  const ok = await fetch(base + '/api/admin/login', json({ username: 'owner', password: 'correct-horse-battery' }));
  assert.strictEqual(ok.status, 200);
  const set = ok.headers.get('set-cookie');
  assert.match(set, /HttpOnly/); assert.match(set, /SameSite=Strict/);
  cookie = set.split(';')[0];
});
test('admin can upload, it appears, and can be deleted', async () => {
  const res = await upload(PNG, 'image/png');
  assert.strictEqual(res.status, 201);
  const photo = await res.json();
  assert.strictEqual(photo.layout, 'wide');
  assert.strictEqual((await fetch(base + photo.src)).status, 200);
  assert.strictEqual((await (await fetch(base + '/api/photos')).json()).length, 8);
  const del = await fetch(base + `/api/admin/photos/${photo.id}`, { method: 'DELETE', headers: { cookie } });
  assert.strictEqual(del.status, 200);
  assert.strictEqual((await fetch(base + photo.src)).status, 404);
});
test('admin sees and deletes saved enquiries', async () => {
  const rows = await (await fetch(base + '/api/admin/enquiries', { headers: { cookie } })).json();
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].name, 'Lee');
  assert.strictEqual((await fetch(base + `/api/admin/enquiries/${rows[0].id}`, { method: 'DELETE', headers: { cookie } })).status, 200);
});
test('upload rejects fake images, wrong types and missing titles', async () => {
  assert.strictEqual((await upload(Buffer.from('<script>alert(1)</script>'), 'image/png')).status, 400);
  assert.strictEqual((await upload(Buffer.from('hello'), 'text/html')).status, 400);
  assert.strictEqual((await upload(PNG, 'image/png', '')).status, 400);
  assert.strictEqual(fs.readdirSync(process.env.UPLOAD_DIR).length, 0); // rejected files are cleaned up
});
