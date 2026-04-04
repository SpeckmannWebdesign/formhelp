import { type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = join(process.cwd(), "uploads");

/**
 * GET /api/forms/[id]/chat — Chatverlauf laden
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const form = await prisma.form.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!form) {
      return Response.json(
        { error: "Formular nicht gefunden." },
        { status: 404 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { formId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        locale: true,
        createdAt: true,
      },
    });

    return Response.json({ messages });
  } catch (error) {
    console.error("Chat-Verlauf-Fehler:", error);
    return Response.json(
      { error: "Der Chatverlauf konnte nicht geladen werden." },
      { status: 500 }
    );
  }
}

/**
 * Chat-System-Prompt bauen — enthält Kontext über das Dokument
 */
function buildChatSystemPrompt(
  form: {
    title: string;
    type: string;
    summary: string | null;
    keyPoints: string | null;
    nextSteps: string | null;
    deadlines: string | null;
    fields: Array<{
      label: string;
      helpText: string | null;
      instructions: string | null;
      fieldType: string;
      required: boolean;
    }>;
  },
  language: string,
  chatHistory: Array<{ role: string; content: string }>
): string {
  let context = "";

  if (form.type === "form") {
    // === INTERAKTIVER FORMULAR-ASSISTENT ===
    // Server-seitiges Progress-Tracking: Zähle bisherige Nutzer-Antworten
    const userMessageCount = chatHistory.filter((m) => m.role === "user").length;
    const totalFields = form.fields.length;
    const currentFieldIndex = Math.min(userMessageCount, totalFields - 1);
    const currentField = form.fields[currentFieldIndex];
    const isFirstMessage = userMessageCount === 0;
    const allFieldsDone = userMessageCount >= totalFields;

    if (allFieldsDone) {
      context = `Du bist ein Formular-Assistent. Das Formular "${form.title}" ist FERTIG ausgefüllt (${totalFields} Felder beantwortet).
Sage dem Nutzer, dass alle Felder ausgefüllt sind und er jetzt auf den Download-Button klicken kann, um das fertige PDF herunterzuladen.
Wenn der Nutzer noch Fragen hat, beantworte sie kurz.
Kommuniziere auf ${language}. Kein Markdown.

`;
    } else if (isFirstMessage) {
      const nextFields = form.fields.slice(0, 3).map((f, i) =>
        `${i + 1}. ${f.label} (${f.fieldType})`
      ).join(", ");

      context = `Du bist ein Formular-Assistent für: "${form.title}"
${form.summary ? `Info: ${form.summary}` : ""}
Das Formular hat ${totalFields} Felder. Die ersten Felder sind: ${nextFields}

Begrüße den Nutzer kurz (1 Satz) und frage dann direkt das ERSTE Feld ab:
Feld: "${currentField.label}" (Typ: ${currentField.fieldType}${currentField.required ? ", Pflichtfeld" : ""})
Erkläre kurz was reinkommt, nenne das Format und ein Beispiel.

Kommuniziere auf ${language}. Kein Markdown. Maximal 3 Zeilen.

`;
    } else {
      const nextField = form.fields[currentFieldIndex];
      const remainingCount = totalFields - currentFieldIndex;

      context = `Du bist ein Formular-Assistent für: "${form.title}"
Fortschritt: ${currentFieldIndex} von ${totalFields} Feldern erledigt. Noch ${remainingCount} übrig.

Deine EINZIGE Aufgabe jetzt: Frage das nächste Feld ab:
Feld ${currentFieldIndex + 1}: "${nextField.label}" (Typ: ${nextField.fieldType}${nextField.required ? ", Pflichtfeld" : ""})

Erkläre kurz was reinkommt, nenne das Format falls nötig, und frage den Nutzer.
NICHT die vorherige Antwort bestätigen oder wiederholen. Direkt zum neuen Feld.

Kommuniziere auf ${language}. Kein Markdown. Maximal 3 Zeilen.

`;
    }

    // Allgemeine Regeln für alle Fälle
    context += `REGELN:
- Nutzer darf in jeder Sprache antworten. "Yes"="Ja", "No"="Nein" etc. Nie auffordern auf Deutsch zu antworten.
- Akzeptiere jede Antwort und gehe weiter. Nicht nachfragen ob es stimmt.
- Kein Markdown. Keine Sternchen, Rauten oder Aufzählungen.

`;
  } else {
    // === DOKUMENT-ASSISTENT ===
    context = `Du bist ein freundlicher und hilfreicher Assistent für deutsche Behördendokumente. Du hilfst Menschen, die wenig Erfahrung mit Bürokratie haben.

Der Nutzer hat folgendes Dokument hochgeladen: "${form.title}"
Dokumenttyp: Dokument/Bescheid

`;

    if (form.summary) {
      context += `Zusammenfassung der Analyse:\n${form.summary}\n\n`;
    }

    const keyPoints = parseJsonArray(form.keyPoints);
    const nextSteps = parseJsonArray(form.nextSteps);
    const deadlines = parseJsonArray(form.deadlines);

    if (keyPoints.length > 0) {
      context += `Kernaussagen:\n${keyPoints.map((p) => `- ${p}`).join("\n")}\n\n`;
    }
    if (nextSteps.length > 0) {
      context += `Nächste Schritte:\n${nextSteps.map((s) => `- ${s}`).join("\n")}\n\n`;
    }
    if (deadlines.length > 0) {
      context += `Fristen:\n${deadlines.map((d) => `- ${d}`).join("\n")}\n\n`;
    }
  }

  context += `Regeln:
- Antworte IMMER auf ${language}. Wenn der Nutzer die Sprache wechselt oder in einer anderen Sprache schreibt, wechsle sofort in diese Sprache und führe das Gespräch komplett in der neuen Sprache weiter. Die Feldbezeichnungen aus dem Formular kannst du im Original lassen, aber alle Erklärungen, Fragen und Anweisungen in der gewählten Sprache.
- Erkläre Fachbegriffe einfach und verständlich
- Sei konkret und praxisnah — nenne z.B. welche Dokumente der Nutzer braucht
- Wenn du etwas nicht sicher weißt, sage das ehrlich
- Beziehe dich immer auf das konkrete hochgeladene Dokument
- Halte deine Antworten kurz und prägnant
- Verwende KEIN Markdown. Keine Sternchen (**), keine Rauten (#), keine Bindestriche (-) als Aufzählungen. Schreibe nur normalen Fließtext.

WICHTIGE EINSCHRÄNKUNGEN — diese musst du STRIKT einhalten:

1. KEINE RECHTSBERATUNG: Du darfst KEINE individuellen rechtlichen Empfehlungen geben. Sage NIEMALS Dinge wie "Sie sollten Widerspruch einlegen", "Sie haben Anspruch auf...", "Klagen Sie dagegen" oder ähnliches. Wenn der Nutzer nach rechtlicher Einschätzung fragt, antworte: "Das ist eine rechtliche Frage, die ich nicht beantworten kann. Bitte wenden Sie sich an eine Beratungsstelle oder einen Anwalt."

2. NUR DOKUMENTBEZOGENE FRAGEN: Beantworte AUSSCHLIESSLICH Fragen, die sich auf das hochgeladene Dokument beziehen. Wenn der Nutzer Fragen stellt, die nichts mit dem Dokument zu tun haben (z.B. Urlaubsplanung, Kochrezepte, allgemeines Wissen), lehne höflich ab: "Ich kann nur Fragen zu Ihrem hochgeladenen Dokument beantworten. Haben Sie eine Frage zu '${form.title}'?"

3. KEINE GARANTIE: Weise bei wichtigen Informationen (Fristen, Beträge, Pflichtangaben) darauf hin, dass deine Angaben auf der KI-Analyse basieren und keine Gewähr für Richtigkeit besteht. Der Nutzer sollte im Zweifelsfall die zuständige Behörde kontaktieren.

4. KEINE ERFUNDENEN INFORMATIONEN: Gib nur Informationen wieder, die tatsächlich im Dokument stehen oder die du aus dem Kontext sicher ableiten kannst. Erfinde keine Fristen, Beträge oder Anforderungen.`;

  return context;
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * POST /api/forms/[id]/chat — Nutzerfrage an Claude senden (Streaming)
 */
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
            "Für die Chat-Funktion ist eine Einwilligung zur Datenverarbeitung erforderlich.",
          code: "CONSENT_REQUIRED",
        },
        { status: 403 }
      );
    }

    // Request-Body lesen
    const body = await request.json();
    const userMessage = typeof body.message === "string" ? body.message.trim() : "";

    if (!userMessage || userMessage.length > 2000) {
      return Response.json(
        {
          error: userMessage
            ? "Die Nachricht darf maximal 2000 Zeichen lang sein."
            : "Bitte geben Sie eine Frage ein.",
        },
        { status: 400 }
      );
    }

    // Formular laden mit Kontext
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { sortOrder: "asc" },
          select: {
            label: true,
            helpText: true,
            instructions: true,
            fieldType: true,
            required: true,
          },
        },
      },
    });

    if (!form) {
      return Response.json(
        { error: "Formular nicht gefunden." },
        { status: 404 }
      );
    }

    // Chatverlauf FRÜH laden (wird für Progress-Tracking bei Formularen gebraucht)
    const chatHistory = await prisma.chatMessage.findMany({
      where: { formId: id },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, content: true },
    });

    if (form.type === "unknown") {
      return Response.json(
        {
          error:
            "Bitte analysieren Sie das Dokument zuerst, bevor Sie Fragen stellen.",
        },
        { status: 400 }
      );
    }

    // Sprache bestimmen
    const localeHeader = request.headers.get("x-locale") || "de";
    const localeLanguageMap: Record<string, string> = {
      de: "Deutsch", en: "Englisch", tr: "Türkisch", ar: "Arabisch", uk: "Ukrainisch",
      pl: "Polnisch", ro: "Rumänisch", fa: "Persisch", ru: "Russisch",
      zh: "Chinesisch", sr: "Serbisch", hr: "Kroatisch", bg: "Bulgarisch", fr: "Französisch", es: "Spanisch", it: "Italienisch",
    };
    const language = localeLanguageMap[localeHeader] || "Deutsch";

    // API-Key prüfen
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            "Die Chat-Funktion ist nicht konfiguriert. Bitte den Administrator kontaktieren.",
        },
        { status: 500 }
      );
    }

    // Nutzernachricht speichern
    await prisma.chatMessage.create({
      data: {
        formId: id,
        role: "user",
        content: userMessage,
        locale: localeHeader,
      },
    });

    // PDF laden — nur für Dokumente (Formulare brauchen es nicht, haben die Feld-Liste im Prompt)
    let pdfBase64: string | null = null;
    if (form.type !== "form" && form.fileUrl) {
      const fileName = form.fileUrl.split("/").pop();
      if (fileName) {
        try {
          const pdfBuffer = await readFile(join(UPLOAD_DIR, fileName));
          pdfBase64 = pdfBuffer.toString("base64");
        } catch {
          // PDF nicht mehr verfügbar — Chat funktioniert trotzdem mit Analyse-Kontext
        }
      }
    }

    // Claude API mit Streaming aufrufen
    const anthropic = new Anthropic({ apiKey });

    // Messages-Array für Claude bauen
    const claudeMessages: Anthropic.MessageParam[] = [];

    // Bisherigen Chatverlauf einbauen
    for (const msg of chatHistory) {
      claudeMessages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Aktuelle Nutzerfrage mit optionalem PDF — nur beim ersten Austausch (spart massiv Kosten)
    const userContent: Anthropic.ContentBlockParam[] = [];
    if (pdfBase64 && claudeMessages.length === 0) {
      userContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: pdfBase64!,
        },
      });
    }
    userContent.push({ type: "text", text: userMessage });
    claudeMessages.push({ role: "user", content: userContent });

    // Streaming-Response
    const stream = await anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: buildChatSystemPrompt(form, language, chatHistory),
      messages: claudeMessages,
    });

    // Antwort-Text sammeln zum Speichern
    let fullResponse = "";

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }

          // Antwort in DB speichern
          await prisma.chatMessage.create({
            data: {
              formId: id,
              role: "assistant",
              content: fullResponse,
              locale: localeHeader,
            },
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error("Streaming-Fehler:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Ein Fehler ist aufgetreten." })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat-Fehler:", error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return Response.json(
          {
            error:
              "Zu viele Anfragen. Bitte einen Moment warten und erneut versuchen.",
          },
          { status: 429 }
        );
      }
    }

    return Response.json(
      {
        error:
          "Bei der Verarbeitung Ihrer Frage ist ein Fehler aufgetreten. Bitte erneut versuchen.",
      },
      { status: 500 }
    );
  }
}
