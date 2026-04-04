import { type NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { PDFDocument } from "pdf-lib";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED_FIELD_TYPES: Record<string, string> = {
  PDFTextField: "text",
  PDFCheckBox: "checkbox",
  PDFDropdown: "select",
  PDFRadioGroup: "select",
  PDFOptionList: "select",
};

/**
 * Formularfelder direkt aus dem PDF auslesen — komplett kostenlos, keine KI nötig.
 * Wenn Felder gefunden → ist ein Formular. Keine Felder → ist ein Dokument.
 */
async function extractPdfFields(pdfBytes: ArrayBuffer): Promise<{
  type: "form" | "document";
  fields: Array<{ label: string; fieldType: string; required: boolean }>;
}> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const pdfFields = form.getFields();

    if (pdfFields.length === 0) {
      return { type: "document", fields: [] };
    }

    const fields = pdfFields.map((field) => {
      const typeName = field.constructor.name;
      const name = field.getName();

      return {
        label: name,
        fieldType: ALLOWED_FIELD_TYPES[typeName] || "text",
        required: false, // PDF-Felder haben kein zuverlässiges "required"-Flag
      };
    });

    return { type: "form", fields };
  } catch (error) {
    console.error("PDF-Feld-Extraktion fehlgeschlagen:", error);
    return { type: "document", fields: [] };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: "Keine Datei hochgeladen." },
        { status: 400 }
      );
    }

    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return Response.json(
        { error: "Nur PDF-Dateien sind erlaubt." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "Die Datei darf maximal 10 MB groß sein." },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${timestamp}_${safeName}`;
    const filePath = join(UPLOAD_DIR, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Felder direkt aus dem PDF auslesen — KOSTENLOS, keine KI
    const result = await extractPdfFields(bytes);

    if (result.type === "form" && result.fields.length > 0) {
      const form = await prisma.form.create({
        data: {
          title: file.name.replace(/\.pdf$/i, ""),
          fileUrl: `/api/forms/file/${fileName}`,
          type: "form",
        },
      });

      await prisma.$transaction(
        result.fields.map((field, index) =>
          prisma.formField.create({
            data: {
              formId: form.id,
              label: field.label.substring(0, 200),
              fieldType: field.fieldType,
              required: field.required,
              sortOrder: index,
            },
          })
        )
      );

      return Response.json(
        {
          id: form.id,
          title: form.title,
          fileUrl: form.fileUrl,
          type: "form",
          fieldsCount: result.fields.length,
          message: "Formular erkannt und Felder extrahiert.",
        },
        { status: 201 }
      );
    }

    // Dokument: Nur speichern, Analyse kommt später
    const form = await prisma.form.create({
      data: {
        title: file.name.replace(/\.pdf$/i, ""),
        fileUrl: `/api/forms/file/${fileName}`,
        type: "unknown",
      },
    });

    return Response.json(
      {
        id: form.id,
        title: form.title,
        fileUrl: form.fileUrl,
        type: "document",
        message: "Datei erfolgreich hochgeladen.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload-Fehler:", error);
    return Response.json(
      { error: "Beim Hochladen ist ein Fehler aufgetreten." },
      { status: 500 }
    );
  }
}
