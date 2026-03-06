export function Footer() {
  return (
    <footer className="footer footer-full">
      <div className="footer-inner">
        <nav className="footer-col">
          <a href="#/page/mentions-legales" className="footer-link">Mentions légales</a>
          <a href="#/page/conditions-generales" className="footer-link">Conditions générales</a>
          <a href="#/page/acces-presse" className="footer-link">Accès presse</a>
          <a href="#/page/benevoles" className="footer-link">Bénévoles</a>
          <a href="#/page/contact" className="footer-link">Contact</a>
        </nav>

        <div className="footer-col footer-col--right">
          <p className="footer-newsletter-label">Partagez-nous à tous !</p>
          <a href="https://francomanias.us16.list-manage.com/subscribe?u=58d91f7ee35b36b81ee7e614e&id=a03eda332b" target="_blank" rel="noreferrer" className="btn-primary footer-newsletter-btn">
            Newsletter
          </a>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Twitter / X">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-credits">
        <span>© 2026 Francomanias — Tous droits réservés</span>
        <a href="#/page/credits" className="footer-link">Crédits</a>
      </div>
    </footer>
  );
}
