"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

interface AnalyzeDict {
  title: string;
  description: string;
  privacyNote: string;
  privacyText: string;
  privacyLink: string;
  consentLabel: string;
  consentError: string;
  buttonStart: string;
  buttonRunning: string;
  errorConnection: string;
  errorUnknown: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
}

export function AnalyzeButton({
  formId,
  lang,
  dict,
}: {
  formId: string;
  lang: Locale;
  dict: AnalyzeDict;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const router = useRouter();

  const analyseSchritte = [dict.step1, dict.step2, dict.step3, dict.step4];

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
      return;
    }

    const intervals = [2000, 4000, 8000];
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    intervals.forEach((delay, index) => {
      timeouts.push(
        setTimeout(() => {
          setCurrentStep(index + 1);
        }, delay)
      );
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isAnalyzing]);

  async function handleAnalyze() {
    if (!consentGiven) {
      setError(dict.consentError);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`/api/forms/${formId}/analyze`, {
        method: "POST",
        headers: {
          "x-ki-consent": "accepted",
          "x-locale": lang,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || dict.errorUnknown);
        return;
      }

      router.refresh();
    } catch {
      setError(dict.errorConnection);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="rounded-2xl bg-primary/5 border border-primary/15 p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-text-dark">{dict.title}</h3>
          <p className="text-sm text-text-body mt-1">{dict.description}</p>
        </div>
      </div>

      {/* DSGVO-Hinweis */}
      <div className="rounded-xl bg-bg-sand border border-surface-warm p-3 mb-4">
        <div className="flex items-start gap-2">
          <svg className="h-4 w-4 shrink-0 mt-0.5 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <div>
            <p className="text-xs text-text-body leading-relaxed">
              <strong>{dict.privacyNote}</strong> {dict.privacyText}{" "}
              <a href={`/${lang}/datenschutz`} className="underline text-primary hover:text-primary/80">{dict.privacyLink}</a>.
            </p>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="h-4 w-4 rounded border-surface-warm text-primary focus:ring-primary"
              />
              <span className="text-xs font-medium text-text-dark">{dict.consentLabel}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Fortschrittsanzeige */}
      {isAnalyzing && (
        <div className="mb-4 space-y-2">
          {analyseSchritte.map((schritt, index) => (
            <div key={index} className="flex items-center gap-2.5 text-sm">
              {index < currentStep ? (
                <svg className="h-4 w-4 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : index === currentStep ? (
                <svg className="h-4 w-4 shrink-0 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <div className="h-4 w-4 shrink-0 rounded-full border-2 border-surface-warm" />
              )}
              <span className={index <= currentStep ? "text-text-dark" : "text-text-muted"}>{schritt}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-error/5 border border-error/20 p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg className="h-4 w-4 shrink-0 mt-0.5 text-error" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-error">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !consentGiven}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-text-white shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isAnalyzing ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {dict.buttonRunning}
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            {dict.buttonStart}
          </>
        )}
      </button>
    </div>
  );
}
