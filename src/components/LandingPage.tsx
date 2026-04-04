"use client";

import type { Locale } from "@/lib/i18n";

interface LandingDict {
  heroEyebrow: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitleHighlight: string;
  heroDescription: string;
  ctaButton: string;
  ctaSecondary: string;
  ctaSubtext: string;
  flagsLabel: string;
  trustFree: string;
  trustDsgvo: string;
  trustNoAccount: string;
  trustLanguages: string;
  howItWorksEyebrow: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Text: string;
  step2Title: string;
  step2Text: string;
  step3Title: string;
  step3Text: string;
  featuresEyebrow: string;
  featuresTitle: string;
  feature1Title: string;
  feature1Text: string;
  feature2Title: string;
  feature2Text: string;
  feature3Title: string;
  feature3Text: string;
  feature4Title: string;
  feature4Text: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  languagesTitle: string;
  languagesSubtitle: string;
  dsgvoTitle: string;
  dsgvoPoint1: string;
  dsgvoPoint2: string;
  dsgvoPoint3: string;
  bottomCtaTitle: string;
  bottomCtaText: string;
  bottomCtaNote: string;
}

export type { LandingDict };

export function LandingPage({
  dict,
  onCtaClick,
}: {
  lang: Locale;
  dict: LandingDict;
  onCtaClick: () => void;
}) {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="w-full px-5 pt-12 pb-16 sm:px-16 sm:pt-20 sm:pb-24 bg-bg-primary">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Links: Text */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium tracking-widest uppercase text-primary">
                {dict.heroEyebrow}
              </span>
            </div>

            <h1 className="mt-5 sm:mt-6 font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-heading)]">
              <span className="block text-4xl sm:text-6xl lg:text-7xl text-text-dark">
                {dict.heroTitle1}
              </span>
              <span className="block text-4xl sm:text-6xl lg:text-7xl text-text-dark">
                {dict.heroTitle2}
              </span>
              <span className="block text-4xl sm:text-6xl lg:text-7xl text-primary">
                {dict.heroTitleHighlight}
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-text-body max-w-[520px]">
              {dict.heroDescription}
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={onCtaClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-accent text-text-white hover:bg-accent-hover active:bg-accent-hover transition-colors shadow-lg shadow-accent/25"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                {dict.ctaButton}
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-text-white transition-colors"
              >
                {dict.ctaSecondary}
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3">
              {["\u{1F1E9}\u{1F1EA}","\u{1F1EC}\u{1F1E7}","\u{1F1F9}\u{1F1F7}","\u{1F1F8}\u{1F1E6}","\u{1F1FA}\u{1F1E6}","\u{1F1F5}\u{1F1F1}","\u{1F1F7}\u{1F1F4}","\u{1F1EE}\u{1F1F7}","\u{1F1F7}\u{1F1FA}","\u{1F1E8}\u{1F1F3}","\u{1F1F7}\u{1F1F8}","\u{1F1ED}\u{1F1F7}","\u{1F1E7}\u{1F1EC}","\u{1F1EB}\u{1F1F7}","\u{1F1EA}\u{1F1F8}","\u{1F1EE}\u{1F1F9}"].map((flag, i) => (
                <span key={i} className="text-lg">{flag}</span>
              ))}
              <span className="text-sm text-text-muted">{dict.flagsLabel}</span>
            </div>
          </div>

          {/* Rechts: Mockup-Karte */}
          <div className="hidden lg:flex w-[420px] shrink-0">
            <div className="w-full bg-card-white rounded-3xl p-8 shadow-xl shadow-text-dark/5 rotate-2">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg text-text-dark font-[family-name:var(--font-heading)]">Meldebescheinigung</h3>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Analysiert
                </span>
              </div>
              <div className="h-px bg-surface-warm mb-5" />
              <div className="space-y-4">
                <div><p className="text-xs text-text-muted">Familienname</p><p className="text-sm font-semibold text-text-dark">Mustermann</p></div>
                <div><p className="text-xs text-text-muted">Geburtsdatum</p><p className="text-sm font-semibold text-text-dark">15.03.1990</p></div>
                <div><p className="text-xs text-text-muted">Neue Anschrift</p><p className="text-sm font-semibold text-text-dark">Musterstraße 12, 26121 Oldenburg</p></div>
              </div>
              <div className="h-px bg-surface-warm my-5" />
              <div className="flex items-center gap-3 bg-primary/5 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                <span className="text-sm text-text-muted">Fragen? Fragen Sie den KI-Assistenten...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="w-full bg-bg-sand">
        <div className="max-w-[1200px] mx-auto px-5 py-6 sm:px-16 sm:py-8">
          <div className="flex flex-wrap justify-center sm:justify-around gap-6 sm:gap-4">
            <TrustItem icon="heart" text={dict.trustFree} />
            <TrustItem icon="shield" text={dict.trustDsgvo} />
            <TrustItem icon="user" text={dict.trustNoAccount} />
            <TrustItem icon="globe" text={dict.trustLanguages} />
          </div>
        </div>
      </section>

      {/* So funktioniert es */}
      <section id="how-it-works" className="w-full px-5 py-16 sm:px-16 sm:py-24 bg-bg-primary scroll-mt-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs sm:text-sm font-medium tracking-widest uppercase text-primary">{dict.howItWorksEyebrow}</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold text-text-dark font-[family-name:var(--font-heading)] leading-tight">{dict.howItWorksTitle}</h2>
            <p className="mt-4 text-base sm:text-lg text-text-body leading-relaxed">{dict.howItWorksSubtitle}</p>
          </div>
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StepCard num="01" color="primary" icon="cloud" title={dict.step1Title} text={dict.step1Text} />
            <StepCard num="02" color="accent" icon="sparkles" title={dict.step2Title} text={dict.step2Text} />
            <StepCard num="03" color="primary" icon="languages" title={dict.step3Title} text={dict.step3Text} />
          </div>
        </div>
      </section>

      {/* Features — Dunkel */}
      <section className="w-full px-5 py-16 sm:px-16 sm:py-24 bg-bg-dark">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs sm:text-sm font-medium tracking-widest uppercase text-accent">{dict.featuresEyebrow}</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold text-text-white font-[family-name:var(--font-heading)] leading-tight">{dict.featuresTitle}</h2>
          </div>
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard title={dict.feature1Title} text={dict.feature1Text} />
            <FeatureCard title={dict.feature2Title} text={dict.feature2Text} />
            <FeatureCard title={dict.feature3Title} text={dict.feature3Text} />
            <FeatureCard title={dict.feature4Title} text={dict.feature4Text} />
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="w-full px-5 py-16 sm:px-16 sm:py-24 bg-bg-sand">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-7xl sm:text-9xl font-extrabold text-primary/15 leading-none select-none">&ldquo;</span>
          <p className="mt-2 sm:mt-4 text-lg sm:text-2xl italic text-text-dark leading-relaxed">
            {dict.testimonialQuote}
          </p>
          <p className="mt-8 text-sm sm:text-base font-medium text-text-body">{dict.testimonialAuthor}</p>
          <div className="mt-3 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </section>

      {/* Sprachen */}
      <section className="w-full px-5 py-16 sm:px-16 sm:py-24 bg-bg-primary">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-text-dark font-[family-name:var(--font-heading)] leading-tight">{dict.languagesTitle}</h2>
            <p className="mt-4 text-base sm:text-lg text-text-body leading-relaxed">{dict.languagesSubtitle}</p>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-5">
            {[
              { flag: "\u{1F1E9}\u{1F1EA}", name: "Deutsch", native: "German" },
              { flag: "\u{1F1EC}\u{1F1E7}", name: "English", native: "Englisch" },
              { flag: "\u{1F1F9}\u{1F1F7}", name: "T\u00FCrk\u00E7e", native: "T\u00FCrkisch" },
              { flag: "\u{1F1F8}\u{1F1E6}", name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", native: "Arabisch" },
              { flag: "\u{1F1FA}\u{1F1E6}", name: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430", native: "Ukrainisch" },
              { flag: "\u{1F1F5}\u{1F1F1}", name: "Polski", native: "Polnisch" },
              { flag: "\u{1F1F7}\u{1F1F4}", name: "Rom\u00E2n\u0103", native: "Rum\u00E4nisch" },
              { flag: "\u{1F1EE}\u{1F1F7}", name: "\u0641\u0627\u0631\u0633\u06CC", native: "Persisch" },
              { flag: "\u{1F1F7}\u{1F1FA}", name: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", native: "Russisch" },
              { flag: "\u{1F1E8}\u{1F1F3}", name: "\u4E2D\u6587", native: "Chinesisch" },
              { flag: "\u{1F1F7}\u{1F1F8}", name: "\u0421\u0440\u043F\u0441\u043A\u0438", native: "Serbisch" },
              { flag: "\u{1F1ED}\u{1F1F7}", name: "Hrvatski", native: "Kroatisch" },
              { flag: "\u{1F1E7}\u{1F1EC}", name: "\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438", native: "Bulgarisch" },
              { flag: "\u{1F1EB}\u{1F1F7}", name: "Fran\u00E7ais", native: "Franz\u00F6sisch" },
              { flag: "\u{1F1EA}\u{1F1F8}", name: "Espa\u00F1ol", native: "Spanisch" },
              { flag: "\u{1F1EE}\u{1F1F9}", name: "Italiano", native: "Italienisch" },
            ].map((l) => (
              <LangCard key={l.native} flag={l.flag} name={l.name} native={l.native} />
            ))}
          </div>
        </div>
      </section>

      {/* DSGVO Trust */}
      <section className="w-full px-5 py-16 sm:px-16 sm:py-20 bg-bg-primary">
        <div className="max-w-[900px] mx-auto bg-card-white rounded-2xl p-8 sm:p-12 shadow-lg shadow-text-dark/5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-light">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-text-dark font-[family-name:var(--font-heading)]">{dict.dsgvoTitle}</h3>
              <div className="mt-5 space-y-3.5">
                <DsgvoItem text={dict.dsgvoPoint1} />
                <DsgvoItem text={dict.dsgvoPoint2} />
                <DsgvoItem text={dict.dsgvoPoint3} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full px-5 py-16 sm:px-16 sm:py-24 bg-bg-dark">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-5xl font-bold text-text-white font-[family-name:var(--font-heading)] leading-tight">{dict.bottomCtaTitle}</h2>
          <p className="mt-5 text-base sm:text-lg text-text-white/80">{dict.bottomCtaText}</p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              onClick={onCtaClick}
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold rounded-xl bg-accent text-text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/30"
            >
              {dict.ctaButton}
            </button>
            <p className="text-sm text-text-white/60">{dict.bottomCtaNote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* --- Hilfskomponenten --- */

function TrustItem({ icon, text }: { icon: string; text: string }) {
  const icons: Record<string, React.ReactNode> = {
    heart: <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>,
    shield: <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
    user: <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>,
    globe: <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  };
  return (
    <div className="flex items-center gap-2.5">
      {icons[icon]}
      <span className="text-sm font-medium text-text-dark">{text}</span>
    </div>
  );
}

function StepCard({ num, color, icon, title, text }: { num: string; color: "primary" | "accent"; icon: string; title: string; text: string }) {
  const iconBg = color === "primary" ? "bg-primary/8" : "bg-accent/10";
  const iconColor = color === "primary" ? "text-primary" : "text-accent";
  const numColor = color === "primary" ? "text-primary/15" : "text-accent/15";

  const icons: Record<string, React.ReactNode> = {
    cloud: <svg className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" /></svg>,
    sparkles: <svg className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>,
    languages: <svg className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" /></svg>,
  };

  return (
    <div className="bg-card-white rounded-2xl p-8 sm:p-10 shadow-lg shadow-text-dark/[0.04]">
      <span className={`block text-5xl sm:text-6xl font-extrabold ${numColor} font-[family-name:var(--font-heading)]`}>{num}</span>
      <div className={`mt-5 w-16 h-16 rounded-full ${iconBg} flex items-center justify-center`}>
        {icons[icon]}
      </div>
      <h3 className="mt-5 text-xl font-bold text-text-dark font-[family-name:var(--font-heading)]">{title}</h3>
      <p className="mt-3 text-base text-text-body leading-relaxed">{text}</p>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-text-white/[0.08] rounded-2xl p-7 sm:p-10">
      <h3 className="text-xl font-bold text-text-white font-[family-name:var(--font-heading)]">{title}</h3>
      <p className="mt-3 text-base text-text-white/80 leading-relaxed">{text}</p>
    </div>
  );
}

function LangCard({ flag, name, native }: { flag: string; name: string; native: string }) {
  return (
    <div className="w-40 sm:w-48 bg-card-white rounded-2xl p-6 sm:p-8 text-center shadow-lg shadow-text-dark/[0.04] hover:-translate-y-1 transition-transform">
      <span className="text-4xl" dangerouslySetInnerHTML={{ __html: flag }} />
      <p className="mt-4 text-lg font-bold text-text-dark font-[family-name:var(--font-heading)]" dangerouslySetInnerHTML={{ __html: name }} />
      <p className="mt-1 text-sm text-text-muted">{native}</p>
    </div>
  );
}

function DsgvoItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
      <span className="text-base text-text-body leading-relaxed">{text}</span>
    </div>
  );
}
