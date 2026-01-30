const TRANSLATE_URL = "https://libretranslate.de/translate";

export async function translateEnToHi(text: string): Promise<string> {
  if (!text) return "";

  try {
    const res = await fetch(TRANSLATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: "hi",
        format: "text",
      }),
    });

    const data = await res.json();
    return data.translatedText || text;
  } catch (e) {
    console.error("Translate failed");
    return text; // fallback
  }
}
