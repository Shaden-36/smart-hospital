import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const TRANSCRIPTS_FILE = path.join(DATA_DIR, "ai-chat-transcripts.jsonl");
const ESCALATIONS_FILE = path.join(DATA_DIR, "escalations.jsonl");
const LABS_ANALYSIS_FILE = path.join(DATA_DIR, "labs-analysis.jsonl");

fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------------------------- CSRF (double-submit) ---------------------------- */

export function generateCsrfToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function verifyCsrf(req) {
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.get("X-CSRF-Token");
  return Boolean(cookieToken) && Boolean(headerToken) && cookieToken === headerToken;
}

/* ---------------------------- Token-bucket rate limiting ---------------------------- */
// Mirrors the client-side buckets in js/security.js — this is the
// server-authoritative copy; the frontend one is only a UX nicety.

class TokenBucket {
  constructor({ capacity, refillPerSecond }) {
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    this.tokens = capacity;
    this.last = Date.now();
  }
  tryConsume(cost = 1) {
    const now = Date.now();
    const elapsed = (now - this.last) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSecond);
    this.last = now;
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }
}

const buckets = new Map();

/**
 * Per-key (anonymous session token, or IP as fallback) rate limiter.
 * Deliberately modest — a supportive chat doesn't need high throughput,
 * and this is the layer that stops a single anonymous session from
 * hammering the Claude API.
 */
export function consumeChatToken(key) {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = new TokenBucket({ capacity: 8, refillPerSecond: 0.2 }); // ~1 msg/5s sustained, burst of 8
    buckets.set(key, bucket);
  }
  return bucket.tryConsume(1);
}

// Separate bucket/map for lab analysis — a heavier, less frequent action
// than a chat message, so it gets its own (stricter) ceiling rather than
// sharing the chat bucket's budget.
const labsBuckets = new Map();

export function consumeLabsToken(key) {
  let bucket = labsBuckets.get(key);
  if (!bucket) {
    bucket = new TokenBucket({ capacity: 3, refillPerSecond: 0.05 }); // ~1 req/20s sustained, burst of 3
    labsBuckets.set(key, bucket);
  }
  return bucket.tryConsume(1);
}

/* ---------------------------- Crisis / self-harm detection ---------------------------- */
// Fast-path keyword net. Deliberately broad and low-precision — false
// positives (routing to the safety message) are the acceptable failure
// mode here, not false negatives. This is a first line of defense, not
// the only one: SYSTEM_PROMPT in aiChat.js also instructs the model to
// redirect on any risk signal it detects that this list misses.

const CRISIS_PATTERNS = [
  // Arabic
  /انتحار/, /اقتل\s*نفسي/, /أقتل\s*نفسي/, /اذي\s*نفسي/, /أؤذي\s*نفسي/,
  /مايستاهل\s*أعيش/, /ما\s*يستاهل\s*العيش/, /أبي\s*أموت/, /ابغى\s*أموت/,
  /مافيه\s*داعي\s*أعيش/, /أنهي\s*حياتي/,
  // English
  /suicid/i, /kill myself/i, /end my life/i, /hurt myself/i, /self.?harm/i,
  /want to die/i, /don'?t want to (live|be alive)/i,
];

export function detectCrisis(text) {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

/* ---------------------------- Anonymized logging ---------------------------- */
// Transcripts are keyed ONLY by the client-generated anonymous session
// token (never patient ID/name) and stored in a file physically separate
// from any PHI store. See SECURITY.md § 5.

function appendJsonl(file, record) {
  fs.appendFile(file, JSON.stringify(record) + "\n", (err) => {
    if (err) console.error("Failed to write log:", err);
  });
}

export function logTranscriptTurn({ sessionToken, role, text }) {
  appendJsonl(TRANSCRIPTS_FILE, {
    sessionToken,
    role,
    text: text.slice(0, 4000),
    at: new Date().toISOString(),
  });
}

export function logLabsAnalysis({ sessionToken, panel, summary, source = "manual" }) {
  appendJsonl(LABS_ANALYSIS_FILE, {
    sessionToken,
    source, // "manual" (mock/edited panel) or "upload" (extracted from a file)
    panel,
    summary: summary.slice(0, 4000),
    at: new Date().toISOString(),
  });
}

export function logEscalation({ sessionToken, reason }) {
  appendJsonl(ESCALATIONS_FILE, {
    sessionToken,
    reason,
    at: new Date().toISOString(),
  });
  // In production: page the on-call clinical/crisis team here (e.g. via
  // a queue or webhook) instead of only logging to disk.
  console.warn(`[ESCALATION] session=${sessionToken} reason=${reason}`);
}

/* ---------------------------- Input validation ---------------------------- */

const SESSION_TOKEN_RE = /^anon_[0-9]{1,100}$/;

export function isValidSessionToken(token) {
  return typeof token === "string" && SESSION_TOKEN_RE.test(token);
}

export function isValidMessage(message) {
  return typeof message === "string" && message.trim().length > 0 && message.length <= 1000;
}

const PANEL_FIELD_MAX = 120;
const PANEL_MAX_ITEMS = 30;

/**
 * A blood-panel payload is a small array of numeric biomarker readings
 * (name/value/unit/range/flag) — no patient name, ID, or free text from
 * the user. Bounds are generous for a real CBC/metabolic panel but reject
 * anything shaped to smuggle a large prompt-injection payload through a
 * field that's supposed to hold "11.2" or "Hemoglobin".
 */
export function isValidPanel(panel) {
  if (!Array.isArray(panel) || panel.length === 0 || panel.length > PANEL_MAX_ITEMS) return false;
  return panel.every((item) => {
    if (!item || typeof item !== "object") return false;
    const { name, value, unit, range, flag } = item;
    if (typeof name !== "string" || name.length === 0 || name.length > PANEL_FIELD_MAX) return false;
    if (typeof value !== "number" && typeof value !== "string") return false;
    if (String(value).length > 20) return false;
    if (typeof unit !== "string" || unit.length > 30) return false;
    if (typeof range !== "string" || range.length > 40) return false;
    if (!["normal", "high", "low"].includes(flag)) return false;
    return true;
  });
}

/* ---------------------------- Lab file upload ---------------------------- */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // matches the 10MB the frontend advertises

const ALLOWED_UPLOAD_MIMES = new Set(["image/jpeg", "image/png", "application/pdf"]);

export function isValidUploadMime(mimetype) {
  return ALLOWED_UPLOAD_MIMES.has(mimetype);
}
