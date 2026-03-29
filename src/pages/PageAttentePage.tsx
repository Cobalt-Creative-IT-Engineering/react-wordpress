import { HeroCanvas, WPContent } from "../components/ui";
import { useGraphQLOptions } from "../hooks/useWordPress";
import { SOCIAL_LINKS } from "../config/site";
import logoCompact from "../assets/logo/francomanias-compact-2026.svg";

type ContactBloc = { titre?: string; email?: string; tel?: string; adresse?: string };

type PageAttenteFields = Record<string, unknown> | null;

export function PageAttentePage({ fields = null }: { fields?: PageAttenteFields }) {
  const { data: festData } = useGraphQLOptions();

  const presentationHtml = typeof fields?.texteDePresentation === "string"
    ? fields.texteDePresentation
    : "";
  const contactBlocs: ContactBloc[] =
    (festData?.leFestival?.leFestivalContact?.contactBlocs as ContactBloc[] | undefined) ?? [];

  return (
    <div className="page-attente">

      {/* ── Hero plein écran ─────────────────────────────────────────── */}
      <section className="festival-hero page-attente-hero">
        <HeroCanvas />
        <div className="hero-content">
          <div
            className="hero-logo-compact"
            style={{
              WebkitMaskImage: `url(${logoCompact})`,
              maskImage: `url(${logoCompact})`,
            }}
            aria-label="Francomanias"
          />
        </div>
        <button
          className="hero-scroll-arrow"
          aria-label="Défiler vers le bas"
          onClick={() => {
            document.querySelector<HTMLElement>(".page-attente-content")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          ↓
        </button>
      </section>

      {/* ── Contenu ──────────────────────────────────────────────────── */}
      <div className="page-attente-content">

        {/* Texte de présentation */}
        {presentationHtml && (
          <div className="page-attente-presentation prose-custom">
            <WPContent html={presentationHtml} />
          </div>
        )}

        {/* Réseaux sociaux */}
        <div className="footer-social page-attente-social">
          <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Facebook">
            <svg width="20" height="20" viewBox="-337 273 123.5 256" fill="currentColor" aria-hidden="true"><path d="M-260.9,327.8c0-10.3,9.2-14,19.5-14c10.3,0,21.3,3.2,21.3,3.2l6.6-39.2c0,0-14-4.8-47.4-4.8c-20.5,0-32.4,7.8-41.1,19.3c-8.2,10.9-8.5,28.4-8.5,39.7v25.7H-337V396h26.5v133h49.6V396h39.3l2.9-38.3h-42.2V327.8z"/></svg>
          </a>
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"/><path d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z"/><path fillRule="evenodd" clipRule="evenodd" d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z"/></svg>
          </a>
          <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Twitter / X">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z" strokeWidth="1"/></svg>
          </a>
          <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="footer-social-link" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 260.366 260.366" fill="currentColor" aria-hidden="true"><path d="M34.703,0.183C15.582,0.183,0.014,15.748,0,34.884C0,54.02,15.568,69.588,34.703,69.588c19.128,0,34.688-15.568,34.688-34.704C69.391,15.75,53.83,0.183,34.703,0.183z"/><path d="M60.748,83.531H8.654c-2.478,0-4.488,2.009-4.488,4.489v167.675c0,2.479,2.01,4.488,4.488,4.488h52.093c2.479,0,4.489-2.01,4.489-4.488V88.02C65.237,85.539,63.227,83.531,60.748,83.531z"/><path d="M193.924,81.557c-19.064,0-35.817,5.805-46.04,15.271V88.02c0-2.48-2.01-4.489-4.489-4.489H93.424c-2.479,0-4.489,2.009-4.489,4.489v167.675c0,2.479,2.01,4.488,4.489,4.488h52.044c2.479,0,4.489-2.01,4.489-4.488v-82.957c0-23.802,4.378-38.555,26.227-38.555c21.526,0.026,23.137,15.846,23.137,39.977v81.535c0,2.479,2.01,4.488,4.49,4.488h52.068c2.478,0,4.488-2.01,4.488-4.488v-91.977C260.366,125.465,252.814,81.557,193.924,81.557z"/></svg>
          </a>
          <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="footer-social-link" aria-label="YouTube">
            <svg width="20" height="20" viewBox="0 -3 20 20" fill="currentColor" aria-hidden="true"><g transform="translate(-300,-7442)"><g transform="translate(56,160)"><path d="M251.988432,7291.58588 L251.988432,7285.97425 C253.980638,7286.91168 255.523602,7287.8172 257.348463,7288.79353 C255.843351,7289.62824 253.980638,7290.56468 251.988432,7291.58588 M263.090998,7283.18289 C262.747343,7282.73013 262.161634,7282.37809 261.538073,7282.26141 C259.705243,7281.91336 248.270974,7281.91237 246.439141,7282.26141 C245.939097,7282.35515 245.493839,7282.58153 245.111335,7282.93357 C243.49964,7284.42947 244.004664,7292.45151 244.393145,7293.75096 C244.556505,7294.31342 244.767679,7294.71931 245.033639,7294.98558 C245.376298,7295.33761 245.845463,7295.57995 246.384355,7295.68865 C247.893451,7296.0008 255.668037,7296.17532 261.506198,7295.73552 C262.044094,7295.64178 262.520231,7295.39147 262.895762,7295.02447 C264.385932,7293.53455 264.28433,7285.06174 263.090998,7283.18289"/></g></g></svg>
          </a>
        </div>

        {/* Contact — reprise depuis Le Festival */}
        {contactBlocs.length > 0 && (
          <div className="page-attente-contact">
            {contactBlocs.map((bloc, i) => (
              <div key={i} className="page-attente-contact-bloc">
                {bloc.titre && <h3>{bloc.titre}</h3>}
                {bloc.adresse && (
                  <div className="ip-contact-address" dangerouslySetInnerHTML={{ __html: bloc.adresse }} />
                )}
                {bloc.email && (
                  <div><a href={`mailto:${bloc.email}`}>{bloc.email}</a></div>
                )}
                {bloc.tel && (
                  <div><a href={`tel:${bloc.tel.replace(/\s/g, "")}`}>{bloc.tel}</a></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="page-attente-credits">
        <div className="page-attente-credits-inner">
          <span>© {new Date().getFullYear()} Francomanias — Tous droits réservés</span>
          <div>Développement : <a href="https://cobalt-it.ch/" target="_blank" rel="noreferrer">Cobalt</a> / Design : <a href="https://paradoxe.studio" target="_blank" rel="noreferrer">Paradoxe</a> x <a href="https://www.atelier-murmure.ch" target="_blank" rel="noreferrer">Murmure</a></div>
        </div>
      </div>
    </div>
  );
}
