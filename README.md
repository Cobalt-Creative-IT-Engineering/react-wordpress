# WordPress Headless × React + Tailwind

Un projet React moderne connecté à WordPress via l'API REST, avec support natif d'ACF (Advanced Custom Fields) et un système de schémas typés TypeScript.

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'URL WordPress
cp .env.example .env.local
# → Éditez .env.local et renseignez votre URL WordPress

# 3. Lancer le serveur de développement
npm run dev
```

---

## Configuration WordPress requise

### Plugins obligatoires
| Plugin | Rôle |
|---|---|
| **ACF (Advanced Custom Fields)** | Champs personnalisés |
| **ACF to REST API** | Expose les champs ACF dans l'API REST |

### Plugins optionnels
| Plugin | Rôle |
|---|---|
| **WP REST API Menus** | Expose les menus de navigation |
| **JWT Authentication for WP REST API** | Auth sécurisée (si contenu privé) |

### CORS – autoriser votre domaine React

Ajoutez dans `functions.php` de votre thème :

```php
add_action('init', function () {
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = ['http://localhost:5173', 'https://votre-front.com'];

    if (in_array($origin, $allowed)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});
```

---

## Structure du projet

```
src/
├── types/
│   └── wordpress.ts          ← Toutes les interfaces TypeScript (WPPost, WPPage, FetchState…)
│
├── config/
│   ├── acf-schemas.ts        ← Schémas de champs ACF par type de contenu (HeroACF, ArtistACF…)
│   └── site.ts               ← Nom du site, langue, items de navigation (NAV_ITEMS)
│
├── lib/
│   └── wordpress.ts          ← Client API bas niveau (fetch + cache + helpers REST)
│
├── hooks/
│   ├── useRoute.ts           ← Hook de routing hash (#/page → { route, slug })
│   └── useWordPress.ts       ← Hooks de données (usePosts, usePage, useCPT, useACFOptions…)
│
├── components/
│   ├── ui/                   ← Composants génériques réutilisables
│   │   ├── Skeleton.tsx      ← Placeholder de chargement (Skeleton, PostCardSkeleton)
│   │   ├── ErrorBanner.tsx   ← Bannière d'erreur
│   │   ├── WPContent.tsx     ← Rendu sécurisé du HTML WordPress
│   │   ├── PostCard.tsx      ← Carte d'article générique
│   │   ├── Pagination.tsx    ← Pagination (prev/next/numéros)
│   │   └── index.ts          ← Barrel export
│   │
│   ├── layout/               ← Structure fixe de la page
│   │   ├── Nav.tsx           ← Navigation principale (lit NAV_ITEMS depuis config/site.ts)
│   │   ├── Footer.tsx        ← Pied de page
│   │   └── index.ts
│   │
│   └── acf/                  ← Système de rendu ACF
│       ├── ACFField.tsx      ← Rendu d'un champ ACF selon son type détecté
│       ├── ACFRenderer.tsx   ← Rendu de tous les champs d'un objet ACF
│       ├── helpers.ts        ← acfText, acfImage, acfBool, acfRepeater, acfReader
│       └── index.ts
│
├── pages/                    ← Une page = un fichier
│   ├── HomePage.tsx          ← Accueil (héro via ACF Options + HeroACF)
│   ├── ProgrammationPage.tsx ← Grille d'artistes filtrée par jour/lieu
│   ├── TwoColumnPage.tsx     ← Layout 2 colonnes générique (informations, histoire…)
│   ├── BilletteriePage.tsx   ← Iframe billetterie + tarifs
│   ├── WPPageView.tsx        ← Affichage d'une page WP quelconque par slug
│   └── ArtistModal.tsx       ← Modal artiste (chargé en lazy via React.lazy)
│
├── App.tsx                   ← Shell : layout + router uniquement (~35 lignes)
├── main.tsx                  ← Point d'entrée Vite
└── index.css                 ← Design tokens CSS + couches Tailwind
```

---

## Schémas ACF typés (`src/config/acf-schemas.ts`)

Le cœur du système : chaque type de contenu a un schéma qui mappe des **clés TypeScript** vers les **vrais noms de champs ACF** WordPress.

```ts
// Définir un schéma (une seule fois)
export const HeroACF = {
  title:    "hero_title",
  subtitle: "hero_subtitle",
  videoUrl: "hero_video_url",
  logo:     "hero_logo",
} as const;

// L'utiliser dans un composant — autocomplétion TypeScript complète
import { acfReader } from "../components/acf";
import { HeroACF }   from "../config/acf-schemas";

const hero     = acfReader(options, HeroACF);
const title    = hero.text("title");            // → string
const logo     = hero.image("logo");            // → { url, alt } | null
const videoUrl = hero.text("videoUrl");
const first    = hero.first("title", "subtitle"); // → premier champ non vide
```

**Avantages :** renommer un champ ACF côté WordPress = modifier une seule ligne dans `acf-schemas.ts`. Zéro string magique dans les composants.

### Méthodes de `acfReader`

| Méthode | Retour | Usage |
|---|---|---|
| `.text(key)` | `string` | Texte, textarea, wysiwyg |
| `.image(key)` | `{ url, alt } \| null` | Champ image ACF |
| `.bool(key)` | `boolean` | Vrai/Faux |
| `.repeater<T>(key)` | `T[]` | Repeater ACF |
| `.raw(key)` | `unknown` | Valeur brute |
| `.first(...keys)` | `string` | Premier champ non vide parmi plusieurs |

---

## Hooks de données (`src/hooks/useWordPress.ts`)

```tsx
import { usePosts, usePage, useACFOptions, useCPT, useTaxonomyTerms } from "../hooks/useWordPress";

// Articles WordPress
const { status, data: posts, error } = usePosts({ perPage: 9, categories: [12] });

// Page par slug
const { status, data: page } = usePage("about");

// ACF Options Page (champs globaux)
const { data: options } = useACFOptions();

// Custom Post Type
const { data: artists } = useCPT("artiste", { perPage: 100, order: "asc" });

// Termes d'une taxonomie
const { data: terms } = useTaxonomyTerms("jour");
```

Chaque hook retourne `{ status, data, error, isFetching }` — cache en mémoire intégré, pas de dépendance externe.

---

## Routing hash (`src/hooks/useRoute.ts`)

Le routing repose sur le hash URL (`#/`), compatible déploiement statique (Netlify, Vercel, etc.) sans configuration serveur.

```ts
import { useRoute } from "../hooks/useRoute";

const { route, path, slug } = useRoute();
// route = "#/page/mon-slug"
// path  = "/page/mon-slug"
// slug  = "mon-slug"
```

### Routes disponibles

| Route | Page |
|---|---|
| `#/` | Accueil |
| `#/programmation` | Grille artistes avec filtres |
| `#/informations` | Informations pratiques (2 colonnes) |
| `#/histoire` | Histoire du festival (2 colonnes) |
| `#/billetterie` | Billetterie |
| `#/page/:slug` | N'importe quelle page WP par son slug |

---

## Configuration du site (`src/config/site.ts`)

Nom, langue et items de navigation centralisés ici. La `Nav` les lit directement, pas de props à passer.

```ts
export const SITE_CONFIG = {
  name: "Mon Festival",
  lang: "fr",
} as const;

export const NAV_ITEMS = [
  { id: 1, title: "Accueil",        url: "#/" },
  { id: 2, title: "Programmation",  url: "#/programmation" },
  { id: 3, title: "Informations",   url: "#/informations" },
  { id: 4, title: "Histoire",       url: "#/histoire" },
  { id: 5, title: "Billetterie",    url: "#/billetterie" },
] as const;
```

---

## Thème et design tokens (`src/index.css`)

```css
:root {
  --bg:           #0e0e0e;   /* Fond principal */
  --accent:       #c8945a;   /* Couleur d'accentuation */
  --font-display: "Playfair Display", serif;
  --font-body:    "DM Sans", sans-serif;
}
```

---

## Build production

```bash
npm run build
# → dist/ prêt à déployer (Netlify, Vercel, serveur statique…)
```

ArtistModal est automatiquement code-splitté en chunk séparé grâce à `React.lazy`.

---

## Ajouter un nouveau type de contenu

1. **Créer le schéma** dans `src/config/acf-schemas.ts`
2. **Créer la page** dans `src/pages/`
3. **Ajouter la route** dans `src/App.tsx` (fonction `PageView`)
4. **Ajouter le lien** dans `src/config/site.ts` (tableau `NAV_ITEMS`)
