# Eventify — Event Management Website (React + Vite)

Steps 1–14 complete: events, filters/search, details, registration, My Events, user profile,
admin dashboard + CRUD, admin authentication, admin profile and settings.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```
Node 18+ required.

## Deploy to Netlify
`netlify.toml` and `public/_redirects` are included (build: `npm run build`, publish: `dist`,
SPA fallback so refreshing `/events/EVT001` or `/admin` works).
Either drag the `dist` folder into Netlify Drop, or connect the repo.

## Admin
- URL: `/admin` (redirects to `/admin/login` when signed out)
- Demo login: `admin@eventify.com` / `Admin@123` — change it in Admin → Profile.
- Lockout after 5 failed attempts (30 s). Session length is configurable in Settings.

## Data
Everything is stored in the browser's localStorage (keys prefixed `eventify_`). Use
Admin → Settings → Data & security to reset. This is a front-end demo: real ticketing,
payments and authentication need a backend.
