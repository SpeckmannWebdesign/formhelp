import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["de", "en", "tr", "ar", "uk", "pl", "ro", "fa", "ru", "zh", "sr", "hr", "bg", "fr", "es", "it"];
const defaultLocale = "de";

// Browser-Sprache zu unterstützter Locale mappen
function getLocaleFromAcceptLanguage(acceptLanguage: string): string {
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q] = lang.trim().split(";q=");
      return { code: code.trim().toLowerCase(), quality: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    // Exakte Übereinstimmung (z.B. "de", "en", "tr")
    if (locales.includes(code)) return code;

    // Prefix-Match (z.B. "de-DE" → "de", "en-US" → "en")
    const prefix = code.split("-")[0];
    if (locales.includes(prefix)) return prefix;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prüfen ob bereits eine Locale im Pfad ist
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Immer auf Deutsch starten — Nutzer kann in der App umschalten
  const locale = defaultLocale;

  // Weiterleitung zur Locale-URL
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Alle Pfade außer API, statische Dateien, Bilder und Metadaten
    "/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.png|favicon\\.svg|icon|apple-icon|apple-touch-icon\\.png|logo\\.png|logo\\.svg|sitemap\\.xml|robots\\.txt|uploads).*)",
  ],
};
