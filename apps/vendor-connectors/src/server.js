import express from 'express';
import fetch from 'node-fetch';
import { fetchCubeAvailabilityByEan } from './connectors/cube.js';
import { fetchVeloAvailabilityByEan } from './connectors/veloconnect.js';
import { runStockSyncTask } from './tasks/stockSync.js';
import { runEnrichmentTask } from './tasks/enrich.js';
import { adminRouter } from './admin.js';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Early health endpoint so platform sees readiness quickly even if env not set
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Guard: fail fast but keep process alive to pass port binding
function requireEnv(vars) {
  const missing = vars.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error('Missing required env:', missing.join(','));
  }
}

requireEnv(['SHOPIFY_STORE', 'SHOPIFY_ADMIN_TOKEN']);

// (moved health earlier)

// Live availability endpoints
app.get('/api/cube/stock', async (req, res) => {
  try {
    const ean = String(req.query.ean || '').trim();
    if (!ean) return res.status(400).json({ error: 'ean required' });
    const { available, eta } = await fetchCubeAvailabilityByEan(ean);
    return res.json({ ean, available, eta, vendor: 'cube' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/veloconnect/stock', async (req, res) => {
  try {
    const ean = String(req.query.ean || '').trim();
    const vendor = String(req.query.vendor || 'generic');
    const baseUrl = String(req.query.base || process.env.VELOCONNECT_BASE_URL || '').trim();
    if (!ean) return res.status(400).json({ error: 'ean required' });
    const { available, eta } = await fetchVeloAvailabilityByEan(ean, { vendor, baseUrl });
    return res.json({ ean, available, eta, vendor });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Scheduled tasks
app.post('/tasks/stock-sync', async (req, res) => {
  try {
    const out = await runStockSyncTask(req.body || {});
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/tasks/enrich', async (req, res) => {
  try {
    const out = await runEnrichmentTask(req.body || {});
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin GUI
function basicAuth(req, res, next) {
  const creds = process.env.ADMIN_BASIC_AUTH || '';
  if (!creds) return res.status(503).send('Admin disabled: missing ADMIN_BASIC_AUTH');
  const expected = 'Basic ' + Buffer.from(creds, 'utf8').toString('base64');
  const given = req.headers.authorization || '';
  // timing-safe compare
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  res.set('WWW-Authenticate', 'Basic realm="Vendor Admin"');
  return res.status(401).send('Authentication required');
}

app.use('/admin', basicAuth, adminRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`vendor-connectors listening on :${port}`);
});


