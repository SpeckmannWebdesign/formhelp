import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import { HomeContent } from "@/components/HomeContent";
import type { Locale } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <HomeContent
      lang={lang as Locale}
      dict={dict.home}
      landingDict={dict.landing}
    />
  );
}
