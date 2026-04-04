import { type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { locales } from "@/lib/i18n";

const localeLanguageMap: Record<string, string> = {
  de: "Deutsch", en: "Englisch", tr: "Türkisch", ar: "Arabisch", uk: "Ukrainisch",
  pl: "Polnisch", ro: "Rumänisch", fa: "Persisch", ru: "Russisch",
  zh: "Chinesisch", sr: "Serbisch", hr: "Kroatisch", bg: "Bulgarisch", fr: "Französisch", es: "Spanisch", it: "Italienisch",
};

/**
 * Erstellt den Übersetzungs-Prompt für Formular-Analysen.
 * Günstiger als eine Neuanalyse, da nur Text übersetzt wird.
 */
function buildFormTranslationPrompt(
  targetLanguage: string,
  summary: string | null,
  fields: Array<{
    id: string;
    helpText: string | null;
    instructions: string | null;
    exampleValue: string | null;
  }>
): string {
  const fieldsData = fields.map((f) => ({
    id: f.id,
    helpText: f.helpText,
    instructions: f.instructions,
    exampleValue: f.exampleValue,
  }));

  return `Du bist ein professioneller Übersetzer. Übersetze die folgenden Texte einer Formular-Analyse ins ${targetLanguage}.

Behalte die Struktur exakt bei. Übersetze NUR die Textwerte, nicht die Schlüssel oder IDs.
Fachbegriffe sollen verständlich übersetzt werden — schreibe so, dass jemand ohne Verwaltungserfahrung es versteht.

Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text oder Markdown-Formatierung.

{
  "summary": ${JSON.stringify(summary)},
  "fields": ${JSON.stringify(fieldsData)}
}`;
}

/**
 * Erstellt den Übersetzungs-Prompt für Dokument-Analysen.
 */
function buildDocumentTranslationPrompt(
  targetLanguage: string,
  summary: string | null,
  keyPoints: string[],
  nextSteps: string[],
  deadlines: string[]
): string {
  return `Du bist ein professioneller Übersetzer. Übersetze die folgenden Texte einer Dokument-Analyse ins ${targetLanguage}.

Behalte die Struktur exakt bei. Übersetze NUR die Textwerte.
Fachbegriffe sollen verständlich übersetzt werden — schreibe so, dass jemand ohne Verwaltungserfahrung es versteht.

Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text oder Markdown-Formatierung.

{
  "summary": ${JSON.stringify(summary)},
  "keyPoints": ${JSON.stringify(keyPoints)},
  "nextSteps": ${JSON.stringify(nextSteps)},
  "deadlines": ${JSON.stringify(deadlines)}
}`;
}

/**
 * JSON aus KI-Antwort extrahieren (auch aus Markdown-Codeblöcken)
 */
function extractJson(text: string): unknown {
  let jsonText = text.trim();
  const codeBlockMatch = jsonText.match(
    /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/
  );
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim();
  }
  return JSON.parse(jsonText);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Zielsprache aus Header lesen
    const targetLocale = request.headers.get("x-locale") || "de";
    if (!locales.includes(targetLocale as typeof locales[number])) {
      return Response.json(
        { error: "Ungültige Zielsprache." },
        { status: 400 }
      );
    }

    // Formular aus DB laden
    const form = await prisma.form.findUnique({
      where: { id },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
    });

    if (!form) {
      return Response.json(
        { error: "Formular nicht gefunden." },
        { status: 404 }
      );
    }

    if (form.type === "unknown") {
      return Response.json(
        { error: "Das Dokument wurde noch nicht analysiert." },
        { status: 400 }
      );
    }

    // Prüfen ob Übersetzung nötig ist
    if (form.analysisLanguage === targetLocale) {
      return Response.json(
        { error: "Das Dokument ist bereits in dieser Sprache." },
        { status: 200 }
      );
    }

    // Gecachte Übersetzung prüfen
    const existingTranslation = await prisma.formTranslation.findUnique({
      where: { formId_locale: { formId: id, locale: targetLocale } },
    });

    if (existingTranslation) {
      return Response.json({
        message: "Übersetzung aus Cache geladen.",
        cached: true,
        translation: existingTranslation,
      });
    }

    // API-Key prüfen
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Die KI-Übersetzung ist nicht konfiguriert." },
        { status: 500 }
      );
    }

    const targetLanguage = localeLanguageMap[targetLocale] || "Deutsch";
    const anthropic = new Anthropic({ apiKey });

    let translationData: Record<string, unknown>;

    if (form.type === "document") {
      // Dokument-Übersetzung
      const keyPoints = form.keyPoints ? JSON.parse(form.keyPoints) : [];
      const nextSteps = form.nextSteps ? JSON.parse(form.nextSteps) : [];
      const deadlines = form.deadlines ? JSON.parse(form.deadlines) : [];

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: buildDocumentTranslationPrompt(
              targetLanguage,
              form.summary,
              keyPoints,
              nextSteps,
              deadlines
            ),
          },
        ],
      });

      const textContent = message.content.find((b) => b.type === "text");
      if (!textContent || textContent.type !== "text") {
        return Response.json(
          { error: "Die Übersetzung hat kein Ergebnis geliefert." },
          { status: 500 }
        );
      }

      translationData = extractJson(textContent.text) as Record<string, unknown>;

      // In DB speichern
      const saved = await prisma.formTranslation.create({
        data: {
          formId: id,
          locale: targetLocale,
          summary: translationData.summary
            ? String(translationData.summary).substring(0, 5000)
            : null,
          keyPoints: Array.isArray(translationData.keyPoints)
            ? JSON.stringify(translationData.keyPoints)
            : null,
          nextSteps: Array.isArray(translationData.nextSteps)
            ? JSON.stringify(translationData.nextSteps)
            : null,
          deadlines: Array.isArray(translationData.deadlines)
            ? JSON.stringify(translationData.deadlines)
            : null,
        },
      });

      return Response.json({
        message: "Dokument erfolgreich übersetzt.",
        cached: false,
        translation: saved,
      });
    } else {
      // Formular-Übersetzung
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: buildFormTranslationPrompt(
              targetLanguage,
              form.summary,
              form.fields
            ),
          },
        ],
      });

      const textContent = message.content.find((b) => b.type === "text");
      if (!textContent || textContent.type !== "text") {
        return Response.json(
          { error: "Die Übersetzung hat kein Ergebnis geliefert." },
          { status: 500 }
        );
      }

      translationData = extractJson(textContent.text) as Record<string, unknown>;

      // Feld-Übersetzungen als JSON-Map { fieldId: { helpText, instructions, exampleValue } }
      const fieldsTranslation: Record<
        string,
        { helpText: string | null; instructions: string | null; exampleValue: string | null }
      > = {};

      if (Array.isArray(translationData.fields)) {
        for (const field of translationData.fields as Array<Record<string, unknown>>) {
          if (field.id && typeof field.id === "string") {
            fieldsTranslation[field.id] = {
              helpText: field.helpText ? String(field.helpText) : null,
              instructions: field.instructions ? String(field.instructions) : null,
              exampleValue: field.exampleValue ? String(field.exampleValue) : null,
            };
          }
        }
      }

      const saved = await prisma.formTranslation.create({
        data: {
          formId: id,
          locale: targetLocale,
          summary: translationData.summary
            ? String(translationData.summary).substring(0, 5000)
            : null,
          fields: JSON.stringify(fieldsTranslation),
        },
      });

      return Response.json({
        message: "Formular erfolgreich übersetzt.",
        cached: false,
        translation: saved,
      });
    }
  } catch (error) {
    console.error("Übersetzungs-Fehler:", error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return Response.json(
          { error: "Zu viele Anfragen. Bitte einen Moment warten." },
          { status: 429 }
        );
      }
    }

    return Response.json(
      { error: "Bei der Übersetzung ist ein Fehler aufgetreten. Bitte erneut versuchen." },
      { status: 500 }
    );
  }
}
