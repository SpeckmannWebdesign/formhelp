import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

// Root-Seite leitet zur Standard-Sprache weiter
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
