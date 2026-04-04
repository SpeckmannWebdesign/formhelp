"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const COOKIE_CONSENT_KEY = "cookie-consent-accepted";

interface CookieDict {
  text: string;
  privacyLink: string;
  acceptEssential: string;
  acceptAll: string;
}

export default function CookieConsent({
  lang,
  dict,
}: {
  lang: Locale;
  dict: CookieDict;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "all");
    setVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "essential");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card-white border-t border-surface-warm shadow-lg p-4 sm:p-6">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-text-body">
            {dict.text}{" "}
            <Link
              href={`/${lang}/datenschutz`}
              className="text-primary underline hover:text-primary/80"
            >
              {dict.privacyLink}
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={acceptEssential}
            className="px-4 py-2 text-sm rounded-xl border-2 border-surface-warm text-text-body hover:bg-bg-sand transition-colors"
          >
            {dict.acceptEssential}
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-sm rounded-xl bg-primary text-text-white hover:bg-primary/90 transition-colors font-medium"
          >
            {dict.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
