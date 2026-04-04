import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum – FormHelp",
  description: "Impressum und Anbieterkennzeichnung.",
};

export default function ImpressumPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-bg-primary">
      <main className="w-full max-w-3xl px-5 sm:px-16 py-12 sm:py-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-dark mb-8 font-[family-name:var(--font-plus-jakarta-sans)]">
          Impressum
        </h1>

        <div className="space-y-6 text-text-body leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-dark mb-2">
              Angaben zum Unternehmen
            </h2>
            <p>
              Speckmann Webdesign GmbH
              <br />
              Dwaschweg 5
              <br />
              26133 Oldenburg
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark mb-2">
              Vertreten durch
            </h2>
            <p>Marcel Speckmann (Geschäftsführer)</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark mb-2">
              Kontakt
            </h2>
            <p>
              Telefon: 015208709068
              <br />
              E-Mail: info@speckmann-webdesign.de
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark mb-2">
              Registereintrag
            </h2>
            <p>
              Eintragung im Handelsregister
              <br />
              Registergericht: Amtsgericht Oldenburg
              <br />
              Registernummer: HRB 221809
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark mb-2">
              Umsatzsteuer-ID
            </h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a
              Umsatzsteuergesetz:
              <br />
              DE451681191
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark mb-2">
              Berufsbezeichnung
            </h2>
            <p>Webdesigner</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark mb-2">
              Redaktionell verantwortlich
            </h2>
            <p>Marcel Speckmann</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-dark mb-2">
              Streitschlichtung
            </h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
