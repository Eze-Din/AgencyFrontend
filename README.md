# Agency Frontend

Setup
- Install dependencies: npm install
- Add environment variables in .env at project root:
  - VITE_API_BASE_URL=https://agency-tmh2.onrender.com/api

Run
- Development: npm run dev
- Build: npm run build
- Preview: npm run preview

Notes
- Auth is stored in localStorage under key "auth" as { user, token? }. Legacy key "loggedIn" is still written for backward compatibility.
- Owner (admin) sees: Dashboard, Cv Lists, Selected Cvs, Add Partner, Create Cv, Inactive Cvs
- Partner (user) sees: Dashboard, Cv Lists, Selected Cvs
- API client lives in src/lib/api.ts
