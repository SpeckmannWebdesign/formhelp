import { type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { PDFDocument } from "pdf-lib";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = join(process.cwd(), "uploads");

/**
 * POST /api/forms/[id]/fill — PDF-Formular direkt mit Nutzereingaben ausfüllen
 *
 * Die Feld-Labels aus der DB SIND die PDF-Feldnamen (von pdf-lib extrahiert).
 * Daher brauchen wir keine KI-Zuordnung — direktes Mapping.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const fieldData: Array<{ label: string; value: string }> = body?.fieldData || [];

    const form = await prisma.form.findUnique({ where: { id } });

    if (!form || form.type !== "form") {
      return Response.json({ error: "Formular nicht gefunden." }, { status: 404 });
    }

    if (!form.fileUrl) {
      return Response.json({ error: "Keine PDF-Datei vorhanden." }, { status: 400 });
    }

    if (fieldData.length === 0) {
      return Response.json(
        { error: "Bitte füllen Sie zuerst mindestens ein Feld aus." },
        { status: 400 }
      );
    }

    // PDF laden
    const fileName = form.fileUrl.split("/").pop();
    if (!fileName) {
      return Response.json({ error: "Ungültige Datei-URL." }, { status: 400 });
    }

    const pdfBuffer = await readFile(join(UPLOAD_DIR, fileName));
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pdfForm = pdfDoc.getForm();

    // Direkt ausfüllen — Labels sind die PDF-Feldnamen
    let filledCount = 0;
    for (const { label, value } of fieldData) {
      if (!value.trim()) continue;

      try {
        const field = pdfForm.getField(label);
        if (!field) continue;

        const typeName = field.constructor.name;

        if (typeName === "PDFTextField") {
          pdfForm.getTextField(label).setText(value);
          filledCount++;
        } else if (typeName === "PDFCheckBox") {
          const cb = pdfForm.getCheckBox(label);
          if (["ja", "yes", "true", "1", "evet", "نعم", "так"].includes(value.toLowerCase())) {
            cb.check();
          } else {
            cb.uncheck();
          }
          filledCount++;
        } else if (typeName === "PDFDropdown") {
          try {
            pdfForm.getDropdown(label).select(value);
            filledCount++;
          } catch { /* ungültige Option */ }
        } else if (typeName === "PDFRadioGroup") {
          try {
            pdfForm.getRadioGroup(label).select(value);
            filledCount++;
          } catch { /* ungültige Option */ }
        }
      } catch {
        continue;
      }
    }

    const filledPdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(filledPdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${form.title}_ausgefuellt.pdf"`,
        "X-Filled-Fields": String(filledCount),
      },
    });
  } catch (error) {
    console.error("Fill-Fehler:", error);
    return Response.json({ error: "Beim Ausfüllen ist ein Fehler aufgetreten." }, { status: 500 });
  }
}
