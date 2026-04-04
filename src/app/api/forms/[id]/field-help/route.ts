import { type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const localeLanguageMap: Record<string, string> = {
  de: "Deutsch", en: "Englisch", tr: "Türkisch", ar: "Arabisch", uk: "Ukrainisch",
  pl: "Polnisch", ro: "Rumänisch", fa: "Persisch", ru: "Russisch",
  zh: "Chinesisch", sr: "Serbisch", hr: "Kroatisch", bg: "Bulgarisch", fr: "Französisch", es: "Spanisch", it: "Italienisch",
};

/**
 * POST /api/forms/[id]/field-help — KI erklärt ein einzelnes Formularfeld
 * Sehr günstig (~0,002 €) da nur Text, kein PDF.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fieldLabel, fieldType, formTitle } = body;

    if (!fieldLabel || !formTitle) {
      return Response.json({ error: "Fehlende Parameter." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "KI nicht konfiguriert." }, { status: 500 });
    }

    const locale = request.headers.get("x-locale") || "de";
    const language = localeLanguageMap[locale] || "Deutsch";

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are an expert on German government forms. Explain in ${language} what should be entered in this field.

Form: "${formTitle}"
Field name (exactly as in the PDF): "${fieldLabel}" (Type: ${fieldType || "text"})

IMPORTANT:
- Write your ENTIRE response in ${language}.
- 2-3 sentences maximum: What goes in this field? Format? Example?
- Pay attention to the EXACT field name. If it says "Jahr" (year), only the YEAR should be entered (e.g. "2026"), not a full date. If it says "PLZ", only the postal code. If it says "Hausnr", only the house number.
- Form values must always be in German (e.g. "Ja"/"Nein").
- No markdown, no asterisks.`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const help = textBlock && textBlock.type === "text" ? textBlock.text : "Keine Hilfe verfügbar.";

    return Response.json({ help });
  } catch (error) {
    console.error("Field-Help Fehler:", error);
    return Response.json({ error: "Hilfe konnte nicht geladen werden." }, { status: 500 });
  }
}
