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

// Same as RESPONSE_SCHEMA plus the biomarker panel the model reads off the
// uploaded image/PDF itself, in the same shape the frontend table expects.
const EXTRACTION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    panel: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.STRING },
          unit: { type: Type.STRING },
          range: { type: Type.STRING },
          flag: { type: Type.STRING, enum: ["normal", "high", "low"] },
        },
        required: ["name", "value", "unit", "range", "flag"],
      },
    },
    summary: { type: Type.STRING },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["panel", "summary", "recommendations"],
};

const BOUNDARIES = `Role and boundaries:
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
  discuss lab results with their treating physician.`;

const SYSTEM_PROMPT = `You are the AI Blood Test Analysis assistant inside "Virtual Smart
Hospital" (المستشفى الذكي الافتراضي), a virtual hospital platform. A patient is looking at
their own Complete Blood Count (CBC) panel and wants a plain-language explanation.

${BOUNDARIES}

Keep "recommendations" to 3-5 short items.`;

const EXTRACTION_SYSTEM_PROMPT = `You are the AI Blood Test Analysis assistant inside "Virtual
Smart Hospital" (المستشفى الذكي الافتراضي), a virtual hospital platform. A patient has
uploaded a photo or PDF of their own lab report.

Extraction task:
- Read every biomarker/test row you can find in the document (e.g. CBC, metabolic panel,
  lipid panel, HbA1c — whatever is actually present).
- For each one, output { name, value, unit, range, flag }: "range" is the reference range
  printed on the report if present, otherwise a well-established standard adult reference
  range for that marker. "flag" is "high"/"low" if the value falls outside that range,
  otherwise "normal".
- If the document contains no recognizable lab values at all (wrong file, unreadable image,
  not a lab report), return an empty "panel" array and use "summary" to explain that plainly
  and ask the patient to try a clearer photo or the correct file — leave "recommendations" empty.

${BOUNDARIES}

Keep "recommendations" to 3-5 short items. Base the summary and recommendations only on
markers you actually extracted.`;

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

  const parsed = parseAnalysisJson(response.text, lang);
  logLabsAnalysis({ sessionToken, panel, summary: parsed.summary, source: "manual" });
  return parsed;
}

/**
 * Reads an uploaded lab report image/PDF directly (Gemini vision/document
 * understanding) and returns both the extracted biomarker panel and the
 * same plain-language analysis — one round trip instead of extract-then-
 * analyze, so the patient isn't waiting through two model calls.
 *
 * @param {{ sessionToken: string, fileBuffer: Buffer, mimeType: string, lang: 'ar'|'en' }} params
 * @returns {Promise<{ panel: Array<object>, summary: string, recommendations: string[] }>}
 */
export async function extractAndAnalyzeBloodTest({ sessionToken, fileBuffer, mimeType, lang }) {
  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      { inlineData: { mimeType, data: fileBuffer.toString("base64") } },
      { text: `lang: ${lang}` },
    ],
    config: {
      systemInstruction: EXTRACTION_SYSTEM_PROMPT,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingLevel: "low" },
      responseMimeType: "application/json",
      responseSchema: EXTRACTION_RESPONSE_SCHEMA,
    },
  });

  const parsed = parseAnalysisJson(response.text, lang, { withPanel: true });
  logLabsAnalysis({ sessionToken, panel: parsed.panel, summary: parsed.summary, source: "upload" });
  return parsed;
}

function parseAnalysisJson(raw, lang, { withPanel = false } = {}) {
  const fallback = {
    ...(withPanel ? { panel: [] } : {}),
    summary: lang === "ar"
      ? "عذرًا، ما قدرنا نجهز التحليل الآن. حاول مرة أخرى بعد قليل."
      : "Sorry, we couldn't prepare the analysis right now. Please try again shortly.",
    recommendations: [],
  };

  try {
    const jsonText = extractJson((raw || "").trim());
    const candidate = JSON.parse(jsonText);
    if (typeof candidate.summary !== "string" || !Array.isArray(candidate.recommendations)) {
      return fallback;
    }
    const result = {
      summary: candidate.summary.slice(0, 2000),
      recommendations: candidate.recommendations
        .filter((r) => typeof r === "string")
        .slice(0, 8)
        .map((r) => r.slice(0, 400)),
    };
    if (withPanel) {
      if (!Array.isArray(candidate.panel)) return fallback;
      result.panel = candidate.panel
        .filter((m) => m && typeof m.name === "string" && ["normal", "high", "low"].includes(m.flag))
        .slice(0, 30)
        .map((m) => ({
          name: String(m.name).slice(0, 120),
          value: String(m.value ?? "").slice(0, 20),
          unit: String(m.unit ?? "").slice(0, 30),
          range: String(m.range ?? "").slice(0, 40),
          flag: m.flag,
        }));
    }
    return result;
  } catch {
    // Model didn't return clean JSON — fall back rather than showing raw/malformed text.
    return fallback;
  }
}

// Models occasionally wrap JSON in ```json fences despite instructions not to.
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : text;
}
