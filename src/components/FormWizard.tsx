"use client";

import { useState, useMemo } from "react";

interface FormField {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  sortOrder: number;
}

interface FormWizardDict {
  helpLoading: string;
  helpError: string;
  downloadButton: string;
  downloadLoading: string;
  downloadSuccess: string;
  downloadError: string;
  downloadNoAnswers: string;
  requiredHint: string;
  placeholder: string;
}

interface FieldGroup {
  key: string;
  label: string;
  fields: FormField[];
}

function groupFields(fields: FormField[]): FieldGroup[] {
  const groups: Record<string, FormField[]> = {};
  const order: string[] = [];

  for (const field of fields) {
    const match = field.label.match(/^(\d+[a-z]?)\s/);
    const key = match ? match[1] : "other";
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(field);
  }

  return order.map((key) => ({
    key,
    label: `Abschnitt ${key}`,
    fields: groups[key],
  }));
}

function cleanLabel(label: string): string {
  let cleaned = label
    .replace(/^\d+[a-z]?\s+/, "") // Prefix entfernen: "1a Vorname(n)" → "Vorname(n)"
    .replace(/_/g, " ")
    .replace(/\bAS\b/g, "(Antragsteller)")
    .replace(/\b2E\b/g, "(2. Elternteil)")
    .replace(/\bKK\b/g, "Krankenkasse")
    .replace(/\bStr\b/g, "Straße")
    .replace(/\bHausnr\b/g, "Hausnummer")
    .replace(/\bAdrZusatz\b/g, "Adresszusatz")
    .replace(/\bAdr\b/g, "Adresse")
    .replace(/\bKtoInhaber\b/g, "Kontoinhaber")
    .replace(/\bVertr\b/g, "Vertreter");

  // "Geburtsdatum Jahr" → "Geburtsdatum (TT.MM.JJJJ)" — das Feld nimmt das ganze Datum
  if (cleaned.match(/Geburtsdatum.*Jahr|Datum.*Jahr|Geburtstermin.*Jahr/i)) {
    cleaned = cleaned.replace(/\s*Jahr\s*$/, " (TT.MM.JJJJ)");
  }
  // Andere "Jahr"-Felder: Zeiträume etc.
  if (cleaned.match(/\bvon Jahr\b/)) {
    cleaned = cleaned.replace(/\bvon Jahr\b/, "von (TT.MM.JJJJ)");
  }
  if (cleaned.match(/\bbis Jahr\b/)) {
    cleaned = cleaned.replace(/\bbis Jahr\b/, "bis (TT.MM.JJJJ)");
  }

  return cleaned;
}

export function FormWizard({
  formId,
  formTitle,
  formSummary,
  fields,
  lang,
  dict,
}: {
  formId: string;
  formTitle: string;
  formSummary: string | null;
  fields: FormField[];
  lang: string;
  dict: FormWizardDict;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [helpField, setHelpField] = useState<string | null>(null);
  const [helpText, setHelpText] = useState<Record<string, string>>({});
  const [helpLoading, setHelpLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const groups = useMemo(() => groupFields(fields), [fields]);

  // Erste Gruppe standardmäßig öffnen
  if (groups.length > 0 && Object.keys(openSections).length === 0) {
    openSections[groups[0].key] = true;
  }

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateValue = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const filledCount = Object.values(values).filter((v) => v.trim()).length;

  const requestHelp = async (field: FormField) => {
    if (helpField === field.id) { setHelpField(null); return; }
    if (helpText[field.id]) { setHelpField(field.id); return; }

    setHelpField(field.id);
    setHelpLoading(true);

    try {
      const res = await fetch(`/api/forms/${formId}/field-help`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-locale": lang },
        body: JSON.stringify({ fieldLabel: field.label, fieldType: field.fieldType, formTitle }),
      });

      if (res.ok) {
        const data = await res.json();
        setHelpText((prev) => ({ ...prev, [field.id]: data.help }));
      } else {
        setHelpText((prev) => ({ ...prev, [field.id]: dict.helpError }));
      }
    } catch {
      setHelpText((prev) => ({ ...prev, [field.id]: dict.helpError }));
    } finally {
      setHelpLoading(false);
    }
  };

  const handleDownload = async () => {
    if (filledCount === 0) {
      setDownloadMessage({ type: "error", text: dict.downloadNoAnswers });
      return;
    }

    setDownloadLoading(true);
    setDownloadMessage(null);

    try {
      const fieldData = fields
        .map((f) => ({ label: f.label, value: values[f.id] || "" }))
        .filter((f) => f.value.trim());

      const res = await fetch(`/api/forms/${formId}/fill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldData }),
      });

      if (!res.ok) {
        const data = await res.json();
        setDownloadMessage({ type: "error", text: data.error || dict.downloadError });
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${formTitle}_ausgefuellt.pdf`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadMessage({ type: "success", text: dict.downloadSuccess });
      setTimeout(() => setDownloadMessage(null), 5000);
    } catch {
      setDownloadMessage({ type: "error", text: dict.downloadError });
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {formSummary && (
        <div className="rounded-2xl bg-bg-sand border border-surface-warm p-5">
          <p className="text-sm text-text-body leading-relaxed">{formSummary}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{dict.requiredHint}</p>
        {filledCount > 0 && (
          <span className="text-sm font-medium text-primary">{filledCount} ausgefüllt</span>
        )}
      </div>

      {/* Gruppierte Felder */}
      {groups.map((group) => {
        const groupFilled = group.fields.filter((f) => values[f.id]?.trim()).length;
        const isOpen = openSections[group.key];

        return (
          <div key={group.key} className="rounded-2xl bg-card-white border border-surface-warm shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection(group.key)}
              className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-bg-sand/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  {group.key}
                </span>
                <span className="font-medium text-text-dark">{group.fields.length} Felder</span>
                {groupFilled > 0 && (
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                    {groupFilled} ausgefüllt
                  </span>
                )}
              </div>
              <svg
                className={`h-5 w-5 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isOpen && (
              <div className="border-t border-surface-warm p-4 sm:p-5 space-y-3">
                {group.fields.map((field) => (
                  <FieldInput
                    key={field.id}
                    field={field}
                    value={values[field.id] || ""}
                    onChange={(v) => updateValue(field.id, v)}
                    helpField={helpField}
                    helpText={helpText[field.id]}
                    helpLoading={helpLoading}
                    onRequestHelp={() => requestHelp(field)}
                    dict={dict}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Download-Button */}
      <button
        onClick={handleDownload}
        disabled={downloadLoading || filledCount === 0}
        className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-text-white shadow-lg shadow-accent/25 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {downloadLoading ? (
          <>
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {dict.downloadLoading}
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {dict.downloadButton}
          </>
        )}
      </button>

      {downloadMessage && (
        <div className={`rounded-xl p-3 text-sm text-center font-medium ${
          downloadMessage.type === "success"
            ? "bg-success/5 border border-success/20 text-success"
            : "bg-error/5 border border-error/20 text-error"
        }`}>
          {downloadMessage.text}
        </div>
      )}
    </div>
  );
}

/* --- Einzelnes Feld --- */

function FieldInput({
  field,
  value,
  onChange,
  helpField,
  helpText,
  helpLoading,
  onRequestHelp,
  dict,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
  helpField: string | null;
  helpText: string | undefined;
  helpLoading: boolean;
  onRequestHelp: () => void;
  dict: FormWizardDict;
}) {
  const label = cleanLabel(field.label);
  const isHelpOpen = helpField === field.id;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm text-text-dark" htmlFor={`f-${field.id}`}>
          {label}
        </label>
        <button
          onClick={onRequestHelp}
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
            isHelpOpen ? "bg-primary text-text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          ?
        </button>
      </div>

      {isHelpOpen && (
        <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
          {helpLoading && !helpText ? (
            <div className="flex items-center gap-2 text-xs text-primary">
              <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {dict.helpLoading}
            </div>
          ) : (
            <p className="text-xs text-text-body leading-relaxed">{helpText}</p>
          )}
        </div>
      )}

      {field.fieldType === "checkbox" ? (
        <button
          onClick={() => onChange(value === "Ja" ? "Nein" : "Ja")}
          className={`self-start flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            value === "Ja"
              ? "bg-primary text-text-white"
              : "bg-surface-warm text-text-muted hover:bg-surface-warm/80"
          }`}
        >
          {value === "Ja" ? "Ja" : "Nein"}
        </button>
      ) : (
        <input
          id={`f-${field.id}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.fieldType === "date" ? "TT.MM.JJJJ" : dict.placeholder}
          className="w-full rounded-lg border border-surface-warm bg-bg-primary px-3 py-2 text-sm text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30"
        />
      )}
    </div>
  );
}
