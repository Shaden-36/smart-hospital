import { GoogleGenAI, Type } from "@google/genai";
import { logLabsAnalysis } from "./security.js";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-3.6-flash";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["summary", "recommendations"],
};

const SYSTEM_PROMPT = `You are the AI Blood Test Analysis assistant inside "Virtual Smart
Hospital" (المستشفى الذكي الافتراضي), a virtual hospital platform. A patient is looking at
their own Complete Blood Count (CBC) panel and wants a plain-language explanation.

Role and boundaries:
- Explain what each flagged (high/low) marker generally means in plain language, and
  briefly note markers that are normal without dwelling on them.
- Never state or imply a specific diagnosis. You may mention general, well-established
  associations (e.g. low hemoglobin can relate to anemia) but always frame these as
  possibilities a physician would need to confirm with further evaluation, not conclusions.
- Never recommend a specific medication, dosage, or supplement amount.
- Recommendations should be general, safe lifestyle/follow-up guidance (e.g. "discuss
  these results with your physician", "consider iron-rich foods", "ask your doctor whether
  a follow-up test is needed") — not a treatment plan.
- If multiple markers together suggest something that could be urgent (e.g. very low
  hemoglobin, very high glucose markers), say clearly that the patient should follow up
  with a physician soon, without alarmism and without diagnosing.
- Match the language of the "lang" field in the request — Arabic or English.
- You are not a substitute for professional medical care, and the patient should always
  discuss lab results with their treating physician.

Keep "recommendations" to 3-5 short items.`;

/**
 * @param {{ sessionToken: string, panel: Array<{name:string,value:number|string,unit:string,range:string,flag:string}>, lang: 'ar'|'en' }} params
 * @returns {Promise<{ summary: string, recommendations: string[] }>}
 */
export async function getBloodTestAnalysis({ sessionToken, panel, lang }) {
  const panelDescription = panel
    .map((m) => `${m.name}: ${m.value} ${m.unit} (reference ${m.range}) — flagged ${m.flag}`)
    .join("\n");

  const userMessage = `lang: ${lang}\n\nCBC panel:\n${panelDescription}`;

  const response = await client.models.generateContent({
    model: MODEL,
    contents: userMessage,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingLevel: "low" }, // fixed-shape JSON task, doesn't need deep reasoning
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const raw = response.text?.trim() || "";

  const fallback = {
    summary: lang === "ar"
      ? "عذرًا، ما قدرنا نجهز التحليل الآن. حاول مرة أخرى بعد قليل."
      : "Sorry, we couldn't prepare the analysis right now. Please try again shortly.",
    recommendations: [],
  };

  let parsed = fallback;
  try {
    const jsonText = extractJson(raw);
    const candidate = JSON.parse(jsonText);
    if (typeof candidate.summary === "string" && Array.isArray(candidate.recommendations)) {
      parsed = {
        summary: candidate.summary.slice(0, 2000),
        recommendations: candidate.recommendations
          .filter((r) => typeof r === "string")
          .slice(0, 8)
          .map((r) => r.slice(0, 400)),
      };
    }
  } catch {
    // Model didn't return clean JSON — fall back rather than showing raw/malformed text.
  }

  logLabsAnalysis({ sessionToken, panel, summary: parsed.summary });
  return parsed;
}

// Models occasionally wrap JSON in ```json fences despite instructions not to.
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : text;
}
