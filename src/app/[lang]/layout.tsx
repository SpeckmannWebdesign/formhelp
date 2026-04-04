import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDictionary, hasLocale, isRtl } from "./dictionaries";
import type { Locale } from "@/lib/i18n";
import Link from "next/link";

export async function generateStaticParams() {
  return [
    { lang: "de" },
    { lang: "en" },
    { lang: "tr" },
    { lang: "ar" },
    { lang: "uk" },
    { lang: "pl" },
    { lang: "ro" },
    { lang: "fa" },
    { lang: "ru" },
    { lang: "zh" },
    { lang: "sr" },
    { lang: "hr" },
    { lang: "bg" },
    { lang: "fr" },
    { lang: "es" },
    { lang: "it" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const dir = isRtl(lang) ? "rtl" : "ltr";

  return (
    <div lang={lang} dir={dir}>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full px-5 sm:px-16 bg-bg-primary/95 backdrop-blur-sm border-b border-surface-warm/50">
        <div className="max-w-[1200px] mx-auto h-16 sm:h-[72px] flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="FormHelp" className="h-12 sm:h-14" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={lang as Locale} dict={dict.language} />
          </div>
        </div>
      </nav>

      {children}
      <Footer lang={lang as Locale} dict={dict.footer} />
      <CookieConsent lang={lang as Locale} dict={dict.cookie} />
    </div>
  );
}
