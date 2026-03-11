// ─── Page Infos Pratiques — version ACF/GraphQL ───────────────────────────────
// Sections vides si pas de contenu dans WP. Voir InfosPratiques2Page pour la
// version statique de référence.
import { useGraphQLOptions } from "../hooks/useWordPress";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { WPContent, Sticker } from "../components/ui";
import sticker09 from "../assets/images/stickers/Franco2026_Sticker_09.png";
import sticker01 from "../assets/images/stickers/Franco2026_Sticker_01.png";
import sticker03 from "../assets/images/stickers/Franco2026_Sticker_03.png";
import sticker07 from "../assets/images/stickers/Franco2026_Sticker_07.png";

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
  const activeId = useScrollSpy(NAV.map((i) => i.id));

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
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={scrollToSection(item.id)}
              className={`side-link${activeId === item.id ? " side-link--active" : ""}`}
            >
              {item.label}
            </a>
          ))}
          <div className="side-stickers">
            <Sticker src={sticker09} size={90} rotate={-10} style={{ top: 0, left: 0 }} />
            <Sticker src={sticker01} size={90} rotate={14} style={{ top: 10, right: 0 }} />
          </div>
        </aside>

        <section className="content-column">
          {NAV.map((item) => {
            const html = gqlMap[item.id] || null;
            if (!html) return null;
            return (
              <div key={item.id} id={item.id} className="ip-section">
                <h2>{item.label}</h2>
                <WPContent html={html} className="prose-custom" />
                {item.id === "scenes"      && <Sticker src={sticker03} size={120} rotate={-7}  style={{ bottom: 16, right: 16 }} />}
                {item.id === "hebergement" && <Sticker src={sticker07} size={120} rotate={10}  style={{ bottom: 16, right: 16 }} />}
              </div>
            );
          })}
        </section>

      </div>
    </main>
  );
}
