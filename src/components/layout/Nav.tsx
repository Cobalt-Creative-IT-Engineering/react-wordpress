import React from "react";
import { NAV_ITEMS } from "../../config/site";
import { useRoute } from "../../hooks/useRoute";
import { useGraphQLSiteOptions } from "../../hooks/useWordPress";
import logoHorizontal from "../../assets/logo/francomanias-horizontal-2026.svg";
import logoCompact    from "../../assets/logo/francomanias-compact-2026.svg";

const leftItems  = NAV_ITEMS.filter((i) => !i.cta);
const rightItems = NAV_ITEMS.filter((i) =>  i.cta);

export function Nav() {
  const { data: gqlData } = useGraphQLSiteOptions();
  const billetterieUrl = gqlData?.billetterie?.billeterieOptions?.url || null;

  const [open, setOpen]       = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { route } = useRoute();
  const isHome        = route === "/" || route === "";
  const isTransparent = isHome && !scrolled && !open;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav-wrapper${isTransparent ? " nav-transparent" : ""}`}>
      <nav className="nav-inner">

        <a
          href="/"
          className={`nav-logo-link${isTransparent ? " nav-logo-hidden" : ""}`}
          aria-label="Accueil"
          onClick={() => setOpen(false)}
        >
          <div
            className="nav-logo-svg nav-logo-horizontal"
            style={{ WebkitMaskImage: `url(${logoHorizontal})`, maskImage: `url(${logoHorizontal})` }}
          />
          <div
            className="nav-logo-svg nav-logo-compact"
            style={{ WebkitMaskImage: `url(${logoCompact})`, maskImage: `url(${logoCompact})` }}
          />
        </a>

        <ul className="nav-links nav-links--left">
          {leftItems.map((item) => (
            <li key={item.id}>
              <a href={item.url} className="nav-link">{item.title}</a>
            </li>
          ))}
        </ul>

        <ul className="nav-links nav-links--right">
          {rightItems.map((item) => {
            const url = (item.title === "Billetterie" && billetterieUrl) ? billetterieUrl : item.url;
            const isExternal = url.startsWith("http");
            return (
              <li key={item.id}>
                <a
                  href={url}
                  className="nav-link nav-cta"
                  {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                ><span>{item.title}</span></a>
              </li>
            );
          })}
        </ul>

        <button
          className="nav-hamburger md:hidden ml-auto"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className={`ham-line ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`ham-line ${open ? "opacity-0" : ""}`} />
          <span className={`ham-line ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

      </nav>

      {open && (
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => {
            const url = (item.title === "Billetterie" && billetterieUrl) ? billetterieUrl : item.url;
            const isExternal = url.startsWith("http");
            return (
              <a
                key={item.id}
                href={url}
                className="mobile-link"
                onClick={() => { if (!isExternal) setOpen(false); }}
                {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {item.title}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
