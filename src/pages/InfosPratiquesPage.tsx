// ─── Page Infos Pratiques ─────────────────────────────────────────────────────
// Charge le contenu depuis la page WP slug="informations-pratiques" via ACF.
// Si les champs ACF sont vides (page non encore créée), affiche un contenu
// statique de remplacement pour chaque section.
import React from "react";
import { useACFOptionsPage } from "../hooks/useWordPress";
import { WPContent } from "../components/ui";
import { InformationsACF } from "../config/acf-schemas";

const NAV = [
  { label: "Transports & Accès",  id: "transports" },
  { label: "Horaires",            id: "horaires" },
  { label: "Scènes & Lieux",      id: "scenes" },
  { label: "Restauration & Bars", id: "restauration" },
  { label: "Sécurité",            id: "securite" },
  { label: "Hébergement",         id: "hebergement" },
] as const;

function scrollToSection(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

// ─── Contenus statiques de secours ────────────────────────────────────────────

function StaticTransports() {
  return (
    <>
      <h3>Transports publics</h3>
      <p>
        La ville de Bulle est desservie par des liaisons CFF directes depuis Fribourg, Lausanne et
        Berne. Depuis la gare de Bulle, le site du festival est accessible à pied en 10 minutes ou
        en navette gratuite (service disponible dès 15h jusqu'en fin de soirée).
      </p>
      <ul>
        <li>→ CFF — <a href="https://www.sbb.ch" target="_blank" rel="noreferrer">sbb.ch</a></li>
        <li>→ TPF (transports publics fribourgeois) — <a href="https://www.tpf.ch" target="_blank" rel="noreferrer">tpf.ch</a></li>
      </ul>
      <h3>Mobilité douce</h3>
      <p>
        Des places de stationnement vélos sont disponibles à l'entrée principale. Des stations
        PubliBike sont implantées à proximité de la Place du Marché et de la Gare.
      </p>
      <ul>
        <li>→ <a href="https://www.publibike.ch" target="_blank" rel="noreferrer">PubliBike</a></li>
        <li>→ <a href="https://www.mobility.ch" target="_blank" rel="noreferrer">Mobility</a></li>
        <li>→ <a href="https://www.blablacar.ch" target="_blank" rel="noreferrer">Covoiturage BlaBlaCar</a></li>
      </ul>
      <h3>En voiture</h3>
      <p>
        Plusieurs parkings publics sont disponibles dans un rayon de 500 m du site.
        Parking de la Condémine (gratuit le soir), Parking Hôtel de Ville et Parking du Centre.
      </p>
      <ul>
        <li>→ <a href="https://maps.google.com" target="_blank" rel="noreferrer">Voir sur la carte</a></li>
        <li>→ Liste des taxis locaux disponible à l'entrée</li>
      </ul>
      <div className="ip-callout">
        <strong>Mobilité réduite</strong>
        <p>
          Tous les espaces du festival sont adaptés aux personnes à mobilité réduite — scènes,
          sanitaires et stands de restauration inclus. Des places de stationnement réservées se
          trouvent à l'entrée du site (50 m de l'accueil). Réservations obligatoires à
          billetterie@francomanias.ch
        </p>
      </div>
    </>
  );
}

function StaticHoraires() {
  return (
    <>
      <p>
        Le site du festival ouvre ses portes à partir de 16h chaque soir. Les concerts débutent à
        17h et se terminent à 2h du matin. La dernière entrée est fixée à 23h.
      </p>
      <ul>
        <li><strong>Jeudi 27 août</strong> — Ouverture 16h · Fin des concerts 1h</li>
        <li><strong>Vendredi 28 août</strong> — Ouverture 15h · Fin des concerts 2h</li>
        <li><strong>Samedi 29 août</strong> — Ouverture 14h · Fin des concerts 2h</li>
        <li><strong>Dimanche 30 août</strong> — Ouverture 14h · Fin des concerts 23h</li>
      </ul>
    </>
  );
}

function StaticScenes() {
  return (
    <>
      <p>
        Le festival Francomanias investit le cœur de la ville de Bulle avec trois scènes réparties
        sur les places emblématiques de la cité.
      </p>
      <h3>Place du Marché</h3>
      <p>
        Scène principale en plein air, capacité 5 000 personnes. C'est ici que se déroulent les
        têtes d'affiche chaque soir dès 21h.
      </p>
      <h3>Hôtel de Ville</h3>
      <p>
        Scène intimiste abritée sous le porche de l'Hôtel de Ville, idéale pour les artistes
        francophones émergents et les showcases acoustiques.
      </p>
      <h3>Ebullition</h3>
      <p>
        Salle indoor de 800 places dédiée aux artistes régionaux et aux créations originales.
        Programmation dès 17h chaque jour.
      </p>
    </>
  );
}

function StaticRestauration() {
  return (
    <>
      <p>
        Dans l'esprit des Francomanias, une restauration de qualité reflétant la richesse culinaire
        des cultures francophones vous est proposée sur l'ensemble du site.
      </p>
      <p>
        Une liste des établissements situés à Bulle et dans les environs est disponible sur le site
        de La Gruyère Tourisme.
      </p>
      <ul>
        <li>→ Demande d'emplacement bars/restauration : <a href="mailto:info@francomanias.ch">info@francomanias.ch</a></li>
      </ul>
    </>
  );
}

function StaticSecurite() {
  return (
    <>
      <h3>Accessibilité</h3>
      <p>
        Tous les lieux du festival sont accessibles aux personnes à mobilité réduite et en chaise
        roulante. Réservations obligatoires à billetterie@francomanias.ch
      </p>
      <h3>Animaux</h3>
      <p>
        La présence de chiens ou tout autre animal n'est pas autorisée au sein de l'Hôtel de Ville
        ni d'Ebullition. Sur la Place du Marché, les chiens tenus en laisse sont admis en dehors
        des zones de fosse. Les organisateurs déclinent toute responsabilité.
      </p>
      <h3>Alcool</h3>
      <p>
        Les paiements auprès des Francomanias et de la billetterie s'effectuent uniquement par carte
        ou Twint. Dans l'espace bars, les boissons alcoolisées ne sont pas servies aux mineurs.
      </p>
      <h3>Enfants</h3>
      <p>
        Les législations suisses et friburgeoises prohibent tout commerce, consommation et possession
        de tabac ainsi que la vente d'alcool aux moins de 18 ans. Les enfants de moins de 6 ans ne
        sont pas admis dans les espaces concerts.
      </p>
      <h3>Fumée</h3>
      <p>
        L'Hôtel de Ville et Ebullition sont deux lieux non-fumeurs. Il est interdit de fumer dans
        l'enceinte des scènes couvertes. Des espaces fumeurs sont aménagés à l'écart des activités
        principales du festival.
      </p>
      <h3>Puissance sonore</h3>
      <p>
        Le Festival s'engage à respecter les normes en vigueur concernant le volume sonore et la
        protection de l'ouïe. Des bouchons d'oreilles sont distribués gratuitement.
      </p>
    </>
  );
}

function StaticHebergement() {
  return (
    <>
      <p>
        Les acteurs du festival disposent d'un large choix d'hébergements dans un rayon de 20 minutes
        de la ville de Bulle. En camping ou en hôtel, plusieurs catégories de prix sont disponibles.
        La plateforme de réservation d'hôtels de La Gruyère Tourisme regroupe les différentes
        catégories de prix qui sont à disposition, à des prix avantageux (à confirmer pour 2026).
      </p>
      <p>Un tarif préférentiel pour le site festivalier sera communiqué prochainement.</p>
      <p>
        La liste des hôtels situés à Bulle et dans les environs est à retrouver sur le site de La
        Gruyère Tourisme.
      </p>
    </>
  );
}

const STATIC_FALLBACKS: Record<string, React.FC> = {
  transports:   StaticTransports,
  horaires:     StaticHoraires,
  scenes:       StaticScenes,
  restauration: StaticRestauration,
  securite:     StaticSecurite,
  hebergement:  StaticHebergement,
};

export function InfosPratiquesPage() {
  const { data } = useACFOptionsPage("informations-pratiques");
  const acf = data ?? {};

  return (
    <main className="page-content">
      <div className="two-col">

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className="side-links">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={scrollToSection(item.id)} className="side-link">
              {item.label}
            </a>
          ))}
        </aside>

        {/* ── Contenu ───────────────────────────────────────────────────── */}
        <section className="content-column">
          {NAV.map((item) => {
            const fieldKey = InformationsACF[item.id as keyof typeof InformationsACF];
            const html = typeof acf[fieldKey] === "string" && (acf[fieldKey] as string).length > 0
              ? acf[fieldKey] as string
              : null;
            const Fallback = STATIC_FALLBACKS[item.id];
            return (
              <div key={item.id} id={item.id} className="ip-section">
                <h2>{item.label}</h2>
                {html
                  ? <WPContent html={html} className="prose-custom" />
                  : <Fallback />
                }
              </div>
            );
          })}
        </section>

      </div>
    </main>
  );
}
