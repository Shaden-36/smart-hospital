# Virtual Smart Hospital — Frontend

A bilingual (Arabic RTL primary / English LTR toggle) patient-facing UI for
a virtual hospital platform: home dashboard, medical consultations, unified
EHR, labs & diagnostics, e-pharmacy, infectious-disease isolation room,
health education, and smart emergency SOS.

## Stack

Static HTML5 + Tailwind CSS (CDN) + vanilla JS + Chart.js. No build step,
no Node.js dependency — this was a deliberate choice because this
environment has no Node.js/npm installed. Everything runs by opening
[index.html](index.html) directly, or serving the folder with any static
file server.

## Run it

```
# any static server works, e.g.:
npx serve .
# or just double-click index.html
```

## Structure

```
index.html            All 8 views (tab-switched, one active at a time)
css/styles.css         Design tokens (gradients, colors, shadows), components
js/data.js             Mock data (patient, vitals, appointments, labs, ...)
js/i18n.js              AR/EN translation dictionary
js/security.js          sanitize(), CSRF token, anonymous session token, token-bucket rate limiting
js/charts.js             Chart.js line chart (Blood Pressure / Blood Sugar / Pulse)
js/tailwind-config.js   Tailwind CDN theme extension (external, keeps CSP script-src clean)
js/app.js               App controller: nav, i18n toggle, rendering, all interactions
server/                 Real Node/Express backend for the AI Mental Health Support chat and AI Blood Test Analysis (Gemini API) — see server/README.md
SECURITY.md             Full security/compliance architecture (HIPAA, NDMO/PDPL, CSP, CSRF, E2EE, SOS rate limiting)
```

## Notes

- All patient data is mock data for "شادن عوده العنزي" — see [js/data.js](js/data.js).
- The language toggle switches `<html lang/dir>` and every `data-i18n`-tagged
  element; RTL Arabic is the default.
- The SOS button requires a ~1.1s press-and-hold before it dispatches (visible
  fill animation) to prevent accidental taps, then requests geolocation.
- See [SECURITY.md](SECURITY.md) for what's implemented client-side vs. what
  the backend must enforce (auth, PHI storage, E2EE media, real rate limiting).
- The AI Mental Health Support chat (تبويب الاستشارات الطبية) is wired to a
  real backend in [server/](server/) — it calls the Gemini API server-side,
  runs a crisis-keyword safety check before every model call, and rate-limits
  per anonymous session. It isn't running by default (this environment has no
  Node.js); start it per [server/README.md](server/README.md) and the chat
  in the browser will pick it up automatically. Without it running, the chat
  UI shows a clear "backend not reachable" message instead of a fake reply.
- The AI Blood Test Analysis card (تبويب التحاليل والفحوصات) sends the mock
  CBC panel's numeric values (no patient name/ID) to the same backend, which
  calls Gemini server-side to produce a plain-language analysis and
  general, non-diagnostic recommendations — same CSRF/rate-limit protection
  as the chat, plus its own stricter per-session limit. See
  [server/README.md](server/README.md) for the `/api/labs-analysis`
  endpoint. Without the backend running, the card shows an inline error
  instead of a fake result.
- To move to a real build pipeline (compiled Tailwind, bundling, a framework
  like Next.js as the original request allowed) once Node.js is available:
  the component boundaries in `js/app.js` map 1:1 to what would become React
  components per tab.
