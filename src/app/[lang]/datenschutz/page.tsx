import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – Formular-Ausfüllhilfe",
  description:
    "Datenschutzerklärung gemäß DSGVO für die Formular-Ausfüllhilfe.",
};

export default function DatenschutzPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950 font-sans">
      <main className="w-full max-w-3xl px-4 py-12 sm:py-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Datenschutzerklärung
        </h1>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              1. Verantwortlicher
            </h2>
            <p>
              Muster GmbH
              <br />
              Musterstraße 1
              <br />
              12345 Musterstadt
              <br />
              E-Mail: info@muster-gmbh.de
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p>
              Beim Besuch unserer Website werden automatisch Informationen
              durch den Browser übermittelt und in Server-Logfiles
              gespeichert. Dies umfasst:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Browsertyp und -version</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>IP-Adresse des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
            </ul>
            <p>
              Diese Daten sind nicht bestimmten Personen zuordenbar. Eine
              Zusammenführung mit anderen Datenquellen wird nicht
              vorgenommen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              3. Nutzung hochgeladener Formulare
            </h2>
            <p>
              Wenn Sie ein PDF-Formular über unsere Plattform hochladen,
              wird dieses temporär auf unserem Server gespeichert, um Ihnen
              bei der Ausfüllung zu helfen. Die hochgeladenen Dateien
              werden nach Abschluss der Bearbeitung automatisch gelöscht.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Erfüllung
              eines Vertrags bzw. vorvertragliche Maßnahmen).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              4. Cookies
            </h2>
            <p>
              Unsere Website verwendet Cookies. Cookies sind kleine
              Textdateien, die auf Ihrem Endgerät gespeichert werden.
              Einige Cookies sind technisch notwendig (z.&nbsp;B.
              Session-Cookies), andere dienen der Analyse oder Optimierung.
            </p>
            <p>
              Sie können Ihre Browser-Einstellungen so konfigurieren, dass
              Sie über das Setzen von Cookies informiert werden und diese
              einzeln ablehnen können.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              5. Ihre Rechte
            </h2>
            <p>Sie haben gemäß DSGVO folgende Rechte:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Auskunft</strong> (Art. 15 DSGVO): Sie können
                Auskunft über Ihre gespeicherten Daten verlangen.
              </li>
              <li>
                <strong>Berichtigung</strong> (Art. 16 DSGVO): Sie können
                die Berichtigung unrichtiger Daten verlangen.
              </li>
              <li>
                <strong>Löschung</strong> (Art. 17 DSGVO): Sie können die
                Löschung Ihrer Daten verlangen.
              </li>
              <li>
                <strong>Einschränkung</strong> (Art. 18 DSGVO): Sie können
                die Einschränkung der Verarbeitung verlangen.
              </li>
              <li>
                <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO): Sie
                können Ihre Daten in einem gängigen Format erhalten.
              </li>
              <li>
                <strong>Widerspruch</strong> (Art. 21 DSGVO): Sie können
                der Verarbeitung Ihrer Daten widersprechen.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              6. Beschwerderecht
            </h2>
            <p>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
              über die Verarbeitung Ihrer personenbezogenen Daten zu
              beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              7. Aktualität und Änderung dieser Datenschutzerklärung
            </h2>
            <p>
              Diese Datenschutzerklärung ist aktuell gültig und hat den
              Stand April 2026. Durch die Weiterentwicklung unserer Website
              oder aufgrund geänderter gesetzlicher Vorgaben kann eine
              Anpassung notwendig werden.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
