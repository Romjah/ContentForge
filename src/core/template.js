import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

// Helpers personnalisés
const helpers = {
  // Formatage de date
  formatDate: (date, format) => {
    return new Date(date).toLocaleDateString('fr-FR', format);
  },

  // Slugify pour les URLs
  slugify: (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  },

  // Markdown inline
  markdown: (text) => {
    // À implémenter avec marked
    return text;
  }
};

// Enregistrement des helpers
Object.entries(helpers).forEach(([name, fn]) => {
  Handlebars.registerHelper(name, fn);
});

export class TemplateEngine {
  constructor(config) {
    this.config = config;
    this.templates = new Map();
  }

  async loadTemplates() {
    const templateDir = this.config.templates;
    const files = await fs.readdir(templateDir);

    for (const file of files) {
      if (file.endsWith('.hbs')) {
        const content = await fs.readFile(path.join(templateDir, file), 'utf-8');
        const template = Handlebars.compile(content);
        this.templates.set(file.replace('.hbs', ''), template);
      }
    }
  }

  async render(templateName, data) {
    if (!this.templates.has(templateName)) {
      throw new Error(`Template ${templateName} not found`);
    }

    const template = this.templates.get(templateName);
    return template(data);
  }

  // Méthode pour ajouter des partials
  async registerPartial(name, content) {
    Handlebars.registerPartial(name, content);
  }

  // Méthode pour ajouter des helpers personnalisés
  registerHelper(name, fn) {
    Handlebars.registerHelper(name, fn);
  }
} 