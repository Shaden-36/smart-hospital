import { GoogleGenAI } from "@google/genai";
import { detectCrisis, logEscalation, logTranscriptTurn } from "./security.js";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-3.6-flash";

const SYSTEM_PROMPT = `You are the AI Mental Health Support assistant inside "Virtual Smart
Hospital" (المستشفى الذكي الافتراضي), a virtual hospital platform.

Role and boundaries:
- You provide brief, warm, supportive listening — not therapy, not diagnosis, not medical advice.
- Never diagnose a condition or recommend a specific medication or dosage.
- Encourage the person to book a real consultation (via the app's tele-psychiatry
  or general consultation booking) when that seems helpful — but don't be pushy about it.
- This conversation is anonymous: you are not told the user's name or medical record,
  and you must never ask for identifying information (full name, national ID, exact address).
- If anything in the message suggests the person may be at risk of harming themselves
  or others — even subtly, even if not an explicit statement — stop being a normal
  conversational partner. Respond with warmth, take it seriously, gently encourage them
  to reach out to a real person right now (a trusted person in their life, or the
  platform's Emergency SOS / a crisis line), and keep your response short and grounded.
  Do not try to "solve" a crisis yourself.
- Keep replies concise (roughly 3-6 sentences). Match the language the user writes in
  (Arabic or English) — default to Arabic if unclear.
- You are not a substitute for professional mental health care.`;

const CRISIS_REPLY = {
  ar: "أنا سامعتك، وأشكرك إنك شاركتني هذا. اللي تحس فيه مهم، وما تحتاج تمر فيه لحالك. لو تقدر الحين، تواصل مع شخص تثق فيه، أو استخدم زر الطوارئ (SOS) في التطبيق للتواصل الفوري مع فريق طبي، أو اتصل بالطوارئ (911) أو مركز 937 التابع لوزارة الصحة. أنا موجود لأسمعك، لكن في هذه اللحظة أهم شي تكون مع إنسان حقيقي يقدر يساعدك الآن.",
  en: "I hear you, and I'm glad you told me. What you're feeling matters, and you don't have to carry it alone. If you can right now, please reach out to someone you trust, use the Emergency SOS button in this app to reach a care team immediately, or call your local emergency number. I'm here to listen, but right now the most important thing is being with a real person who can support you.",
};

/**
 * @param {{ sessionToken: string, message: string, lang: 'ar' | 'en' }} params
 * @returns {Promise<{ reply: string, escalated: boolean }>}
 */
export async function getAIReply({ sessionToken, message, lang }) {
  logTranscriptTurn({ sessionToken, role: "user", text: message });

  if (detectCrisis(message)) {
    logEscalation({ sessionToken, reason: "keyword-match" });
    const reply = CRISIS_REPLY[lang] || CRISIS_REPLY.ar;
    logTranscriptTurn({ sessionToken, role: "assistant", text: reply });
    return { reply, escalated: true };
  }

  const response = await client.models.generateContent({
    model: MODEL,
    contents: message,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 1024,
      thinkingConfig: { thinkingLevel: "low" }, // keep chat latency low; this isn't a task that benefits from deep reasoning
    },
  });

  const reply = response.text?.trim() || (lang === "ar"
    ? "عذرًا، ما قدرت أرد الحين. حاول مرة ثانية بعد قليل."
    : "Sorry, I couldn't respond just now. Please try again shortly.");

  // Defense in depth: even if the keyword net missed it, the model itself
  // is instructed to redirect on risk signals — watch for that pattern
  // and log an escalation even though we still return the model's reply.
  const modelFlaggedRisk = /(SOS|911|937|طوارئ|crisis)/i.test(reply) && detectCrisisSoft(message);
  if (modelFlaggedRisk) {
    logEscalation({ sessionToken, reason: "model-flagged" });
  }

  logTranscriptTurn({ sessionToken, role: "assistant", text: reply });
  return { reply, escalated: modelFlaggedRisk };
}

// A softer, lower-precision pass used only to decide whether to log an
// escalation when the model's own reply already looks like a safety
// redirect — not used as the primary gate (that's detectCrisis()).
function detectCrisisSoft(text) {
  return /(موت|أموت|حياتي|die|hopeless|worthless|لا فايدة)/i.test(text);
}
