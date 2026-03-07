import { usePage } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";

// ─── Contenu statique de fallback par slug ────────────────────────────────
// Remplace ces sections par du contenu WP (page.content) une fois connecté.

type SidebarLink = { label: string; url: string };
type HardSection = { id: string; title: string; content: string };

const HARD_LINKS: Record<string, SidebarLink[]> = {
  informations: [
    { label: "Transports & Accès",  url: "#transports" },
    { label: "Horaires",            url: "#horaires" },
    { label: "Scènes & Lieux",      url: "#scenes" },
    { label: "Restauration & Bars", url: "#restauration" },
    { label: "Sécurité",            url: "#securite" },
    { label: "Hébergement",         url: "#hebergement" },
  ],
  histoire: [
    { label: "Nos origines",    url: "#origines" },
    { label: "Les éditions",    url: "#editions" },
    { label: "La scène locale", url: "#scene" },
  ],
};

const HARD_SECTIONS: Record<string, HardSection[]> = {
  informations: [
    {
      id:      "transports",
      title:   "Transports & Accès",
      content: "Le festival est accessible en transports publics, à vélo ou en voiture. Des navettes gratuites circulent depuis la gare de Bulle.",
    },
    {
      id:      "horaires",
      title:   "Horaires",
      content: "Ouverture des portes à 16h. Dernière entrée à 23h. Les concerts se terminent à 2h chaque nuit.",
    },
    {
      id:      "scenes",
      title:   "Scènes & Lieux",
      content: "Le festival se déroule sur trois scènes en plein air : Place du Marché, Hôtel de Ville et Ebullition.",
    },
    {
      id:      "restauration",
      title:   "Restauration & Bars",
      content: "Une large sélection de stands de restauration et bars vous attend sur le site. Tous les régimes alimentaires sont représentés.",
    },
    {
      id:      "securite",
      title:   "Sécurité",
      content: "Le festival est entièrement accessible aux personnes à mobilité réduite. Une équipe de sécurité et des secouristes sont présents en permanence.",
    },
    {
      id:      "hebergement",
      title:   "Hébergement",
      content: "Plusieurs hôtels et hébergements sont disponibles à Bulle et dans les environs. Réservez tôt, les places sont limitées en période de festival.",
    },
  ],
  histoire: [
    {
      id:      "origines",
      title:   "Nos origines",
      content: "Né en 2014 dans une cour de quartier, le festival est devenu un rendez-vous estival pour les musiques actuelles.",
    },
    {
      id:      "editions",
      title:   "Les éditions",
      content: "Chaque année, une thématique artistique inspire la scénographie et la programmation.",
    },
    {
      id:      "scene",
      title:   "La scène locale",
      content: "Nous mettons en avant les talents régionaux avec une scène dédiée et des résidencies.",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Extrait les liens de sidebar depuis les champs ACF courants */
function extractACFLinks(acf: Record<string, unknown>): SidebarLink[] {
  const keys = ["sidebar_links", "links", "liens", "navigation"];
  for (const key of keys) {
    const raw = acf[key];
    if (!Array.isArray(raw)) continue;
    const links = raw
      .map((item) => {
        if (typeof item !== "object" || item === null) return null;
        const obj   = item as Record<string, unknown>;
        const label = obj.label ?? obj.title ?? obj.text;
        const url   = obj.url ?? obj.link ?? obj.href;
        if (typeof label === "string" && typeof url === "string") return { label, url };
        return null;
      })
      .filter(Boolean) as SidebarLink[];
    if (links.length > 0) return links;
  }
  return [];
}

// ─── Composant ────────────────────────────────────────────────────────────

interface TwoColumnPageProps {
  slug: string;
}

export function TwoColumnPage({ slug }: TwoColumnPageProps) {
  const { status, data: page, error } = usePage(slug);

  if (status === "loading" && !page) {
    return (
      <main className="page-content">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <div className="two-col">
          <div className="side-links">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
          <div className="content-column">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </main>
    );
  }

  if (status === "error") return <ErrorBanner message={error ?? "Erreur de chargement"} />;
  if (!page)              return <ErrorBanner message="Page introuvable" />;

  const acfLinks  = extractACFLinks(page.acf);
  const acf       = acfReader(page.acf, { linksHtml: "liens_html" });
  const linksHtml = acf.text("linksHtml");
  const hardLinks    = HARD_LINKS[slug]    ?? [];
  const hardSections = HARD_SECTIONS[slug] ?? [];

  return (
    <main className="page-content">
      <div className="two-col">
        <aside className="side-links">
          {hardLinks.map((link) => (
            <a key={link.url} href={`/${slug}${link.url}`} className="side-link">
              {link.label}
            </a>
          ))}
          {acfLinks.length > 0 ? (
            acfLinks.map((link) => (
              <a key={link.url} href={link.url} className="side-link">
                {link.label}
              </a>
            ))
          ) : linksHtml ? (
            <WPContent html={linksHtml} />
          ) : (
            <p className="text-text-muted text-sm">
              Ajoute des liens dans ACF (<code>liens</code> ou <code>sidebar_links</code>).
            </p>
          )}
        </aside>
        <section className="content-column">
          {hardSections.length > 0 && (
            <div className="hard-sections">
              {hardSections.map((section) => (
                <div key={section.id} id={section.id} className="hard-section">
                  <h2>{section.title}</h2>
                  <p>{section.content}</p>
                </div>
              ))}
            </div>
          )}
          <WPContent html={page.content} />
        </section>
      </div>
    </main>
  );
}
