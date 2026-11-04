# Arbel Arts  Studio: Photography Portfolio

A photography portfolio with a public gallery, a contact form that opens WhatsApp, and a password-protected admin page where the owner uploads photos and reads enquiries. Built with Node.js, Express and SQLite, using an MVC structure.

---

## 1. Software to download (Windows 11)

| Software | Why you need it | Where |
|---|---|---|
| **Node.js LTS (22.13 or newer)** | Runs the server. This project uses Node's built-in SQLite, so no C++ build tools are needed | nodejs.org |
| **Visual Studio Code** | Your editor | code.visualstudio.com |
| **Git for Windows** | Version control and pushing to GitHub | git-scm.com |
| **GitHub account** | Stores your code; Render deploys from it | github.com |
| **DB Browser for SQLite** | Look inside `data/portfolio.db` | sqlitebrowser.org |
| **Postman** (or Thunder Client) | Test the API without the website | postman.com |
| **Render account** | Hosts the live site | render.com |
| *Optional:* **Meta developer account** | Only for automatic WhatsApp delivery (see section 7) | developers.facebook.com |

**VS Code extensions:** Live Server (optional), Prettier, ESLint, Thunder Client, DotENV, Path Intellisense, GitLens, Image Preview, Code Spell Checker.

Check your install in PowerShell: `node -v` (must show v22.13 or higher) and `git --version`.

---

## 2. First-time setup

```powershell
cd photo-portfolio
npm install
copy .env.example .env
```
Open `.env` and set `ADMIN_USERNAME`, `ADMIN_PASSWORD` (10+ characters) and `OWNER_WHATSAPP` (your number, digits only, with country code, e.g. `260971234567`). Then:

```powershell
npm run dev
```
Open http://localhost:3000 (site) and http://localhost:3000/admin.html (admin).

**What you need to log in to the admin:** the `ADMIN_USERNAME` and `ADMIN_PASSWORD` from your `.env`. Nothing else.

## 3. Commands you will use while developing

| Command | What it does |
|---|---|
| `npm run dev` | Starts the server and restarts it when you save a file |
| `npm start` | Starts the server normally (what Render runs) |
| `npm test` | Runs the 9 automated tests (temporary database, never your real data) |
| `Ctrl + C` | Stops the server |
| `Ctrl + Shift + R` | Hard refresh the browser after CSS or JS changes |

Make a `SESSION_SECRET` for production:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Put the project on GitHub (first time)

1. On github.com create a **new empty repository** (no README) and copy its URL.
2. In the project folder:
```powershell
git init
git add .
git commit -m "First version"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
git push -u origin main
```
3. After that, each time you change something:
```powershell
git add .
git commit -m "Describe the change"
git push
```
`.env`, `data/` and `uploads/` are git-ignored on purpose: they hold secrets and your photos.

---

## 5. How the site works

**Visitor (`/`)**
1. The page loads, then `script.js` fetches the photos (`GET /api/photos`) and the contact details (`GET /api/settings`).
2. The hero collage uses your newest photos. The gallery keeps each photo's natural shape, and filter buttons appear automatically from the categories you set.
3. Clicking a photo opens a viewer with Prev and Next (arrow keys work too).
4. The contact form sends `POST /api/contact`. The server **saves the enquiry** in SQLite, then returns a WhatsApp link with the message already written. The visitor's WhatsApp opens and they press Send.

**Admin (`/admin.html`)**
1. Log in. The server sets a signed `HttpOnly` cookie that lasts 8 hours.
2. Upload photos (title and category), delete photos, and read or delete enquiries.
3. New photos appear on the public site immediately.

## 6. Architecture (MVC)

```
photo-portfolio/
├── server.js                 starts the app
├── app.js                    builds Express: security headers, static files, routes
├── config/index.js           reads .env in one place
├── routes/index.js           URL → middleware → controller
├── middleware/               rateLimit, requireAdmin, upload (multer)
├── controllers/              CONTROLLERS: decide what happens for a request
│   ├── photoController.js, contactController.js, authController.js
│   └── enquiryController.js, siteController.js
├── models/                   MODELS: the only code that talks to SQLite
│   └── photoModel.js, adminModel.js, enquiryModel.js
├── services/                 password.js (scrypt), session.js (signed cookie), whatsapp.js
├── db/                       database.js (tables), seed.js (samples + admin account)
├── public/                   VIEWS: index.html, admin.html, style.css, script.js, admin.js, boot.js
├── test/api.test.js          automated tests
├── data/                     SQLite file (created on first run)
└── uploads/                  uploaded photos
```
**Request flow:** browser → route → middleware (rate limit, login check, upload check) → controller → model or service → JSON back to the view.

**Where to change things**
- Colours and fonts: top of `public/style.css`
- Studio name, headline, services and About text: `public/index.html`
- Contact email and Instagram: `CONTACT_EMAIL` and `INSTAGRAM_URL` in `.env` (they only show if you set them)
- Sample photos: delete them in admin and upload your own

---

## 7. WhatsApp: two ways

**Mode A: wa.me link (default, free, no Meta account).** Set only `OWNER_WHATSAPP`. The enquiry is saved, then WhatsApp opens with the message ready. Limits: the visitor must press Send, and you can't tell if they did. The saved enquiry in admin is your backup.

**Mode B: automatic delivery (optional).** Also set `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_ID` from a Meta developer account (developers.facebook.com, sign in with Facebook, create an app, add the WhatsApp product, open API Setup). Messages then arrive on your phone without the visitor doing anything. If Meta fails, the site falls back to Mode A. Things to know:
- The temporary token expires in about 24 hours. Make a permanent one: Meta Business Settings → Users → System Users → add one, assign the app, generate a token with `whatsapp_business_messaging` and `whatsapp_business_management`.
- A message from your business to you is outside Meta's free customer window unless you messaged the number in the last 24 hours, so you will normally need an approved template (billed per message, small). Check Meta's current pricing for your country.

## 8. Deploying to Render

| Field | Value |
|---|---|
| Type | Web Service |
| Repository | your GitHub repo |
| Root Directory | leave **empty** |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | paid (the free tier cannot attach a disk) |

**Environment variables**

| Key | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | 32+ random characters |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | your admin login |
| `OWNER_WHATSAPP` | e.g. `260971234567` |
| `CONTACT_EMAIL`, `INSTAGRAM_URL` | optional |
| `DB_PATH` | `/var/data/portfolio.db` |
| `UPLOAD_DIR` | `/var/data/uploads` |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | optional (Mode B) |

**Disk (Disks tab):** Mount Path `/var/data` (must match `DB_PATH` and `UPLOAD_DIR`), 1 GB is enough to start. Without a disk, Render wipes the database and photos on every redeploy.

**Check it worked:** open the `onrender.com` address, go to `/admin.html`, upload a photo, then trigger a redeploy. If the photo is still there, the disk is set up correctly.

Changing `ADMIN_PASSWORD` later: edit it in Render and redeploy. It is re-synced on every start and the old password stops working.

## 9. Backups

Your content is two things: `data/portfolio.db` and the `uploads/` folder. Copy both somewhere safe regularly (locally, or download them from Render's shell). Stop the server first if you copy while it is running. Photos are not in GitHub, so without a backup a lost disk means lost photos.

## 10. Security built in

- Passwords hashed with scrypt; the plain password lives only in `.env`
- Session cookie is `HttpOnly`, `SameSite=Strict`, signed, expires after 8 hours
- Uploads: JPG, PNG and WebP only, 18 MB max, real file bytes checked, random file names
- Page text from the database is inserted with `textContent`, so titles and messages cannot inject scripts
- Content Security Policy, rate limits on login and contact, hidden honeypot field against bots

**Known limits (fine for one owner):** one shared admin account, no 2FA, no audit log, logging out only clears your browser cookie, rate limits reset on restart.

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module 'node:sqlite'` | Node is too old. Install Node 22.13+ and restart VS Code |
| "Admin not set" warning | Add `ADMIN_USERNAME` and a 10+ character `ADMIN_PASSWORD` to `.env` |
| Logged out after each restart in development | Set `SESSION_SECRET` in `.env` (32+ characters) |
| `EADDRINUSE` | Port 3000 is busy. Stop the other server or change `PORT` |
| Old design still showing | Hard refresh with `Ctrl + Shift + R` |
| WhatsApp window does not open after sending | Your browser blocked the pop-up. Click the "Open WhatsApp" link under the form |
| Upload says "too large" | Max is 8 MB. Resize the photo first |
