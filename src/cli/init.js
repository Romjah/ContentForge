#!/usr/bin/env node

import { Octokit } from '@octokit/rest';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const octokit = new Octokit();

async function init() {
  console.log('🚀 Bienvenue dans ContentForge !');
  console.log('Je vais vous guider dans la configuration de votre site statique.\n');

  // Demander le token GitHub
  const { githubToken } = await inquirer.prompt([{
    type: 'password',
    name: 'githubToken',
    message: 'Entrez votre token GitHub (nécessaire pour la configuration)',
    validate: input => input.length > 0 ? true : 'Le token est requis'
  }]);

  // Configurer Octokit avec le token
  octokit.auth = githubToken;

  // Vérifier le token
  try {
    await octokit.users.getAuthenticated();
    console.log('✅ Token GitHub valide !');
  } catch (error) {
    console.error('❌ Token GitHub invalide. Veuillez vérifier vos permissions.');
    process.exit(1);
  }

  // Demander le type de repository
  const { repoType } = await inquirer.prompt([{
    type: 'list',
    name: 'repoType',
    message: 'Que souhaitez-vous faire ?',
    choices: [
      { name: 'Utiliser un repository existant', value: 'existing' },
      { name: 'Créer un nouveau repository', value: 'new' }
    ]
  }]);

  let repoName, repoOwner;

  if (repoType === 'existing') {
    // Lister les repositories de l'utilisateur
    const { data: repos } = await octokit.repos.listForAuthenticatedUser();
    
    const { selectedRepo } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedRepo',
      message: 'Sélectionnez votre repository',
      choices: repos.map(repo => ({
        name: repo.full_name,
        value: repo
      }))
    }]);

    repoName = selectedRepo.name;
    repoOwner = selectedRepo.owner.login;
  } else {
    // Créer un nouveau repository
    const { newRepoName } = await inquirer.prompt([{
      type: 'input',
      name: 'newRepoName',
      message: 'Nom du nouveau repository',
      validate: input => input.length > 0 ? true : 'Le nom est requis'
    }]);

    const { newRepoOwner } = await inquirer.prompt([{
      type: 'list',
      name: 'newRepoOwner',
      message: 'Où créer le repository ?',
      choices: async () => {
        const { data: orgs } = await octokit.orgs.listForAuthenticatedUser();
        const { data: user } = await octokit.users.getAuthenticated();
        return [
          { name: `Compte personnel (${user.login})`, value: user.login },
          ...orgs.map(org => ({ name: org.login, value: org.login }))
        ];
      }
    }]);

    try {
      const { data: repo } = await octokit.repos.createForAuthenticatedUser({
        name: newRepoName,
        private: false,
        auto_init: true
      });
      repoName = repo.name;
      repoOwner = repo.owner.login;
      console.log('✅ Repository créé avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la création du repository:', error.message);
      process.exit(1);
    }
  }

  // Configurer le projet local
  console.log('\n📦 Configuration du projet local...');

  // Créer la structure de dossiers
  const dirs = ['content', 'templates', 'assets/css', 'assets/js', 'assets/images'];
  dirs.forEach(dir => mkdirSync(dir, { recursive: true }));

  // Créer le fichier de configuration
  const config = {
    source: './content',
    templates: './templates',
    output: './dist',
    assets: './assets',
    dev: {
      port: 3000,
      watch: true
    },
    seo: {
      title: repoName,
      description: `Site généré avec ContentForge`,
      baseUrl: `https://${repoName}.pages.dev`,
      robots: true,
      sitemap: true
    }
  };

  writeFileSync('contentforge.config.js', `export default ${JSON.stringify(config, null, 2)}`);

  // Configurer GitHub Actions
  console.log('⚙️ Configuration de GitHub Actions...');
  
  const workflowDir = '.github/workflows';
  mkdirSync(workflowDir, { recursive: true });

  const workflowContent = `name: Build and Deploy
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ${repoName}
          directory: dist
          gitHubToken: \${{ secrets.GITHUB_TOKEN }}`;

  writeFileSync(join(workflowDir, 'build.yml'), workflowContent);

  // Initialiser git et pousser les changements
  console.log('📤 Configuration de git...');
  
  try {
    execSync('git init');
    execSync('git add .');
    execSync('git commit -m "Initial commit with ContentForge"');
    execSync(`git remote add origin https://github.com/${repoOwner}/${repoName}.git`);
    execSync('git push -u origin main');
    console.log('✅ Configuration git terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de la configuration git:', error.message);
  }

  // Instructions finales
  console.log('\n🎉 Configuration terminée !');
  console.log('\nProchaines étapes :');
  console.log('1. Ajoutez votre contenu dans le dossier content/');
  console.log('2. Personnalisez les templates dans templates/');
  console.log('3. Ajoutez vos assets dans assets/');
  console.log('\nPour démarrer le serveur de développement :');
  console.log('npm run dev');
}

init().catch(console.error); 