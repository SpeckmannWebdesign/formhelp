import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { FormFieldCard } from "@/components/FormFieldCard";
import { DocumentAnalysis } from "@/components/DocumentAnalysis";
import { TranslateButton } from "@/components/TranslateButton";
import { ChatSection } from "@/components/ChatSection";
import { FormWizard } from "@/components/FormWizard";
import { getDictionary, hasLocale } from "../../dictionaries";
import type { Locale } from "@/lib/i18n";

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value: string | null): Record<string, Record<string, string | null>> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export default async function FormPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  const form = await prisma.form.findUnique({
    where: { id },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });

  if (!form) {
    notFound();
  }

  const isAnalyzed = form.type !== "unknown";
  const isDocument = form.type === "document";
  const isForm = form.type === "form";

  const needsTranslation = isAnalyzed && form.analysisLanguage !== null && form.analysisLanguage !== lang;
  let translation: {
    summary: string | null;
    fields: string | null;
    keyPoints: string | null;
    nextSteps: string | null;
    deadlines: string | null;
  } | null = null;

  if (needsTranslation) {
    translation = await prisma.formTranslation.findUnique({
      where: { formId_locale: { formId: id, locale: lang } },
      select: { summary: true, fields: true, keyPoints: true, nextSteps: true, deadlines: true },
    });
  }

  const effectiveSummary = translation?.summary ?? form.summary;
  const effectiveKeyPoints = translation?.keyPoints
    ? parseJsonArray(translation.keyPoints)
    : parseJsonArray(form.keyPoints);
  const effectiveNextSteps = translation?.nextSteps
    ? parseJsonArray(translation.nextSteps)
    : parseJsonArray(form.nextSteps);
  const effectiveDeadlines = translation?.deadlines
    ? parseJsonArray(translation.deadlines)
    : parseJsonArray(form.deadlines);
  const fieldTranslations = translation?.fields
    ? parseJsonObject(translation.fields)
    : {};

  const pflichtfelder = form.fields.filter((f) => f.required).length;
  const optionaleFelder = form.fields.length - pflichtfelder;

  return (
    <div className="flex flex-col flex-1 items-center bg-bg-primary font-[family-name:var(--font-inter)]">
      <main className="flex flex-1 w-full max-w-3xl flex-col px-5 py-8 sm:py-16">
        {/* Navigation */}
        <Link
          href={`/${lang}`}
          className="text-sm text-primary hover:text-primary/80 mb-6 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          {dict.form.backToHome}
        </Link>

        {/* Header */}
        <div className="bg-card-white rounded-2xl border border-surface-warm p-5 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-3 mb-2">
            {isDocument && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {dict.document.typeBadge}
              </span>
            )}
            {isForm && form.fields.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {dict.document.formBadge}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-text-dark mb-2 font-[family-name:var(--font-plus-jakarta-sans)]">
            {form.title}
          </h1>

          {form.description && (
            <p className="text-text-muted mb-4">{form.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              {new Date(form.createdAt).toLocaleDateString(
                lang === "de" ? "de-DE" : lang === "ar" ? "ar" : lang === "tr" ? "tr-TR" : lang === "uk" ? "uk-UA" : "en-US",
                { day: "2-digit", month: "2-digit", year: "numeric" }
              )}
            </span>

            {isForm && form.fields.length > 0 && (
              <>
                <span className="text-surface-warm">&bull;</span>
                <span>{dict.form.fieldsDetected.replace("{count}", String(form.fields.length))}</span>
                <span className="text-surface-warm">&bull;</span>
                <span>
                  {dict.form.requiredFields.replace("{count}", String(pflichtfelder))},{" "}
                  {dict.form.optionalFields.replace("{count}", String(optionaleFelder))}
                </span>
              </>
            )}

            {isDocument && (
              <>
                <span className="text-surface-warm">&bull;</span>
                <span className="text-success font-medium">{dict.document.analyzed}</span>
              </>
            )}
          </div>
        </div>

        {/* PDF-Vorschau */}
        {form.fileUrl && (
          <details className="group bg-card-white rounded-2xl border border-surface-warm mb-6 overflow-hidden shadow-sm">
            <summary className="flex items-center justify-between cursor-pointer p-5 sm:px-8 sm:py-5 hover:bg-bg-sand/50 transition-colors">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="font-medium text-text-dark">{dict.form.pdfPreview}</span>
              </div>
              <svg className="h-5 w-5 text-text-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>
            <div className="px-5 pb-5 sm:px-8 sm:pb-8">
              <div className="w-full rounded-xl border border-surface-warm overflow-hidden bg-bg-sand">
                <iframe src={form.fileUrl} className="w-full h-[400px] sm:h-[600px]" title={`${dict.form.pdfPreview}: ${form.title}`} />
              </div>
            </div>
          </details>
        )}

        {/* Übersetzungs-Button */}
        {needsTranslation && !translation && (
          <TranslateButton formId={form.id} lang={lang} dict={dict.translate} />
        )}

        {/* Inhalt je nach Typ */}
        {isForm ? (
          /* === FORMULAR: Formular-Wizard zum Ausfüllen === */
          <FormWizard
            formId={form.id}
            formTitle={form.title}
            formSummary={effectiveSummary}
            fields={form.fields.map((f) => ({
              id: f.id,
              label: f.label,
              fieldType: f.fieldType,
              required: f.required,
              sortOrder: f.sortOrder,
            }))}
            lang={lang}
            dict={dict.formWizard}
          />
        ) : isDocument ? (
          /* === DOKUMENT (analysiert): Zusammenfassung + Kernpunkte === */
          <>
            <DocumentAnalysis
              summary={effectiveSummary}
              keyPoints={effectiveKeyPoints}
              nextSteps={effectiveNextSteps}
              deadlines={effectiveDeadlines}
              dict={dict.document}
            />
            <div className="mt-6">
              <ChatSection key={`chat-${lang}`} formId={form.id} lang={lang} dict={dict.chat} />
            </div>
          </>
        ) : (
          /* === UNBEKANNT: Analyse-Button (für Dokumente die noch nicht analysiert sind) === */
          <AnalyzeButton formId={form.id} lang={lang as Locale} dict={dict.analyze} />
        )}
      </main>
    </div>
  );
}
