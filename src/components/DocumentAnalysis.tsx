"use client";

interface DocumentAnalysisProps {
  summary: string | null;
  keyPoints: string[];
  nextSteps: string[];
  deadlines: string[];
  dict: {
    summaryTitle: string;
    keyPointsTitle: string;
    nextStepsTitle: string;
    deadlinesTitle: string;
    noDeadlines: string;
    successTitle: string;
    successText: string;
  };
}

export function DocumentAnalysis({
  summary,
  keyPoints,
  nextSteps,
  deadlines,
  dict,
}: DocumentAnalysisProps) {
  return (
    <div className="space-y-4">
      {/* Zusammenfassung */}
      {summary && (
        <div className="rounded-2xl bg-bg-sand border border-surface-warm p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <div>
              <h2 className="font-semibold text-text-dark mb-2">{dict.summaryTitle}</h2>
              <p className="text-sm text-text-body leading-relaxed whitespace-pre-line">{summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Kernaussagen */}
      {keyPoints.length > 0 && (
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>
            <div className="flex-1">
              <h2 className="font-semibold text-text-dark mb-3">{dict.keyPointsTitle}</h2>
              <ul className="space-y-2">
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-text-body leading-relaxed">
                    <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Nächste Schritte */}
      {nextSteps.length > 0 && (
        <div className="rounded-2xl bg-success/5 border border-success/15 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 shrink-0 mt-0.5 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <div className="flex-1">
              <h2 className="font-semibold text-text-dark mb-3">{dict.nextStepsTitle}</h2>
              <ol className="space-y-2">
                {nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-text-body leading-relaxed">
                    <span className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-success/15 text-success text-xs font-semibold">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Fristen */}
      <div className="rounded-2xl bg-accent/5 border border-accent/15 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 shrink-0 mt-0.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <div className="flex-1">
            <h2 className="font-semibold text-text-dark mb-3">{dict.deadlinesTitle}</h2>
            {deadlines.length > 0 ? (
              <ul className="space-y-2">
                {deadlines.map((deadline, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-text-body leading-relaxed">
                    <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                    {deadline}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">{dict.noDeadlines}</p>
            )}
          </div>
        </div>
      </div>

      {/* Erfolgs-Box */}
      <div className="rounded-xl bg-success/5 border border-success/20 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 shrink-0 mt-0.5 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <div>
            <p className="font-medium text-success text-sm">{dict.successTitle}</p>
            <p className="text-sm text-text-body mt-1">{dict.successText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
