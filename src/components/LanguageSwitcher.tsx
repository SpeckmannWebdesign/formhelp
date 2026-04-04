"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { locales, type Locale } from "@/lib/i18n";

interface LanguageDict {
  label: string;
  [key: string]: string;
}

const localeFlags: Record<string, string> = {
  de: "\u{1F1E9}\u{1F1EA}", en: "\u{1F1EC}\u{1F1E7}", tr: "\u{1F1F9}\u{1F1F7}", ar: "\u{1F1F8}\u{1F1E6}",
  uk: "\u{1F1FA}\u{1F1E6}", pl: "\u{1F1F5}\u{1F1F1}", ro: "\u{1F1F7}\u{1F1F4}", fa: "\u{1F1EE}\u{1F1F7}",
  ru: "\u{1F1F7}\u{1F1FA}", zh: "\u{1F1E8}\u{1F1F3}", sr: "\u{1F1F7}\u{1F1F8}", hr: "\u{1F1ED}\u{1F1F7}",
  bg: "\u{1F1E7}\u{1F1EC}", fr: "\u{1F1EB}\u{1F1F7}", es: "\u{1F1EA}\u{1F1F8}", it: "\u{1F1EE}\u{1F1F9}",
};

export function LanguageSwitcher({
  currentLocale,
  dict,
}: {
  currentLocale: Locale;
  dict: LanguageDict;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pathnameWithoutLocale = pathname.replace(
    new RegExp(`^/${currentLocale}(?=/|$)`),
    ""
  ) || "/";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-card-white border border-surface-warm px-3 py-2 text-sm font-medium text-text-body hover:bg-bg-sand transition-colors"
        aria-label={dict.label}
      >
        <svg
          className="h-4 w-4 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
        {localeFlags[currentLocale]} {dict[currentLocale]}
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 mt-1 w-48 rounded-xl bg-card-white border border-surface-warm shadow-lg z-50">
          {locales.map((locale) => (
            <Link
              key={locale}
              href={`/${locale}${pathnameWithoutLocale}`}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                locale === currentLocale
                  ? "bg-primary/5 text-primary font-medium"
                  : "text-text-body hover:bg-bg-sand"
              }`}
            >
              <span>{localeFlags[locale]}</span>
              {dict[locale]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
