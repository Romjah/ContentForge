import fs from 'fs/promises';
import path from 'path';
import { TemplateEngine } from './template.js';
import { MarkdownParser } from './markdown.js';
import { AssetOptimizer } from './assets.js';
import { SEOGenerator } from './seo.js';

export async function build(config) {
  // Initialiser les composants
  const templateEngine = new TemplateEngine(config);
  const markdownParser = new MarkdownParser(config);
  const assetOptimizer = new AssetOptimizer(config);
  const seoGenerator = new SEOGenerator(config);

  // Charger les templates
  await templateEngine.loadTemplates();

  // Créer le dossier de sortie s'il n'existe pas
  await fs.mkdir(config.output, { recursive: true });

  // Lire tous les fichiers Markdown
  const pages = [];
  const processDirectory = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const page = await markdownParser.parseFile(fullPath);
        const relativePath = path.relative(config.source, fullPath);
        const outputPath = path.join(
          config.output,
          relativePath.replace('.md', '.html')
        );

        // Créer le dossier de sortie si nécessaire
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        // Rendre la page avec le template
        const html = await templateEngine.render('page', {
          ...page,
          meta: seoGenerator.generateMetaTags(page)
        });

        // Écrire le fichier HTML
        await fs.writeFile(outputPath, html);

        // Ajouter la page à la liste pour le sitemap
        pages.push({
          url: '/' + relativePath.replace('.md', '.html'),
          lastmod: new Date().toISOString(),
          ...page.frontmatter
        });
      }
    }
  };

  // Traiter le contenu
  await processDirectory(config.source);

  // Optimiser les assets
  await assetOptimizer.optimizeImages();
  await assetOptimizer.optimizeCSS();
  await assetOptimizer.optimizeJS();

  // Copier les assets statiques
  const copyAssets = async (src, dest) => {
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await copyAssets(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  };

  await copyAssets(config.assets, path.join(config.output, 'assets'));

  // Générer les fichiers SEO
  await seoGenerator.generateSitemap(pages);
  await seoGenerator.generateRobotsTxt();
  await seoGenerator.generateManifest();

  console.log('Build completed successfully!');
} 