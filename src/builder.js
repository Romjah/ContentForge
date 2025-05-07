import { marked } from 'marked';
import Handlebars from 'handlebars';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger la configuration
const config = JSON.parse(readFileSync('contentforge.config.js', 'utf8').replace('export default ', ''));

// Helpers Handlebars
Handlebars.registerHelper('formatDate', (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

Handlebars.registerHelper('slugify', (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
});

// Optimisation des images
async function optimizeImage(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Générer les différentes tailles
  for (const size of config.assets.images.sizes) {
    if (metadata.width > size) {
      const outputDir = dirname(outputPath);
      const filename = basename(outputPath, '.' + metadata.format);
      
      // Générer WebP
      if (config.assets.images.formats.includes('webp')) {
        await image
          .resize(size)
          .webp({ quality: config.assets.images.quality })
          .toFile(join(outputDir, `${filename}-${size}.webp`));
      }
      
      // Générer AVIF
      if (config.assets.images.formats.includes('avif')) {
        await image
          .resize(size)
          .avif({ quality: config.assets.images.quality })
          .toFile(join(outputDir, `${filename}-${size}.avif`));
      }
    }
  }
}

// Génération du sitemap
function generateSitemap(pages) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${config.seo.baseUrl}${page.path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  writeFileSync(join(config.output, 'sitemap.xml'), sitemap);
}

// Génération du robots.txt
function generateRobots() {
  const robots = `User-agent: *
Allow: /
Sitemap: ${config.seo.baseUrl}/sitemap.xml`;

  writeFileSync(join(config.output, 'robots.txt'), robots);
}

// Fonction principale de build
export async function build() {
  console.log('🏗️ Construction du site...');

  // Créer le dossier de sortie
  if (!existsSync(config.output)) {
    mkdirSync(config.output, { recursive: true });
  }

  // Lire les templates
  const layoutTemplate = Handlebars.compile(
    readFileSync(join(config.templates, 'layout.hbs'), 'utf8')
  );

  // Lire les pages
  const pages = [];
  const contentFiles = readdirSync(config.source, { recursive: true })
    .filter(file => file.endsWith('.md'));

  for (const file of contentFiles) {
    const content = readFileSync(join(config.source, file), 'utf8');
    const { content: markdown, data: frontmatter } = marked.parse(content, {
      gfm: true,
      breaks: true
    });

    const page = {
      ...frontmatter,
      content: markdown,
      path: '/' + file.replace('.md', '.html')
    };

    pages.push(page);

    // Générer la page HTML
    const html = layoutTemplate({
      ...page,
      config: config.seo
    });

    const outputPath = join(config.output, file.replace('.md', '.html'));
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html);
  }

  // Optimiser les assets
  if (existsSync(config.assets)) {
    const imageFiles = readdirSync(join(config.assets, 'images'), { recursive: true })
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

    for (const file of imageFiles) {
      const inputPath = join(config.assets, 'images', file);
      const outputPath = join(config.output, 'assets/images', file);
      mkdirSync(dirname(outputPath), { recursive: true });
      await optimizeImage(inputPath, outputPath);
    }
  }

  // Générer les fichiers SEO
  if (config.seo.sitemap) {
    generateSitemap(pages);
  }
  if (config.seo.robots) {
    generateRobots();
  }

  console.log('✅ Site construit avec succès !');
} 