/**
 * Client-side security helpers.
 *
 * IMPORTANT: These are frontend-layer mitigations only. Real enforcement
 * (auth, PHI access control, encryption at rest, audit logging, rate
 * limiting) MUST happen server-side. See /SECURITY.md for the full
 * architecture (HIPAA / Saudi NDMO-PDPL, CSRF, CSP, JWT handling, E2EE,
 * SOS token-bucket override).
 */

const Security = (() => {
  /**
   * Escape untrusted text before it is ever inserted via innerHTML.
   * Every render path in app.js that interpolates user input funnels
   * through this — defense against stored/reflected XSS.
   */
  function sanitize(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"'`=\/]/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#96;",
      "=": "&#61;",
      "/": "&#47;",
    }[ch]));
  }

  /**
   * Simulated CSRF token issuance. In production this is a per-session,
   * server-generated, unpredictable token embedded via a HttpOnly cookie
   * pair (double-submit) or synchronizer pattern, validated on every
   * state-changing request.
   */
  function getCsrfToken() {
    let token = sessionStorage.getItem("vsh_csrf");
    if (!token) {
      token = crypto.getRandomValues(new Uint32Array(4)).join("-");
      sessionStorage.setItem("vsh_csrf", token);
    }
    return token;
  }

  /**
   * Anonymous session token for AI mental-health / tele-psychiatry chats.
   * Never derived from patient ID or name — decoupled identity so the
   * conversation cannot be trivially linked back to the medical record.
   */
  function getAnonymousSessionToken() {
    let token = sessionStorage.getItem("vsh_anon_session");
    if (!token) {
      token = "anon_" + crypto.getRandomValues(new Uint32Array(6)).join("");
      sessionStorage.setItem("vsh_anon_session", token);
    }
    return token;
  }

  /**
   * Token-bucket limiter for general (non-emergency) actions, e.g. the
   * AI chat send button or lab upload — protects the backend from
   * client-side abuse/spam. Emergency SOS deliberately uses its own
   * bucket (see emergencyBucket) with a much higher ceiling so a panic
   * press is never throttled by unrelated app traffic — while still
   * being validated (not "unlimited") to blunt automated DDoS floods.
   */
  function createTokenBucket({ capacity, refillPerSecond }) {
    let tokens = capacity;
    let last = Date.now();
    return {
      tryConsume(cost = 1) {
        const now = Date.now();
        const elapsed = (now - last) / 1000;
        tokens = Math.min(capacity, tokens + elapsed * refillPerSecond);
        last = now;
        if (tokens >= cost) {
          tokens -= cost;
          return true;
        }
        return false;
      },
    };
  }

  const generalBucket = createTokenBucket({ capacity: 10, refillPerSecond: 1 });
  // Emergency bucket: high ceiling & fast refill so a genuine SOS is
  // never blocked, but repeated automated hits still get validated.
  const emergencyBucket = createTokenBucket({ capacity: 20, refillPerSecond: 5 });

  return {
    sanitize,
    getCsrfToken,
    getAnonymousSessionToken,
    generalBucket,
    emergencyBucket,
  };
})();
