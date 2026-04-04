import Link from "next/link";
import type { Locale } from "@/lib/i18n";

interface FooterDict {
  copyright: string;
  impressum: string;
  datenschutz: string;
  description: string;
  legalLabel: string;
  languagesLabel: string;
}

export default function Footer({
  lang,
  dict,
}: {
  lang: Locale;
  dict: FooterDict;
}) {
  return (
    <footer className="w-full bg-bg-footer">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-16 py-12">
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-8 sm:justify-between">
          {/* Logo & Beschreibung */}
          <div className="max-w-[280px]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span className="text-lg font-bold text-text-white font-[family-name:var(--font-heading)]">
                FormHelp
              </span>
            </div>
            <p className="mt-3 text-sm text-text-white/60 leading-relaxed">
              {dict.description}
            </p>
          </div>

          {/* Rechtliches */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-text-white/40 mb-3">
              {dict.legalLabel}
            </p>
            <nav className="flex flex-col gap-2.5">
              <Link
                href={`/${lang}/impressum`}
                className="text-sm text-text-white/80 hover:text-text-white transition-colors"
              >
                {dict.impressum}
              </Link>
              <Link
                href={`/${lang}/datenschutz`}
                className="text-sm text-text-white/80 hover:text-text-white transition-colors"
              >
                {dict.datenschutz}
              </Link>
            </nav>
          </div>

          {/* Sprachen */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-text-white/40 mb-3">
              {dict.languagesLabel}
            </p>
            <div className="flex flex-col gap-2.5">
              <span className="text-sm text-text-white/80">Deutsch</span>
              <span className="text-sm text-text-white/80">English</span>
              <span className="text-sm text-text-white/80">T&uuml;rk&ccedil;e</span>
              <span className="text-sm text-text-white/80">&#1575;&#1604;&#1593;&#1585;&#1576;&#1610;&#1577;</span>
              <span className="text-sm text-text-white/80">&#1059;&#1082;&#1088;&#1072;&#1111;&#1085;&#1089;&#1100;&#1082;&#1072;</span>
            </div>
          </div>
        </div>

        {/* Trennlinie + Copyright */}
        <div className="mt-10 pt-6 border-t border-text-white/10">
          <p className="text-center text-xs text-text-white/40">
            &copy; {new Date().getFullYear()} {dict.copyright}. Mit KI-Unterst&uuml;tzung von Anthropic.
          </p>
        </div>
      </div>
    </footer>
  );
}
