#!/usr/bin/env node

import { Command } from 'commander';
import { build } from './core/builder.js';
import { serve } from './core/server.js';
import { watch } from './core/watcher.js';
import { loadConfig } from './utils/config.js';

const program = new Command();

program
  .name('contentforge')
  .description('Générateur de sites statiques minimaliste')
  .version('0.1.0');

program
  .command('build')
  .description('Construire le site statique')
  .action(async () => {
    const config = await loadConfig();
    await build(config);
  });

program
  .command('serve')
  .description('Démarrer le serveur de développement')
  .option('-p, --port <number>', 'Port du serveur', '3000')
  .action(async (options) => {
    const config = await loadConfig();
    await serve(config, options);
  });

program
  .command('dev')
  .description('Démarrer le serveur de développement avec watch')
  .option('-p, --port <number>', 'Port du serveur', '3000')
  .action(async (options) => {
    const config = await loadConfig();
    await watch(config);
    await serve(config, options);
  });

program.parse(); 