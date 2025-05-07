import { SitemapStream, streamToPromise } from 'sitemap';
import fs from 'fs/promises';
import path from 'path';

export class SEOGenerator {
  constructor(config) {
    this.config = config;
  }

  async generateSitemap(pages) {
    if (!this.config.seo.sitemap) return;

    const sitemap = new SitemapStream({
      hostname: this.config.seo.baseUrl
    });

    // Ajouter les pages au sitemap
    for (const page of pages) {
      sitemap.write({
        url: page.url,
        changefreq: page.changefreq || 'weekly',
        priority: page.priority || 0.5,
        lastmod: page.lastmod || new Date().toISOString()
      });
    }

    sitemap.end();

    // Générer le fichier sitemap.xml
    const sitemapXML = await streamToPromise(sitemap);
    await fs.writeFile(
      path.join(this.config.output, 'sitemap.xml'),
      sitemapXML.toString()
    );
  }

  async generateRobotsTxt() {
    if (!this.config.seo.robots) return;

    const content = `User-agent: *
Allow: /
Sitemap: ${this.config.seo.baseUrl}/sitemap.xml`;

    await fs.writeFile(
      path.join(this.config.output, 'robots.txt'),
      content
    );
  }

  generateMetaTags(page) {
    const {
      title = this.config.seo.title,
      description = this.config.seo.description,
      image,
      type = 'website'
    } = page.frontmatter;

    return `
      <title>${title}</title>
      <meta name="description" content="${description}">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="${type}">
      <meta property="og:url" content="${this.config.seo.baseUrl}${page.url}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      ${image ? `<meta property="og:image" content="${image}">` : ''}
      
      <!-- Twitter -->
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:url" content="${this.config.seo.baseUrl}${page.url}">
      <meta property="twitter:title" content="${title}">
      <meta property="twitter:description" content="${description}">
      ${image ? `<meta property="twitter:image" content="${image}">` : ''}
      
      <!-- Canonical URL -->
      <link rel="canonical" href="${this.config.seo.baseUrl}${page.url}">
    `;
  }

  async generateManifest() {
    const manifest = {
      name: this.config.seo.title,
      short_name: this.config.seo.title,
      description: this.config.seo.description,
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };

    await fs.writeFile(
      path.join(this.config.output, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
  }
} 