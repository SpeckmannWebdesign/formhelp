import { type NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "uploads");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Verhindern, dass auf Dateien außerhalb des Upload-Ordners zugegriffen wird
    if (filename.includes("..") || filename.includes("/")) {
      return Response.json(
        { error: "Ungültiger Dateiname." },
        { status: 400 }
      );
    }

    const filePath = join(UPLOAD_DIR, filename);

    // Prüfen ob Datei existiert
    try {
      await stat(filePath);
    } catch {
      return Response.json(
        { error: "Datei nicht gefunden." },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Datei-Abruf-Fehler:", error);
    return Response.json(
      { error: "Fehler beim Laden der Datei." },
      { status: 500 }
    );
  }
}
