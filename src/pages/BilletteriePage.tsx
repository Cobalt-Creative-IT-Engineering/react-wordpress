import { useACFOptions } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { ErrorBanner } from "../components/ui";
import { BilletterieACF } from "../config/acf-schemas";

export function BilletteriePage() {
  const { data: options } = useACFOptions();
  const billetterie = acfReader(options as Record<string, unknown> | null, BilletterieACF);

  const ticketUrl =
    billetterie.first("url", "urlAlt") ||
    (import.meta.env.VITE_TICKETING_URL as string | undefined) ||
    "";

  return (
    <main className="page-content">
      <div className="page-header">
        <h1 className="page-title">Billetterie</h1>
        <p className="page-subtitle">Réserve tes places en ligne</p>
      </div>

      <section className="ticket-info">
        <div>
          <h2 className="ticket-title">Pass festival &amp; journée</h2>
          <p className="ticket-copy">
            Accès à toutes les scènes, zones chill et expériences immersives. Places limitées.
          </p>
        </div>
        <div className="ticket-grid">
          <TicketCard label="Pass 3 jours" price="89 CHF" />
          <TicketCard label="Journée"      price="35 CHF" />
          <TicketCard label="Étudiant"     price="25 CHF" />
        </div>
      </section>

      {ticketUrl ? (
        <div className="ticket-wrapper">
          <iframe
            className="ticket-frame"
            src={ticketUrl}
            title="Billetterie"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <ErrorBanner message="Ajoute une URL de billetterie dans ACF Options (billetterie_url)." />
      )}
    </main>
  );
}

function TicketCard({ label, price }: { label: string; price: string }) {
  return (
    <div className="ticket-card">
      <p className="ticket-label">{label}</p>
      <p className="ticket-price">{price}</p>
    </div>
  );
}
