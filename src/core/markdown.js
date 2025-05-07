import { marked } from 'marked';
import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';

export class MarkdownParser {
  constructor(config) {
    this.config = config;
    this.setupMarked();
  }

  setupMarked() {
    // Configuration de marked
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false
    });

    // Extension pour le highlight de code
    marked.use({
      renderer: {
        code(code, language) {
          return `<pre><code class="language-${language}">${code}</code></pre>`;
        }
      }
    });
  }

  async parseFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content: markdown } = matter(content);
    
    return {
      frontmatter,
      content: this.parse(markdown),
      slug: this.generateSlug(filePath)
    };
  }

  parse(content) {
    return marked(content);
  }

  generateSlug(filePath) {
    const basename = path.basename(filePath, '.md');
    return basename
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  // Méthode pour ajouter des extensions personnalisées
  addExtension(extension) {
    marked.use(extension);
  }
}

// Extensions Markdown personnalisées
export const extensions = {
  // Extension pour les tableaux
  tables: {
    renderer: {
      table(header, body) {
        return `<table class="table">\n<thead>\n${header}</thead>\n<tbody>\n${body}</tbody>\n</table>`;
      }
    }
  },

  // Extension pour les listes de tâches
  taskLists: {
    renderer: {
      checkbox(checked) {
        return `<input type="checkbox" ${checked ? 'checked' : ''} disabled>`;
      }
    }
  }
}; 