const os = require('os'), path = require('path'), fs = require('fs');
const { test, before, after } = require('node:test');
const assert = require('node:assert');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pc-'));
Object.assign(process.env, {
  DB_PATH: path.join(tmp, 't.db'), UPLOAD_DIR: path.join(tmp, 'up'),
  ADMIN_USERNAME: 'owner', ADMIN_PASSWORD: 'correct-horse-battery', SESSION_SECRET: 'x'.repeat(40),
  WHATSAPP_TOKEN: '', WHATSAPP_PHONE_ID: '', OWNER_WHATSAPP: ''
});
const { createApp } = require('../app');
const defaults = require('../db/defaultContent');

let server, base, cookie;
const send = (method, body, extra = {}) => ({ method, headers: { 'Content-Type': 'application/json', ...extra }, body: body && JSON.stringify(body) });
const put = body => fetch(base + '/api/admin/content', send('PUT', body, { cookie }));
const good = { about: { heading: 'About us', body: 'One.\n\nTwo.' }, services: [{ title: 'Portraits', description: 'd', price: 'K1', category: 'Portrait' }] };

before(() => new Promise(r => { server = createApp().listen(0, () => { base = `http://localhost:${server.address().port}`; r(); }); }));
after(() => server.close());

test('content starts as the defaults and is public', async () => {
  assert.deepStrictEqual(await (await fetch(base + '/api/content')).json(), defaults);
});
test('visitors cannot edit or reset content', async () => {
  assert.strictEqual((await fetch(base + '/api/admin/content', send('PUT', good))).status, 401);
  assert.strictEqual((await fetch(base + '/api/admin/content', { method: 'DELETE' })).status, 401);
});
test('admin edits show up for everyone', async () => {
  const login = await fetch(base + '/api/admin/login', send('POST', { username: 'owner', password: 'correct-horse-battery' }));
  cookie = login.headers.get('set-cookie').split(';')[0];
  assert.strictEqual((await put(good)).status, 200);
  const c = await (await fetch(base + '/api/content')).json();
  assert.strictEqual(c.about.heading, 'About us');
  assert.strictEqual(c.services.length, 1);
  assert.strictEqual(c.services[0].category, 'Portrait');
});
test('bad input is rejected', async () => {
  assert.strictEqual((await put({ ...good, services: 'nope' })).status, 400);
  assert.strictEqual((await put({ ...good, services: Array(7).fill(good.services[0]) })).status, 400);
  assert.strictEqual((await put({ ...good, services: [{ title: '' }] })).status, 400);
  assert.strictEqual((await put({ ...good, about: { heading: '', body: 'x' } })).status, 400);
});
test('markup is stored as plain text and long values are trimmed', async () => {
  const evil = '<img src=x onerror=alert(1)>';
  await put({ about: { heading: 'Hi', body: 'x'.repeat(5000) }, services: [{ title: evil, description: '', price: '', category: '' }] });
  const c = await (await fetch(base + '/api/content')).json();
  assert.strictEqual(c.services[0].title, evil);
  assert.strictEqual(c.about.body.length, 2000);
});
test('reset brings the defaults back', async () => {
  assert.strictEqual((await fetch(base + '/api/admin/content', send('DELETE', null, { cookie }))).status, 200);
  assert.deepStrictEqual(await (await fetch(base + '/api/content')).json(), defaults);
});
