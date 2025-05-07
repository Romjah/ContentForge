import chokidar from 'chokidar';
import { build } from './builder.js';
import { notifyClients } from './server.js';

export async function watch(config) {
  const watcher = chokidar.watch([
    config.source,
    config.templates,
    config.assets
  ], {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  let isBuilding = false;
  let buildTimeout;

  const handleChange = async (path) => {
    if (isBuilding) return;

    isBuilding = true;
    clearTimeout(buildTimeout);

    buildTimeout = setTimeout(async () => {
      try {
        console.log(`Changes detected in ${path}, rebuilding...`);
        await build(config);
        console.log('Rebuild complete');
        
        // Notifier les clients du hot-reload
        if (global.wss) {
          notifyClients(global.wss);
        }
      } catch (error) {
        console.error('Error during rebuild:', error);
      } finally {
        isBuilding = false;
      }
    }, 300); // Debounce de 300ms
  };

  watcher
    .on('add', handleChange)
    .on('change', handleChange)
    .on('unlink', handleChange)
    .on('error', error => console.error('Watcher error:', error));

  console.log('Watching for changes...');
  return watcher;
} 