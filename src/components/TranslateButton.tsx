"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TranslateButtonDict {
  translating: string;
  translateButton: string;
  translateInfo: string;
  translateError: string;
}

interface TranslateButtonProps {
  formId: string;
  lang: string;
  dict: TranslateButtonDict;
}

export function TranslateButton({ formId, lang, dict }: TranslateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleTranslate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/forms/${formId}/translate`, {
        method: "POST",
        headers: { "x-locale": lang },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || dict.translateError);
        return;
      }

      router.refresh();
    } catch {
      setError(dict.translateError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl bg-primary/5 border border-primary/15 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <svg className="h-5 w-5 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-text-body mb-3">{dict.translateInfo}</p>
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {dict.translating}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                </svg>
                {dict.translateButton}
              </>
            )}
          </button>
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
