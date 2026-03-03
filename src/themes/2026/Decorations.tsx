/**
 * Thème 2026 — formes géométriques CSS.
 * Style carré et graphique, en accord avec la palette rose/carrée du thème.
 * Aucune image requise — tout est généré en CSS pur.
 */
export function Decorations() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      {/* Rectangle en haut à gauche */}
      <div
        style={{
          position: "absolute",
          top: "4%",
          left: "-3%",
          width: 130,
          height: 130,
          background: "var(--accent-soft)",
          border: "2px solid var(--border)",
          opacity: 0.65,
        }}
      />

      {/* Grand carré vide en bas à droite */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          right: "-4%",
          width: 200,
          height: 200,
          background: "transparent",
          border: "3px solid var(--accent)",
          opacity: 0.18,
        }}
      />

      {/* Ligne verticale fine à droite */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          right: "1.5%",
          width: 2,
          height: 140,
          background: "var(--accent)",
          opacity: 0.28,
        }}
      />

      {/* Petit carré plein en haut à droite */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          right: "5%",
          width: 24,
          height: 24,
          background: "var(--accent)",
          opacity: 0.35,
        }}
      />

      {/* Ligne horizontale fine en bas à gauche */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "2%",
          width: 120,
          height: 2,
          background: "var(--accent)",
          opacity: 0.25,
        }}
      />
    </div>
  );
}
