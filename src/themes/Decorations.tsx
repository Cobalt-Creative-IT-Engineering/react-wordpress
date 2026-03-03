/**
 * Sélecteur de décorations selon le thème actif.
 *
 * ACTIVE_THEME étant une constante littérale au moment du build,
 * Rollup peut éliminer les branches inactives (dead-code elimination)
 * et n'inclure que les décors du thème déployé dans le bundle final.
 */
import { ACTIVE_THEME } from "../config/site";
import { Decorations as DecoBase }  from "./base/Decorations";
import { Decorations as Deco2026 }  from "./2026/Decorations";

export function Decorations() {
  if (ACTIVE_THEME === "base")   return <DecoBase />;
  if (ACTIVE_THEME === "2026")   return <Deco2026 />;
  return null;
}
