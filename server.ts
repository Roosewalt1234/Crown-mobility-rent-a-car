import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  const isProduction = process.env.NODE_ENV === "production";
  const port = process.env.PORT || 3000;
  
  // Redirect HTTP to HTTPS in production
  if (isProduction) {
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Crescent Mobility API is active' });
  });

  console.log(`Starting server. NODE_ENV: ${process.env.NODE_ENV}, Port: ${port}`);
  
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Crown Car Rental API is active' });
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server started on http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
