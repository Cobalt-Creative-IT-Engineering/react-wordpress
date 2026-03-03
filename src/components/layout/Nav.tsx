import React from "react";
import { NAV_ITEMS } from "../../config/site";

const leftItems  = NAV_ITEMS.filter((i) => !i.cta);
const rightItems = NAV_ITEMS.filter((i) =>  i.cta);

export function Nav() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="nav-wrapper">
      <nav className="nav-inner">
        <ul className="nav-links">
          {leftItems.map((item) => (
            <li key={item.id}>
              <a href={item.url} className="nav-link">
                {item.title}
              </a>
            </li>
          ))}
        </ul>

        <ul className="nav-links">
          {rightItems.map((item) => (
            <li key={item.id}>
              <a href={item.url} className="nav-link nav-cta">
                {item.title}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="nav-hamburger md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className={`ham-line ${open ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`ham-line ${open ? "opacity-0" : ""}`} />
          <span className={`ham-line ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </nav>

      {open && (
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="mobile-link"
              onClick={() => setOpen(false)}
            >
              {item.title}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
