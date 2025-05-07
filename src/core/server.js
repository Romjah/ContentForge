import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import fs from 'fs/promises';

export async function serve(config, options) {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // Middleware pour servir les fichiers statiques
  app.use(express.static(config.output));

  // Middleware pour le hot-reload
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

  // Route pour le hot-reload
  app.get('/__hot-reload', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const clientId = Date.now();
    const sendUpdate = () => {
      res.write(`data: ${JSON.stringify({ type: 'reload' })}\n\n`);
    };

    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'reload') {
          sendUpdate();
        }
      });
    });

    req.on('close', () => {
      res.end();
    });
  });

  // Route pour toutes les autres requêtes
  app.get('*', async (req, res) => {
    try {
      const filePath = path.join(config.output, req.path);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        const indexStats = await fs.stat(indexPath);
        if (indexStats.isFile()) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('Not found');
        }
      } else {
        res.sendFile(filePath);
      }
    } catch (error) {
      res.status(404).send('Not found');
    }
  });

  // Démarrer le serveur
  const port = options.port || config.dev.port || 3000;
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  return server;
}

// Fonction pour notifier les clients du hot-reload
export function notifyClients(wss, type = 'reload') {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type }));
    }
  });
} 