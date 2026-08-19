# Security & Compliance Architecture — Virtual Smart Hospital

This repo ships the **frontend only**. It is built so the security model
described below can be wired up on the backend without changing the UI.
Anything the frontend can enforce on its own is already implemented; anything
that requires a trusted server is documented here as a requirement for the
API layer.

## 1. Regulatory scope

- **HIPAA** — treat every field under `المستشفى/الاستشارات/ملفي الطبي/التحاليل`
  (appointments, consultations, EHR, labs) as Protected Health Information
  (PHI). No PHI may be logged, cached in a service worker, or sent to
  analytics/error-tracking tools without de-identification.
- **Saudi NDMO / PDPL** — data residency (KSA-hosted storage/processing),
  explicit consent capture for data processing, and a data-subject
  access/erasure workflow are backend requirements, not implementable from
  a static frontend.

## 2. Transport & session security

| Concern | Requirement |
|---|---|
| Transport | HTTPS only (HSTS, TLS 1.2+), no mixed content |
| Auth token | JWT issued by the server, stored in an **HttpOnly, Secure, SameSite=Strict** cookie — never `localStorage`/`sessionStorage` (JS-readable storage is XSS-exfiltratable) |
| Session fixation | Rotate the session/JWT on login and on privilege change (e.g. entering a tele-psychiatry session) |
| CSRF | Double-submit or synchronizer token on every state-changing request. `js/security.js#getCsrfToken()` shows the client-side half (token minted per session, attached to form submissions); the server must validate it and reject requests without a match |

## 3. Content Security Policy

Implemented via `<meta http-equiv="Content-Security-Policy">` in
[index.html](index.html) for this static build. **In production, send it as
a real HTTP response header** — only a header supports `frame-ancestors` and
`report-uri`/`report-to` for violation telemetry.

```
default-src 'self';
script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net;
style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
font-src https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

`style-src 'unsafe-inline'` is a known tradeoff of using the Tailwind CDN
build (it injects a `<style>` tag at runtime) and this page's `style=""`
attributes. Swapping to a compiled Tailwind CSS file (via the Tailwind CLI/
PostCSS, once Node.js is available in the target environment) removes the
need for it entirely.

## 4. Input handling (XSS / SQLi)

- **XSS**: every render path that interpolates data (mock or real) funnels
  through `Security.sanitize()` in [js/security.js](js/security.js) before
  touching `innerHTML`. Free-text user input (chat messages, form fields) is
  inserted via `textContent`, never `innerHTML`, so it can never execute as
  markup.
- **SQLi**: not directly relevant to a static frontend, but the API layer
  this UI talks to must use parameterized queries / an ORM — never string-
  concatenated SQL — for every endpoint backing the forms in this UI
  (appointment booking, symptom check-in, lab upload metadata, etc.).
- All `<form>` inputs use `maxlength`, `type`, and `required` as a first line
  of defense; **these are UX affordances, not security controls** — the
  server must re-validate everything.

## 5. Tele-psychiatry & AI mental-health anonymity

- Video/audio sessions (`الطب النفسي عن بُعد`) must run over an **E2EE**
  transport (e.g. SFU with per-session key exchange such as WebRTC + Insertable
  Streams, or a vendor that guarantees E2EE) so the platform operator cannot
  access session media. **Not implemented** — no video/audio transport exists
  in this build.
- The AI mental-health chat is **implemented end-to-end** in
  [server/](server/): it uses an **anonymous session token**
  (`Security.getAnonymousSessionToken()` in [js/security.js](js/security.js)),
  generated client-side and never derived from the patient's name/ID, sent to
  the backend as `sessionToken`. The backend ([server/src/security.js](server/src/security.js))
  logs transcripts keyed only by that token, to a store
  (`server/data/ai-chat-transcripts.jsonl`) physically separate from any PHI
  store — so a compromised chat log cannot be trivially joined back to the
  medical record. In production, replace the JSONL file with a real
  anonymous-transcript store, still joined to identity (if ever) only through
  a server-side-only mapping table with its own stricter access control.
- **Crisis safety layer** ([server/src/aiChat.js](server/src/aiChat.js)):
  every message is checked against a keyword net
  (`detectCrisis()`) *before* it reaches the model. A match short-circuits
  to a fixed, warm safety message (pointing to the app's own Emergency SOS,
  a trusted person, and local emergency numbers) and logs an escalation to
  `server/data/escalations.jsonl` — the message is never sent to the model.
  As defense in depth, the model's own system prompt separately instructs it
  to redirect toward real help on any risk signal the keyword net misses.
  In production, `logEscalation()` must page an actual on-call
  clinical/crisis team, not just write to disk.

## 6. Emergency SOS override

`الطوارئ` → SOS uses a **dedicated token bucket**
(`Security.emergencyBucket` in [js/security.js](js/security.js)) with a
higher capacity/refill rate than the general-purpose UI actions bucket
(`Security.generalBucket`). This means:

- A genuine panic press is never throttled by unrelated app traffic (chat
  messages, uploads, etc. draw from the general bucket).
- It is **not unlimited** — repeated automated triggers still get
  rate-limited, which is the mitigation against a client script hammering
  the SOS endpoint as a DDoS vector.
- The backend must apply the same pattern at the API gateway: a separate,
  generously-provisioned but still-validated token bucket (or equivalent,
  e.g. a leaky bucket keyed by device/session) for the `/emergency/sos`
  endpoint, distinct from the general API rate limiter, plus anomaly
  detection (e.g. same device firing SOS repeatedly in a short window)
  before auto-dispatching real ambulance resources.

## 7. What still needs a backend

This frontend renders mock data and simulates every network call. Before
going live, the following must exist server-side: authenticated REST/GraphQL
API with RBAC (patient vs. clinician vs. admin), audit logging of every PHI
read/write (HIPAA requirement), encryption at rest for PHI, virus scanning
on lab-result uploads, real geolocation-to-hospital routing, and a real
ambulance-dispatch integration.
