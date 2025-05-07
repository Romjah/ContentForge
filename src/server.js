import express from 'express';
import { watch } from 'chokidar';
import { build } from './builder.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Charger la configuration
const config = JSON.parse(readFileSync('contentforge.config.js', 'utf8').replace('export default ', ''));

// Servir les fichiers statiques
app.use(express.static(config.output));
app.use('/assets', express.static(config.assets));

// Middleware pour le hot-reload
app.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

// Route principale
app.get('*', (req, res) => {
  res.sendFile(join(config.output, 'index.html'));
});

// Fonction de rebuild
async function rebuild() {
  try {
    await build();
    console.log('🔄 Site reconstruit avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la reconstruction :', error);
  }
}

// Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  
  // Activer le hot-reload si demandé
  if (process.argv.includes('--watch') || config.dev.watch) {
    console.log('👀 Hot-reload activé');
    
    // Surveiller les changements
    const watcher = watch([
      config.source,
      config.templates,
      config.assets
    ], {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    watcher
      .on('add', path => {
        console.log(`📝 Fichier ajouté : ${path}`);
        rebuild();
      })
      .on('change', path => {
        console.log(`📝 Fichier modifié : ${path}`);
        rebuild();
      })
      .on('unlink', path => {
        console.log(`🗑️ Fichier supprimé : ${path}`);
        rebuild();
      });
  }
}); 