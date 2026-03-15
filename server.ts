import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Starting server. NODE_ENV: ${process.env.NODE_ENV}, isProduction: ${isProduction}`);
  
  let vite: any;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
      root: process.cwd()
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
  }

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Crown Car Rental API is active' });
  });

  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;

    // If the request is for a file with an extension (like .tsx, .js, .css, .png)
    // and it wasn't handled by previous middleware (like vite or express.static),
    // we should NOT serve index.html as it will cause MIME type errors in the browser.
    if (url.includes('.') && !url.endsWith('.html')) {
      return next();
    }

    try {
      let template;
      if (!isProduction) {
        // In development, read index.html from root and transform it
        template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        // In production, read index.html from dist
        template = fs.readFileSync(path.resolve(process.cwd(), 'dist', 'index.html'), 'utf-8');
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server started on http://localhost:3000');
  });
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
