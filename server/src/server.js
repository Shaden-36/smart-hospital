import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import {
  generateCsrfToken,
  verifyCsrf,
  consumeChatToken,
  consumeLabsToken,
  isValidSessionToken,
  isValidMessage,
  isValidPanel,
} from "./security.js";
import { getAIReply } from "./aiChat.js";
import { getBloodTestAnalysis } from "./labsAnalysis.js";

const PORT = process.env.PORT || 8787;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:8080";

const app = express();

app.use(helmet());
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
    console.error("AI chat error:", err);
    res.status(502).json({ error: "upstream_error" });
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
    console.error("Labs analysis error:", err);
    res.status(502).json({ error: "upstream_error" });
  }
});

app.listen(PORT, () => {
  console.log(`AI chat backend listening on http://localhost:${PORT}`);
  console.log(`Allowing frontend origin: ${FRONTEND_ORIGIN}`);
});
