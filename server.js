import express from "express";

const app = express();
const port = 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Minimal Test</title></head>
      <body style="background: black; color: gold; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; margin: 0;">
        <div style="text-align: center;">
          <h1 style="font-size: 4rem;">CONNECTIVITY TEST</h1>
          <p style="font-size: 1.5rem;">If you see this, the server is working perfectly.</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log('Minimal server running on port ' + port);
});
