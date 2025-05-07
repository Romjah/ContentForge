import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export class AssetOptimizer {
  constructor(config) {
    this.config = config;
  }

  async optimizeImages() {
    const imageDir = path.join(this.config.assets, 'images');
    const files = await fs.readdir(imageDir);

    for (const file of files) {
      if (this.isImage(file)) {
        await this.processImage(path.join(imageDir, file));
      }
    }
  }

  isImage(file) {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
  }

  async processImage(filePath) {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Générer différentes tailles pour le responsive
    for (const size of this.config.assets.images.sizes) {
      if (width > size) {
        const outputPath = this.getOutputPath(filePath, size);
        await image
          .resize(size)
          .toFile(outputPath);
      }
    }

    // Générer les formats modernes
    for (const format of this.config.assets.images.formats) {
      const outputPath = this.getOutputPath(filePath, null, format);
      await image
        .toFormat(format, { quality: this.config.assets.images.quality })
        .toFile(outputPath);
    }
  }

  getOutputPath(filePath, size = null, format = null) {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);
    
    let newPath = path.join(dir, basename);
    if (size) newPath += `-${size}w`;
    if (format) newPath += `.${format}`;
    else newPath += ext;

    return newPath;
  }

  async optimizeCSS() {
    if (!this.config.assets.css.minify) return;

    const cssDir = path.join(this.config.assets, 'css');
    const files = await fs.readdir(cssDir);

    for (const file of files) {
      if (file.endsWith('.css')) {
        await this.minifyCSS(path.join(cssDir, file));
      }
    }
  }

  async minifyCSS(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    // Implémenter la minification CSS
    const minified = content
      .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1')
      .replace(/\s+/g, ' ')
      .replace(/:\s+/g, ':')
      .replace(/{\s+/g, '{')
      .replace(/}\s+/g, '}')
      .replace(/;\s+/g, ';')
      .replace(/,\s+/g, ',')
      .trim();

    const outputPath = filePath.replace('.css', '.min.css');
    await fs.writeFile(outputPath, minified);
  }

  async optimizeJS() {
    if (!this.config.assets.js.minify) return;

    const jsDir = path.join(this.config.assets, 'js');
    const files = await fs.readdir(jsDir);

    for (const file of files) {
      if (file.endsWith('.js')) {
        await this.minifyJS(path.join(jsDir, file));
      }
    }
  }

  async minifyJS(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    // Implémenter la minification JS
    const minified = content
      .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1')
      .replace(/\s+/g, ' ')
      .replace(/{\s+/g, '{')
      .replace(/}\s+/g, '}')
      .replace(/;\s+/g, ';')
      .replace(/,\s+/g, ',')
      .trim();

    const outputPath = filePath.replace('.js', '.min.js');
    await fs.writeFile(outputPath, minified);
  }
} 