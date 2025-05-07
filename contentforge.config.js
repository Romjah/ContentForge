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
    title: 'ContentForge',
    description: 'Un générateur de sites statiques minimaliste',
    baseUrl: 'https://contentforge.dev',
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

  // Extensions Markdown personnalisées
  markdown: {
    extensions: [
      'frontmatter',
      'code-highlight',
      'tables',
      'task-lists'
    ]
  }
} 