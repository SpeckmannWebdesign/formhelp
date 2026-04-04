const FELDTYP_CONFIG: Record<string, { icon: string; farbe: string }> = {
  text: { icon: "T", farbe: "bg-text-muted/10 text-text-muted" },
  date: { icon: "\u{1F4C5}", farbe: "bg-accent/10 text-accent" },
  number: { icon: "#", farbe: "bg-primary/10 text-primary" },
  email: { icon: "@", farbe: "bg-primary/10 text-primary" },
  phone: { icon: "\u{1F4DE}", farbe: "bg-success/10 text-success" },
  address: { icon: "\u{1F4CD}", farbe: "bg-accent/10 text-accent" },
  checkbox: { icon: "\u2611", farbe: "bg-primary/10 text-primary" },
  select: { icon: "\u25BC", farbe: "bg-warning/10 text-warning" },
  textarea: { icon: "\u00B6", farbe: "bg-primary/10 text-primary" },
};

interface FormFieldCardDict {
  fieldTypes: Record<string, string>;
  requiredFieldLabel: string;
  noHelpText: string;
  instructionsLabel: string;
  exampleLabel: string;
}

interface FormFieldCardProps {
  label: string;
  fieldType: string;
  required: boolean;
  helpText: string | null;
  instructions: string | null;
  exampleValue: string | null;
  index: number;
  dict: FormFieldCardDict;
}

export function FormFieldCard({
  label,
  fieldType,
  required,
  helpText,
  instructions,
  exampleValue,
  index,
  dict,
}: FormFieldCardProps) {
  const config = FELDTYP_CONFIG[fieldType] ?? FELDTYP_CONFIG.text;
  const fieldTypeLabel = dict.fieldTypes[fieldType] ?? dict.fieldTypes.text;

  return (
    <div className="group rounded-2xl border border-surface-warm bg-card-white p-4 sm:p-5 hover:border-primary/20 transition-colors shadow-sm">
      <div className="flex flex-col sm:flex-row sm:gap-6">
        <div className="sm:w-2/5 shrink-0 mb-3 sm:mb-0">
          <div className="flex items-start gap-2">
            <span className="text-xs font-mono text-text-muted mt-1 select-none">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="font-medium text-text-dark leading-snug break-words">
                {label}
                {required && (
                  <span className="text-accent ml-0.5" title={dict.requiredFieldLabel}>*</span>
                )}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium ${config.farbe}`}>
                  <span className="text-[10px]">{config.icon}</span>
                  {fieldTypeLabel}
                </span>
                {required && (
                  <span className="text-xs text-accent font-medium">{dict.requiredFieldLabel}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sm:w-3/5 sm:border-l sm:border-surface-warm sm:pl-6 space-y-3">
          {helpText ? (
            <div className="flex items-start gap-2">
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <p className="text-sm text-text-body leading-relaxed">{helpText}</p>
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">{dict.noHelpText}</p>
          )}

          {instructions && (
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs font-semibold text-primary mb-1">{dict.instructionsLabel}</p>
              <p className="text-sm text-text-body leading-relaxed">{instructions}</p>
            </div>
          )}

          {exampleValue && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-text-muted mt-0.5 shrink-0">{dict.exampleLabel}:</span>
              <code className="text-sm text-success bg-success/5 px-2 py-0.5 rounded-lg font-mono">{exampleValue}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
