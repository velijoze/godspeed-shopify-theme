# Next Session Prompt – 2025-08-12

This file lists exactly what to set up (GUI only) and what credentials/IDs I need to complete deployment on any machine.

## A) News Aggregator (Cloud Run Job)
- Artifact Registry → create repo `news-aggregator` (Docker, region: europe-west6).
- Cloud Build → Trigger → build from `apps/news-aggregator/Dockerfile` → image `europe-west6-docker.pkg.dev/PROJECT_ID/news-aggregator/news-aggregator:latest`.
- Secret Manager: create secrets `SHOPIFY_ADMIN_TOKEN`, `OPENAI_API_KEY`.
- Cloud Run → Jobs → create job `news-aggregator`:
  - Image: the URI above
  - Command: `node`  | Args: `./src/index.js`
  - Env: `SHOPIFY_STORE=t0uds3-a2.myshopify.com`, `BLOG_HANDLE=journal`, `FEEDS=<rss list>`, `LANGS=en,de,fr,it`, `DEFAULT_LANG=en`
  - Secrets → map env `SHOPIFY_ADMIN_TOKEN`, `OPENAI_API_KEY`
- Cloud Scheduler → nightly `0 3 * * *` (Europe/Zurich) → target the job.

## B) Vendor Connectors (Cube Connect + VeloConnect)
- Cloud Run Service `vendor-connectors` (to be deployed) with endpoints:
  - `GET /api/cube/stock?ean=…` and `GET /api/veloconnect/stock?ean=…`
  - Jobs: nightly enrichment + 15–30 min stock sync to metafields (no Shopify inventory allocation).
- Secret Manager: Cube OAuth/client keys; VeloConnect dealer user/pass per vendor; base URLs.
- Theme: PDP reads vendor availability from metafields; admin toggle via `sections/veloconnect-vendors.liquid`.

## C) Vendor Tools (On‑demand Enrichment GUI)
- Shopify Partner Dashboard → Create Custom app for the store.
  - Temporary App URL: `https://example.com`
  - Temporary Redirect URL: `https://example.com/auth/callback`
  - Embedded in Admin: enabled.
  - (Optional) App Proxy: prefix `apps`, subpath `vendor-tools`, Proxy URL `https://example.com/shopify/proxy` (replace after deploy).
- Send to developer: API key (client_id) and API secret (client_secret); GCP Project ID and region.
- After deploy I will provide:
  - App URL: `https://<cloud-run-host>/admin`
  - Redirect: `https://<cloud-run-host>/auth/callback`
  - (Optional) Proxy URL: `https://<cloud-run-host>/shopify/proxy`
  - GUI allows scope selection (collections/tags/handles/EANs), field policies (Only‑if‑empty/Always‑update), Preview → Apply, audit/rollback.

## D) Carriers (CH & LI only)
- Swiss Post & DPD apps: install and connect accounts.
- Shopify Settings → Shipping and delivery: zones = Switzerland + Liechtenstein only; set packages (bike/accessory); set ship‑from location.
- App blocks: add pickup/selector on cart; add tracking on order status if provided.
- Provide sandbox creds for label tests; decide services to expose (Economy/Priority; DPD Classic) and any free‑shipping threshold.

## E) Tests
- After push, run: `npx playwright test`.
- I will add price slider filter test and PDP vendor availability tests once connectors are live.

## Defaults (approved)
- Titles/descriptions: Only‑if‑empty.
- Specs/tags/barcodes: Always‑update.
- Prices/images: Off by default (toggle per run).


