// ─── Page Infos Pratiques — version ACF/GraphQL ───────────────────────────────
// Sections vides si pas de contenu dans WP. Voir InfosPratiques2Page pour la
// version statique de référence.
import React from "react";
import { useGraphQLOptions } from "../hooks/useWordPress";
import { WPContent } from "../components/ui";

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

export function InfosPratiquesPage() {
  const { data } = useGraphQLOptions();
  const ip = data?.informationsPratiques?.infosPratiques;

  const gqlMap: Record<string, string | undefined> = {
    transports:   ip?.transportsContenu,
    horaires:     ip?.horairesContenu,
    scenes:       ip?.scenesContenu,
    restauration: ip?.restaurationContenu,
    securite:     ip?.securiteContenu,
    hebergement:  ip?.hebergementContenu,
  };

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
          {NAV.map((item) => {
            const html = gqlMap[item.id] || null;
            return (
              <div key={item.id} id={item.id} className="ip-section">
                <h2>{item.label}</h2>
                {html && <WPContent html={html} className="prose-custom" />}
              </div>
            );
          })}
        </section>

      </div>
    </main>
  );
}
