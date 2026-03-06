// ─── Page Le Festival 2 — version statique ───────────────────────────────────
// Contenu entièrement en dur, sans connexion ACF/GraphQL.
// Route : #/festival-2 — non présente dans la navigation.
import React from "react";

const NAV = [
  { label: "Présentation",              id: "presentation" },
  { label: "L'équipe des Francomanias", id: "equipe" },
  { label: "Archives",                  id: "archives" },
  { label: "Contact",                   id: "contact" },
  { label: "Presse",                    id: "presse" },
  { label: "Photographes",              id: "photographes" },
  { label: "Partenaires",               id: "partenaires" },
] as const;

function scrollToSection(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

export function LeFestival2Page() {
  return (
    <main className="page-content">
      <div className="two-col">

        <aside className="side-links">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={scrollToSection(item.id)} className="side-link">
              {item.label}
            </a>
          ))}
        </aside>

        <section className="content-column">

          {/* ── Présentation ────────────────────────────────────────────── */}
          <div id="presentation" className="ip-section">
            <h2>Présentation</h2>
            <h3>Histoire des Francomanias</h3>
            <p>
              Né à Bulle en 2013, Francomanias est un festival de musiques actuelles francophones qui
              investit chaque été le cœur de la vieille ville. Porté par une association à but non
              lucratif, il réunit chaque année plusieurs milliers de festivalières et festivaliers autour
              d'une programmation éclectique et exigeante.
            </p>
            <h3>Mission, valeurs et engagement</h3>
            <p>
              Francomanias s'engage à réduire son empreinte environnementale : gobelets réutilisables,
              tri sélectif, mobilité douce encouragée, partenariat avec des producteurs locaux.
            </p>
          </div>

          {/* ── Équipe ──────────────────────────────────────────────────── */}
          <div id="equipe" className="ip-section">
            <h2>L'équipe des Francomanias</h2>
            <div className="ip-team-grid">
              <div>
                <h3>Direction</h3>
                <ul>
                  <li>Directrice générale</li>
                  <li>Directeur artistique</li>
                  <li>Directeur technique</li>
                </ul>
              </div>
              <div>
                <h3>Communication & Production</h3>
                <ul>
                  <li>Responsable communication</li>
                  <li>Chargée de production</li>
                  <li>Coordinatrice bénévoles</li>
                </ul>
              </div>
              <div>
                <h3>Administration</h3>
                <ul>
                  <li>Responsable administratif</li>
                  <li>Comptabilité</li>
                </ul>
              </div>
              <div>
                <h3>Billetterie & Accueil</h3>
                <ul>
                  <li>Responsable billetterie</li>
                  <li>Équipe d'accueil</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Archives ────────────────────────────────────────────────── */}
          <div id="archives" className="ip-section">
            <h2>Archives</h2>
            <div className="ip-archives-grid">
              {[2018, 2019, 2020, 2021, 2022, 2023].map((year) => (
                <div key={year} className="ip-archive-card">
                  <div className="ip-archive-img" aria-hidden="true" />
                  <span className="ip-archive-year">{year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Contact ─────────────────────────────────────────────────── */}
          <div id="contact" className="ip-section">
            <h2>Contact</h2>
            <div className="ip-contact-grid">
              <div>
                <h3>Bureau</h3>
                <p>Rue des Alpes 15<br />1630 Bulle, Suisse</p>
                <p><a href="mailto:info@francomanias.ch">info@francomanias.ch</a></p>
              </div>
              <div>
                <h3>Billetterie</h3>
                <p><a href="mailto:billetterie@francomanias.ch">billetterie@francomanias.ch</a></p>
                <h3>Bénévoles</h3>
                <p><a href="mailto:benevoles@francomanias.ch">benevoles@francomanias.ch</a></p>
              </div>
              <div>
                <h3>Presse</h3>
                <p><a href="mailto:presse@francomanias.ch">presse@francomanias.ch</a></p>
                <h3>Restauration</h3>
                <p><a href="mailto:restauration@francomanias.ch">restauration@francomanias.ch</a></p>
              </div>
            </div>
            <p><a href="mailto:info@francomanias.ch" className="ip-link-arrow">→ Formulaire de contact</a></p>
          </div>

          {/* ── Presse ──────────────────────────────────────────────────── */}
          <div id="presse" className="ip-section">
            <h2>Presse</h2>
            <p>
              Communiqués de presse, photos haute résolution, kit média et accréditations disponibles
              sur demande pour les journalistes accrédités.
            </p>
            <ul>
              <li><a href="mailto:presse@francomanias.ch" className="ip-link-arrow">→ Photos du festival</a></li>
              <li><a href="mailto:presse@francomanias.ch" className="ip-link-arrow">→ Communiqués de presse</a></li>
              <li><a href="mailto:presse@francomanias.ch" className="ip-link-arrow">→ Kit média</a></li>
              <li><a href="mailto:presse@francomanias.ch" className="ip-link-arrow">→ Accréditations</a></li>
            </ul>
          </div>

          {/* ── Photographes ────────────────────────────────────────────── */}
          <div id="photographes" className="ip-section">
            <h2>Photographes</h2>
            <p>
              Vous souhaitez couvrir le festival en tant que photographe accrédité ? Toutes les demandes
              doivent être soumises avant le 1er août via le formulaire dédié.
            </p>
            <p><a href="mailto:photo@francomanias.ch" className="ip-link-arrow">→ Formulaire photographe</a></p>
          </div>

          {/* ── Partenaires ─────────────────────────────────────────────── */}
          <div id="partenaires" className="ip-section">
            <h2>Partenaires</h2>
            <h3>Principale</h3>
            <div className="ip-partners-row">
              <div className="ip-partner-logo">GESA</div>
              <div className="ip-partner-logo">Groupe Griboni</div>
              <div className="ip-partner-logo">Swisslos</div>
              <div className="ip-partner-logo">Raiffeisen</div>
            </div>
            <h3>Institutionnelle</h3>
            <div className="ip-partners-row">
              <div className="ip-partner-logo">GESA</div>
              <div className="ip-partner-logo">Groupe Griboni</div>
              <div className="ip-partner-logo">Raiffeisen</div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
