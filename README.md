# ContentForge

Un générateur de sites statiques minimaliste avec pipeline CI/CD intégré.

## Fonctionnalités

- 🎨 Moteur de template personnalisé basé sur Handlebars
- 📝 Parser Markdown avec support pour extensions
- 🔄 Génération automatisée via GitHub Actions
- 🚀 Optimisation d'assets (images, JS, CSS)
- 🔍 SEO automatique et génération de sitemap
- 🌙 Support du mode sombre
- 📱 Design responsive
- 🔥 Hot-reload en développement
- 🖼️ Optimisation automatique des images (WebP, AVIF)
- 📊 Génération de sitemap et robots.txt
- 📱 PWA ready avec manifest.json

## Installation

### Option 1 : Installation automatisée (Recommandée)

1. Créez un token GitHub sur https://github.com/settings/tokens/new avec les permissions suivantes :
   - `repo` (accès complet aux repositories)
   - `workflow` (gestion des GitHub Actions)
   - `admin:org` (si vous utilisez une organisation)
   - Le token doit être de type "classic" ou "fine-grained" avec accès en écriture sur le repo cible.

2. Exécutez la commande d'installation :
```bash
npx contentforge init
```

3. Lors de la saisie du token GitHub, un prompt explicite s'affichera :

```
Entrez votre token GitHub (nécessaire pour la configuration)

À créer sur https://github.com/settings/tokens/new
Scopes requis : repo, workflow, (admin:org si organisation)
Le token doit être classic ou fine-grained avec accès en écriture sur le repo cible.

(Tape ton token puis appuie sur Entrée. Les caractères seront masqués par des étoiles.)

Token GitHub : ************
```

4. Suivez l'assistant qui vous guidera pour :
   - Connecter votre compte GitHub
   - Choisir entre un repository existant ou en créer un nouveau
   - Configurer les paramètres de base
   - Déployer automatiquement sur CloudFlare Pages

### Option 2 : Installation manuelle

Si vous préférez une installation manuelle, suivez ces étapes :

```bash
npm install contentforge
```

Puis créez la structure de dossiers et les fichiers de configuration comme décrit dans la section [Configuration manuelle](#configuration-manuelle).

## Utilisation

### Installation automatisée

Une fois l'installation terminée, vous pouvez :

1. Ajouter votre contenu dans le dossier `content/`
2. Personnaliser les templates dans `templates/`
3. Ajouter vos assets dans `assets/`

Le site sera automatiquement :
- Construit à chaque push
- Déployé sur CloudFlare Pages
- Optimisé (images, CSS, JS)
- Mis à jour avec les meta tags SEO

### Commandes disponibles

```bash
# Développement local
npm run dev        # Démarre le serveur avec hot-reload
npm run serve      # Démarre le serveur sans watch
npm run build      # Construit le site pour la production

# Gestion du projet
npm run setup      # Réinitialise la configuration
npm run deploy     # Déploie manuellement sur CloudFlare
```

### Structure du projet

```
contentforge/
├── src/                    # Code source
│   ├── core/              # Composants principaux
│   └── utils/             # Utilitaires
├── templates/             # Templates Handlebars
├── content/              # Contenu Markdown
├── assets/              # Assets statiques
│   ├── css/            # Styles
│   ├── js/             # Scripts
│   └── images/         # Images
└── dist/               # Site généré
```

## Configuration

Créez un fichier `contentforge.config.js` à la racine de votre projet :

```javascript
export default {
  // Chemins des dossiers
  source: './content',
  templates: './templates',
  output: './dist',
  assets: './assets',

  // Configuration du serveur de développement
  dev: {
    port: 3000,
    watch: true
  },

  // Configuration SEO
  seo: {
    title: 'Mon Site',
    description: 'Description de mon site',
    baseUrl: 'https://monsite.com',
    robots: true,
    sitemap: true
  },

  // Configuration des assets
  assets: {
    images: {
      quality: 80,
      formats: ['webp', 'avif'],
      sizes: [320, 640, 960, 1280]
    },
    css: {
      minify: true,
      autoprefixer: true
    },
    js: {
      minify: true
    }
  },

  // Extensions Markdown
  markdown: {
    extensions: [
      'frontmatter',
      'code-highlight',
      'tables',
      'task-lists'
    ]
  }
}
```

## Configuration manuelle

Si vous avez choisi l'installation manuelle, créez un fichier `contentforge.config.js` à la racine de votre projet :

```js
export default {
  // Chemins des dossiers
  source: './content',
  templates: './templates',
  output: './dist',
  assets: './assets',

  // Configuration du serveur de développement
  dev: {
    port: 3000,
    watch: true
  },

  // Configuration SEO
  seo: {
    title: 'Mon Site',
    description: 'Description de mon site',
    baseUrl: 'https://monsite.com',
    robots: true,
    sitemap: true
  },

  // Configuration des assets
  assets: {
    images: {
      quality: 80,
      formats: ['webp', 'avif'],
      sizes: [320, 640, 960, 1280]
    },
    css: {
      minify: true,
      autoprefixer: true
    },
    js: {
      minify: true
    }
  },

  // Extensions Markdown
  markdown: {
    extensions: [
      'frontmatter',
      'code-highlight',
      'tables',
      'task-lists'
    ]
  }
}
```