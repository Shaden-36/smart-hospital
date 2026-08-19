import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import multer from "multer";
import {
  generateCsrfToken,
  verifyCsrf,
  consumeChatToken,
  consumeLabsToken,
  isValidSessionToken,
  isValidMessage,
  isValidPanel,
  isValidUploadMime,
  MAX_UPLOAD_BYTES,
} from "./security.js";
import { getAIReply } from "./aiChat.js";
import { getBloodTestAnalysis, extractAndAnalyzeBloodTest } from "./labsAnalysis.js";

// Memory storage only — the uploaded file (a real lab report, i.e. PHI) is
// held in RAM just long enough to forward to Gemini and is never written
// to disk. fileFilter rejects the wrong type before it's even buffered.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!isValidUploadMime(file.mimetype)) {
      return cb(new Error("invalid_mime"));
    }
    cb(null, true);
  },
});

// Distinguishes Gemini's own quota/rate-limit errors (surfaced as status 429
// from the SDK) from a genuine upstream failure — these aren't "the backend
// is down," they're "the AI provider is temporarily out of capacity," which
// the frontend should say plainly instead of pointing at server/README.md.
function sendUpstreamError(res, err, label) {
  console.error(`${label}:`, err);
  if (err?.status === 429) {
    return res.status(503).json({ error: "provider_rate_limited" });
  }
  res.status(502).json({ error: "upstream_error" });
}

const PORT = process.env.PORT || 8787;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:8080";

const app = express();

// This API is intentionally called cross-origin (frontend on :8080, this
// server on :8787) — helmet's default same-origin CORP would make the
// browser discard the response even though CORS allows it below.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST"],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Issues a CSRF token: sets it as an HttpOnly cookie AND returns it in the
// body. The frontend echoes the body value back as the X-CSRF-Token header
// on state-changing requests; verifyCsrf() checks header === cookie.
app.get("/api/csrf-token", (req, res) => {
  const token = generateCsrfToken();
  res.cookie("csrf_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 2 * 60 * 60 * 1000, // 2h
  });
  res.json({ csrfToken: token });
});

app.post("/api/ai-chat", async (req, res) => {
  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: "invalid_csrf" });
  }

  const { sessionToken, message, lang } = req.body || {};

  if (!isValidSessionToken(sessionToken)) {
    return res.status(400).json({ error: "invalid_session_token" });
  }
  if (!isValidMessage(message)) {
    return res.status(400).json({ error: "invalid_message" });
  }

  if (!consumeChatToken(sessionToken)) {
    return res.status(429).json({ error: "rate_limited" });
  }

  try {
    const { reply, escalated } = await getAIReply({
      sessionToken,
      message: message.trim(),
      lang: lang === "en" ? "en" : "ar",
    });
    res.json({ reply, escalated });
  } catch (err) {
    sendUpstreamError(res, err, "AI chat error");
  }
});

app.post("/api/labs-analysis", async (req, res) => {
  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: "invalid_csrf" });
  }

  const { sessionToken, panel, lang } = req.body || {};

  if (!isValidSessionToken(sessionToken)) {
    return res.status(400).json({ error: "invalid_session_token" });
  }
  if (!isValidPanel(panel)) {
    return res.status(400).json({ error: "invalid_panel" });
  }

  if (!consumeLabsToken(sessionToken)) {
    return res.status(429).json({ error: "rate_limited" });
  }

  try {
    const analysis = await getBloodTestAnalysis({
      sessionToken,
      panel,
      lang: lang === "en" ? "en" : "ar",
    });
    res.json(analysis);
  } catch (err) {
    sendUpstreamError(res, err, "Labs analysis error");
  }
});

app.post("/api/labs-upload", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      const code = err.message === "invalid_mime"
        ? "invalid_file_type"
        : err.code === "LIMIT_FILE_SIZE"
          ? "file_too_large"
          : "upload_error";
      return res.status(400).json({ error: code });
    }

    if (!verifyCsrf(req)) {
      return res.status(403).json({ error: "invalid_csrf" });
    }

    const { sessionToken, lang } = req.body || {};

    if (!isValidSessionToken(sessionToken)) {
      return res.status(400).json({ error: "invalid_session_token" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "missing_file" });
    }

    if (!consumeLabsToken(sessionToken)) {
      return res.status(429).json({ error: "rate_limited" });
    }

    try {
      const result = await extractAndAnalyzeBloodTest({
        sessionToken,
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        lang: lang === "en" ? "en" : "ar",
      });
      res.json(result);
    } catch (e) {
      sendUpstreamError(res, e, "Labs upload analysis error");
    }
  });
});

app.listen(PORT, () => {
  console.log(`AI chat backend listening on http://localhost:${PORT}`);
  console.log(`Allowing frontend origin: ${FRONTEND_ORIGIN}`);
});
