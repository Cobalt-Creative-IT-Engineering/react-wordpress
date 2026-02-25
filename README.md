# WordPress Headless × React + Tailwind

Un projet React moderne connecté à WordPress via l'API REST, avec support natif d'ACF (Advanced Custom Fields).

---

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'URL WordPress
cp .env.example .env.local
# → Éditez .env.local et remplacez l'URL par la vôtre

# 3. Lancer le serveur de développement
npm run dev
```

---

## ⚙️ Configuration WordPress requise

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
// Autoriser les requêtes depuis le front React
add_action('init', function () {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = ['http://localhost:3000', 'https://votre-front.com'];

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

## 📁 Structure du projet

```
src/
├── lib/
│   └── wordpress.ts       ← Client API (WP REST + ACF)
├── hooks/
│   └── useWordPress.ts    ← Hooks React (usePosts, usePage, useACF…)
├── components/
│   ├── ACFRenderer.tsx    ← Rendu automatique des champs ACF
│   └── UI.tsx             ← Composants UI (Card, Nav, Pagination…)
├── App.tsx                ← Router + pages
├── main.tsx
└── index.css              ← Design tokens + Tailwind
```

---

## 🔌 API disponible (`src/lib/wordpress.ts`)

### Posts
```ts
import { getPosts, getPostBySlug, getPostById } from "./lib/wordpress";

// Liste des articles
const { posts, total, totalPages } = await getPosts({ perPage: 10, page: 1 });

// Article par slug
const post = await getPostBySlug("mon-article");

// post.acf contient tous les champs ACF
console.log(post.acf.sous_titre);
console.log(post.acf.image_hero);
```

### Pages
```ts
import { getPageBySlug } from "./lib/wordpress";

const page = await getPageBySlug("about");
// page.acf contient les champs ACF de la page
```

### ACF Options (champs globaux)
```ts
import { getACFOptions } from "./lib/wordpress";

const options = await getACFOptions();
// options.site_headline, options.logo, etc.
```

### Custom Post Types
```ts
import { getCPT } from "./lib/wordpress";

const projets = await getCPT("projets", { perPage: 12 });
```

---

## 🎣 Hooks React (`src/hooks/useWordPress.ts`)

```tsx
import { usePosts, usePost, usePage, useACFOptions, useCPT } from "./hooks/useWordPress";

// Dans un composant
function Blog() {
  const { posts, status, error, page, setPage, totalPages } = usePosts({
    perPage: 9,
    categories: [12], // filtrer par catégorie
  });

  if (status === "loading") return <Spinner />;
  if (status === "error")   return <p>{error}</p>;

  return (
    <>
      {posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          {/* Champ ACF direct */}
          <p>{post.acf.mon_champ_texte as string}</p>
        </div>
      ))}
    </>
  );
}
```

---

## 🧩 ACFRenderer (`src/components/ACFRenderer.tsx`)

Affiche automatiquement n'importe quel champ ACF selon son type détecté.

```tsx
import { ACFRenderer, acfText, acfImage, acfBool, acfRepeater } from "./components/ACFRenderer";

// Rendu automatique de tous les champs
<ACFRenderer fields={post.acf} showLabels />

// Accès typisé à un champ spécifique
const titre    = acfText(post.acf, "sous_titre");     // → string
const image    = acfImage(post.acf, "image_hero");    // → { url, alt } | null
const actif    = acfBool(post.acf, "en_vedette");     // → boolean
const items    = acfRepeater(post.acf, "liste_items"); // → array
```

**Types ACF supportés automatiquement :**
- Texte, textarea, wysiwyg (HTML), URL
- Image (objet ACF avec url/alt)
- Vrai/Faux (badge coloré)
- Relation / Post Object
- Repeater (récursif)
- Groupe (récursif)
- Tableau de chaînes (checkboxes, select multiple)

---

## 🎨 Personnalisation du thème

Modifiez les variables CSS dans `src/index.css` :

```css
:root {
  --bg: #0e0e0e;           /* Fond principal */
  --accent: #c8945a;       /* Couleur d'accentuation */
  --font-display: "Playfair Display", serif;
  --font-body: "DM Sans", sans-serif;
}
```

---

## 📦 Build pour la production

```bash
npm run build
# → dist/ prêt à être déployé (Vercel, Netlify, serveur statique…)
```

---

## 🗺️ Routes disponibles

| Route | Contenu |
|---|---|
| `#/` | Page d'accueil (ACF Options pour le héro) |
| `#/blog` | Liste des articles avec pagination |
| `#/post/:slug` | Article unique + champs ACF |
| `#/page/:slug` | Page WordPress + champs ACF |

---

## 💡 Conseils ACF

1. **Activer l'API ACF** : dans ACF → outils → activer "REST API"
2. **Options globales** : créez une page d'options avec `acf_add_options_page()`
3. **Nommage des champs** : utilisez des slugs cohérents (`image_hero`, `sous_titre`…)
4. **Types complexes** : les repeaters et groupes sont récursifs dans `ACFRenderer`
