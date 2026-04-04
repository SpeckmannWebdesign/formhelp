import { type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

interface ExtractedField {
  label: string;
  fieldType: string;
  required: boolean;
  helpText: string;
  instructions: string;
  exampleValue: string;
}

interface FormAnalysisResult {
  type: "form";
  summary: string;
  fields: ExtractedField[];
}

interface DocumentAnalysisResult {
  type: "document";
  summary: string;
  keyPoints: string[];
  nextSteps: string[];
  deadlines: string[];
}

type AnalysisResult = FormAnalysisResult | DocumentAnalysisResult;

const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED_FIELD_TYPES = [
  "text",
  "date",
  "number",
  "email",
  "phone",
  "address",
  "checkbox",
  "select",
  "textarea",
] as const;

// Max. PDF-Größe für KI-Analyse (10 MB — gleich wie Upload-Limit)
const MAX_PDF_SIZE_FOR_ANALYSIS = 10 * 1024 * 1024;

/**
 * Erstellt den Analyse-Prompt je nach Dokumenttyp.
 * Die KI klassifiziert das Dokument selbst und liefert das passende Format.
 */
function buildAnalysisPrompt(helpTextLanguage: string): string {
  return `Du bist ein Experte für deutsche Behördendokumente und hilfst Menschen, die wenig Erfahrung mit Bürokratie haben.

Analysiere dieses PDF gründlich. Bestimme zuerst, ob es sich um ein **ausfüllbares Formular** oder um ein **Dokument** (Bescheid, Rechnung, Mitteilung, Brief, Vertrag etc.) handelt.

## Wenn es ein FORMULAR ist (enthält Felder zum Ausfüllen):

Antworte als JSON-Objekt:

{
  "type": "form",
  "summary": "Verständliche Zusammenfassung auf ${helpTextLanguage}: Was ist das für ein Formular? Wofür wird es gebraucht? Welche Unterlagen sollte man bereithalten? (2-3 Sätze)",
  "fields": [
    {
      "label": "Originale Feldbezeichnung aus dem Formular",
      "fieldType": "text|date|number|email|phone|address|checkbox|select|textarea",
      "required": true/false
    }
  ]
}

Formular-Regeln:
- Analysiere ALLE Seiten vollständig
- Erkenne Checkboxen, Auswahlfelder und mehrzeilige Textfelder
- Reihenfolge der Felder = Reihenfolge im Formular
- Sternchen (*) = Pflichtfeld
- Halte die Feld-Liste KURZ — nur label, fieldType und required. Keine helpText, instructions oder exampleValue nötig.
- MAXIMAL 60 Felder auflisten. Wenn das Formular mehr Felder hat, fasse ähnliche/wiederholte Felder zusammen (z.B. "Angaben Elternteil 1" und "Angaben Elternteil 2" als separate Gruppen benennen statt jedes Feld doppelt aufzulisten).
- Bei mehrseitigen Formularen mit sich wiederholenden Abschnitten: Liste die Felder nur einmal auf und notiere im label, dass es sich wiederholt (z.B. "Vorname (Elternteil 1)", "Vorname (Elternteil 2)").

## Wenn es ein DOKUMENT ist (Bescheid, Brief, Rechnung, Mitteilung etc.):

Antworte als JSON-Objekt:

{
  "type": "document",
  "summary": "Verständliche Zusammenfassung auf ${helpTextLanguage}: Was ist das für ein Dokument? Von wem kommt es? Was ist der Kerninhalt? Was bedeutet es für den Empfänger? (3-5 Sätze, allgemeinverständlich)",
  "keyPoints": [
    "Kernaussage 1 auf ${helpTextLanguage}: Was steht konkret drin?",
    "Kernaussage 2 auf ${helpTextLanguage}: Wichtige Zahlen, Beträge, Entscheidungen"
  ],
  "nextSteps": [
    "Konkreter nächster Schritt auf ${helpTextLanguage}: Was muss der Empfänger jetzt tun?",
    "Weiterer Schritt: z.B. Widerspruch einlegen, Zahlung leisten, Unterlagen nachreichen"
  ],
  "deadlines": [
    "Frist auf ${helpTextLanguage}: z.B. 'Widerspruchsfrist: 4 Wochen ab Zustellung (bis ca. TT.MM.JJJJ)'",
    "Weitere Frist: z.B. 'Zahlungsfrist: 14 Tage'"
  ]
}

Dokument-Regeln:
- "keyPoints": Alle wichtigen Fakten, Beträge und Entscheidungen aus dem Dokument
- "nextSteps": Praktische, konkrete Handlungsanweisungen — was muss man als nächstes tun?
- "deadlines": Alle im Dokument genannten Fristen. Leeres Array [] wenn keine Fristen vorhanden
- Fachbegriffe immer direkt erklären (z.B. "Widerspruch" = "Sie können gegen diese Entscheidung Einspruch erheben")
- Schreibe so, dass jemand ohne Verwaltungserfahrung es versteht

## Allgemeine Regeln:
- ALLE Texte auf ${helpTextLanguage} verfassen
- Keine Fachbegriffe ohne Erklärung
- Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text oder Markdown-Formatierung

## Rechtliche Einschränkungen:
- Gib KEINE individuellen Rechtsempfehlungen (z.B. "Sie sollten Widerspruch einlegen")
- Beschreibe nur, was im Dokument steht und welche Optionen es grundsätzlich gibt
- Bei "nextSteps": Formuliere neutral und informativ (z.B. "Es besteht die Möglichkeit, innerhalb von 4 Wochen Widerspruch einzulegen"), NICHT als persönliche Empfehlung
- Weise bei Fristen darauf hin, dass die Angaben auf der KI-Analyse basieren und keine Gewähr übernommen wird`;
}

/**
 * Hilfsfunktion: Anthropic API-Fehler behandeln
 */
function handleAnthropicError(error: unknown): Response | null {
  if (error instanceof Anthropic.APIError) {
    console.error(`Anthropic API-Fehler (${error.status}):`, error.message);

    const errorMap: Record<number, { message: string; status: number }> = {
      401: {
        message:
          "Der API-Schlüssel ist ungültig. Bitte den Administrator kontaktieren.",
        status: 500,
      },
      429: {
        message:
          "Zu viele Anfragen. Bitte einen Moment warten und erneut versuchen.",
        status: 429,
      },
      413: {
        message:
          "Die PDF-Datei ist zu groß für die Verarbeitung. Bitte eine kleinere Datei verwenden.",
        status: 413,
      },
      400: {
        message:
          "Die PDF-Datei konnte nicht verarbeitet werden. Bitte prüfen Sie, ob es sich um ein gültiges PDF handelt.",
        status: 400,
      },
      529: {
        message:
          "Der KI-Dienst ist derzeit überlastet. Bitte in einigen Minuten erneut versuchen.",
        status: 503,
      },
    };

    const mapped = errorMap[error.status];
    if (mapped) {
      return Response.json({ error: mapped.message }, { status: mapped.status });
    }
  }

  if (
    error instanceof Error &&
    (error.message.includes("timeout") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ECONNREFUSED"))
  ) {
    return Response.json(
      {
        error:
          "Die Verbindung zum KI-Dienst konnte nicht hergestellt werden. Bitte später erneut versuchen.",
      },
      { status: 503 }
    );
  }

  return null;
}

/**
 * JSON aus KI-Antwort extrahieren (auch aus Markdown-Codeblöcken oder mit umgebendem Text)
 */
function extractJson(text: string): unknown {
  let jsonText = text.trim();

  // Versuch 1: Markdown-Codeblock
  const codeBlockMatch = jsonText.match(
    /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/
  );
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim();
  }

  // Versuch 2: Direktes Parsen
  try {
    return JSON.parse(jsonText);
  } catch {
    // Versuch 3: Erstes JSON-Objekt im Text finden
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Kein JSON in der Antwort gefunden");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // DSGVO-Einwilligung prüfen
    const consentHeader = request.headers.get("x-ki-consent");
    if (consentHeader !== "accepted") {
      return Response.json(
        {
          error:
            "Für die KI-Analyse ist eine Einwilligung zur Datenverarbeitung erforderlich.",
          code: "CONSENT_REQUIRED",
        },
        { status: 403 }
      );
    }

    // Formular aus der Datenbank laden
    const form = await prisma.form.findUnique({
      where: { id },
      include: { fields: true },
    });

    if (!form) {
      return Response.json(
        { error: "Formular nicht gefunden." },
        { status: 404 }
      );
    }

    if (!form.fileUrl) {
      return Response.json(
        { error: "Keine PDF-Datei für dieses Formular vorhanden." },
        { status: 400 }
      );
    }

    // Bereits analysiert prüfen (Felder oder Typ gesetzt)
    if (form.fields.length > 0 || form.type !== "unknown") {
      return Response.json(
        {
          error:
            "Dieses Dokument wurde bereits analysiert. Vorhandene Analyse muss zuerst gelöscht werden.",
        },
        { status: 409 }
      );
    }

    // PDF-Datei lesen
    const fileName = form.fileUrl.split("/").pop();
    if (!fileName) {
      return Response.json(
        { error: "Ungültige Datei-URL." },
        { status: 400 }
      );
    }

    const filePath = join(UPLOAD_DIR, fileName);

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await readFile(filePath);
    } catch {
      return Response.json(
        {
          error:
            "Die PDF-Datei konnte nicht gelesen werden. Möglicherweise wurde sie gelöscht.",
        },
        { status: 404 }
      );
    }

    if (pdfBuffer.length > MAX_PDF_SIZE_FOR_ANALYSIS) {
      return Response.json(
        {
          error:
            "Die PDF-Datei ist zu groß für die KI-Analyse (max. 10 MB). Bitte eine kleinere Datei verwenden.",
        },
        { status: 413 }
      );
    }

    const pdfBase64 = pdfBuffer.toString("base64");

    // API-Key prüfen
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY ist nicht konfiguriert.");
      return Response.json(
        {
          error:
            "Die KI-Analyse ist nicht konfiguriert. Bitte den Administrator kontaktieren.",
        },
        { status: 500 }
      );
    }

    // Sprache bestimmen
    const localeHeader = request.headers.get("x-locale") || "de";
    const localeLanguageMap: Record<string, string> = {
      de: "Deutsch", en: "Englisch", tr: "Türkisch", ar: "Arabisch", uk: "Ukrainisch",
      pl: "Polnisch", ro: "Rumänisch", fa: "Persisch", ru: "Russisch",
      zh: "Chinesisch", sr: "Serbisch", hr: "Kroatisch", bg: "Bulgarisch", fr: "Französisch", es: "Spanisch", it: "Italienisch",
    };
    const helpTextLanguage = localeLanguageMap[localeHeader] || "Deutsch";

    // Claude API aufrufen — Daten werden zur Verarbeitung an Anthropic (USA) gesendet
    // Anthropic speichert keine API-Daten für Trainingszwecke (API Terms of Service)
    const anthropic = new Anthropic({ apiKey });

    let message: Anthropic.Message;
    try {
      message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 12000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: buildAnalysisPrompt(helpTextLanguage),
              },
            ],
          },
        ],
      });
    } catch (error) {
      const errorResponse = handleAnthropicError(error);
      if (errorResponse) return errorResponse;
      throw error;
    }

    // Antwort parsen
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return Response.json(
        {
          error:
            "Die KI-Analyse hat kein verwertbares Ergebnis geliefert. Bitte erneut versuchen.",
        },
        { status: 500 }
      );
    }

    let parsed: unknown;
    try {
      parsed = extractJson(textContent.text);
    } catch (parseError) {
      console.error(
        "Fehler beim Parsen der KI-Antwort:",
        parseError instanceof Error ? parseError.message : parseError
      );
      console.error(
        "Claude-Antwort (erste 1000 Zeichen):",
        textContent.text.substring(0, 1000)
      );
      return Response.json(
        {
          error:
            "Die KI-Antwort konnte nicht verarbeitet werden. Bitte erneut versuchen.",
        },
        { status: 500 }
      );
    }

    const result = parsed as Record<string, unknown>;
    const documentType = result.type === "document" ? "document" : "form";

    // === DOKUMENT-Analyse ===
    if (documentType === "document") {
      const summary = result.summary
        ? String(result.summary).substring(0, 5000)
        : null;

      const keyPoints = Array.isArray(result.keyPoints)
        ? result.keyPoints.map((p: unknown) => String(p).substring(0, 1000))
        : [];

      const nextSteps = Array.isArray(result.nextSteps)
        ? result.nextSteps.map((s: unknown) => String(s).substring(0, 1000))
        : [];

      const deadlines = Array.isArray(result.deadlines)
        ? result.deadlines.map((d: unknown) => String(d).substring(0, 500))
        : [];

      await prisma.form.update({
        where: { id },
        data: {
          type: "document",
          summary,
          analysisLanguage: localeHeader,
          keyPoints: JSON.stringify(keyPoints),
          nextSteps: JSON.stringify(nextSteps),
          deadlines: JSON.stringify(deadlines),
        },
      });

      return Response.json({
        message: "Dokument erfolgreich analysiert.",
        type: "document",
        summary,
        keyPoints,
        nextSteps,
        deadlines,
      });
    }

    // === FORMULAR-Analyse ===
    const analysisResult: FormAnalysisResult = {
      type: "form",
      summary: typeof result.summary === "string" ? result.summary : "",
      fields: Array.isArray(result.fields)
        ? (result.fields as ExtractedField[])
        : [],
    };

    // Abwärtskompatibilität: Falls die Antwort ein Array ist (altes Format)
    if (Array.isArray(parsed)) {
      analysisResult.summary = "";
      analysisResult.fields = parsed as ExtractedField[];
    }

    if (analysisResult.fields.length === 0) {
      return Response.json(
        {
          error:
            "Es konnten keine Formularfelder erkannt werden. Möglicherweise enthält das PDF keine ausfüllbaren Felder.",
        },
        { status: 422 }
      );
    }

    // Felder validieren und bereinigen
    const validatedFields = analysisResult.fields
      .filter(
        (field) =>
          field && typeof field === "object" && typeof field.label === "string"
      )
      .map((field) => ({
        label: String(field.label || "Unbekanntes Feld").substring(0, 200),
        fieldType: ALLOWED_FIELD_TYPES.includes(
          field.fieldType as (typeof ALLOWED_FIELD_TYPES)[number]
        )
          ? field.fieldType
          : "text",
        required: Boolean(field.required),
        helpText: field.helpText
          ? String(field.helpText).substring(0, 1000)
          : null,
        instructions: field.instructions
          ? String(field.instructions).substring(0, 2000)
          : null,
        exampleValue: field.exampleValue
          ? String(field.exampleValue).substring(0, 500)
          : null,
      }));

    if (validatedFields.length === 0) {
      return Response.json(
        {
          error:
            "Es konnten keine gültigen Formularfelder erkannt werden. Bitte erneut versuchen.",
        },
        { status: 422 }
      );
    }

    const summary = analysisResult.summary
      ? String(analysisResult.summary).substring(0, 5000)
      : null;

    const [, ...createdFields] = await prisma.$transaction([
      prisma.form.update({
        where: { id },
        data: { type: "form", summary, analysisLanguage: localeHeader },
      }),
      ...validatedFields.map((field, index) =>
        prisma.formField.create({
          data: {
            formId: id,
            label: field.label,
            fieldType: field.fieldType,
            required: field.required,
            helpText: field.helpText,
            instructions: field.instructions,
            exampleValue: field.exampleValue,
            sortOrder: index,
          },
        })
      ),
    ]);

    return Response.json({
      message: `${createdFields.length} Formularfelder erfolgreich erkannt.`,
      type: "form",
      fieldsCount: createdFields.length,
      summary,
      fields: createdFields,
    });
  } catch (error) {
    console.error("Analyse-Fehler:", error);

    return Response.json(
      {
        error:
          "Bei der Analyse ist ein unerwarteter Fehler aufgetreten. Bitte erneut versuchen.",
      },
      { status: 500 }
    );
  }
}
