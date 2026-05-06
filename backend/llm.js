const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

async function analyzeNote(content) {
  const prompt = `Extract a title and summary from the note below. Use ONLY words that appear in the note — do NOT paraphrase or invent new words. Preserve all characters exactly as written, including Polish letters (ą ę ó ś ź ż ć ń ł).
Return ONLY valid JSON: {"title":"<max 5 words from the note>","summary":"<1 sentence using original wording>"}
Note: ${content.slice(0, 300)}`;

  try {
    const res = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      { model: OLLAMA_MODEL, prompt, stream: false },
      { responseEncoding: "utf8" }
    );

    const raw = res.data.response.trim();
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!json) throw new Error("No JSON in response");

    return JSON.parse(json);
  } catch (err) {
    console.error("LLM error:", err.message);
    // fallback jeśli LLM niedostępny
    return {
      title: content.split(" ").slice(0, 5).join(" "),
      summary: content.slice(0, 100),
    };
  }
}

module.exports = { analyzeNote };
