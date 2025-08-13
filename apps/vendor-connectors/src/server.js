import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// Health
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Cube Connect stock (placeholder: echoes request)
app.get('/api/cube/stock', async (req, res) => {
  const ean = String(req.query.ean || '').trim();
  if (!ean) return res.status(400).json({ error: 'ean required' });
  // TODO: call Cube Connect with OAuth; for now, return placeholder shape
  return res.json({ ean, available: null, eta: null, vendor: 'cube' });
});

// VeloConnect stock (placeholder: echoes request)
app.get('/api/veloconnect/stock', async (req, res) => {
  const ean = String(req.query.ean || '').trim();
  const vendor = String(req.query.vendor || 'generic');
  if (!ean) return res.status(400).json({ error: 'ean required' });
  // TODO: call vendor VeloConnect endpoint; for now, return placeholder shape
  return res.json({ ean, available: null, eta: null, vendor });
});

// Shopify Admin app entry (placeholder): proves app loads
app.get('/admin', (_req, res) => {
  res.type('html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Vendor Tools</title></head><body><h1>Vendor Tools</h1><p>App is running. Enrichment GUI will be added here.</p></body></html>`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`vendor-connectors listening on :${port}`);
});


