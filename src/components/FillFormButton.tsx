"use client";

import { useState } from "react";

interface FillFormButtonDict {
  buttonLabel: string;
  buttonLoading: string;
  successMessage: string;
  errorGeneric: string;
  errorNoChat: string;
  errorNoFields: string;
}

export function FillFormButton({
  formId,
  dict,
}: {
  formId: string;
  dict: FillFormButtonDict;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleFill() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/forms/${formId}/fill`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          setError(dict.errorNoChat);
        } else if (response.status === 422) {
          setError(dict.errorNoFields);
        } else {
          setError(data.error || dict.errorGeneric);
        }
        return;
      }

      // PDF-Download starten
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      link.download = filenameMatch ? filenameMatch[1] : "formular_ausgefuellt.pdf";

      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const filledCount = response.headers.get("X-Filled-Fields");
      setSuccess(true);
      setError(null);

      // Erfolgsmeldung nach ein paar Sekunden ausblenden
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError(dict.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleFill}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-text-white shadow-lg shadow-accent/25 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {dict.buttonLoading}
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {dict.buttonLabel}
          </>
        )}
      </button>

      {success && (
        <div className="mt-3 rounded-xl bg-success/5 border border-success/20 p-3">
          <p className="text-sm text-success font-medium text-center">{dict.successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl bg-error/5 border border-error/20 p-3">
          <p className="text-sm text-error text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
