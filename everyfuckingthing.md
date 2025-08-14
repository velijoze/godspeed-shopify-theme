# Everything We Did Today – Full Session Log and Resolution Plan (2025-08-14)

This document captures the end-to-end work performed today across Shopify theme and the Vendor Connectors Cloud Run service, including exact errors observed, root causes, edits made, and the GUI-only runbook to reach green.

## 1) Theme work (Shopify)

Edits implemented and committed locally (not pushed):

- `sections/pipeline-main-product.liquid`
  - Added `{% render 'vendor-availability' %}` immediately after the price block
  - Added optional QR block with settings:
    - `show_qr` (default true)
    - `qr_size` (80–360, default 160)
    - `qr_caption` (default "Scan to view online")

- `templates/index.json`
  - Added `latest_news` (`type: latest-news`, blog `journal`, limit 6) and placed it before `newsletter`

Impact:

- PDP renders vendor stock badge rows (safe placeholders until metafields appear)
- PDP can render a QR code block (toggled via section settings)
- Homepage shows “Latest from the Blog” cards

Push to deploy (auto via Actions):

```
git push origin main
```

## 2) Vendor Connectors (Cloud Run) – Issues, Root Causes, Fixes

### Errors observed

- Generic readiness failure (multiple revisions):
  - "Revision is not ready… failed to start and listen on PORT=8080"

- Real cause from logs (latest):
  - "Secret … CUBE_CLIENT_SECRET … contains non-UTF8 data. Instance startup will now abort."
  - Earlier: env row concatenation (multiple key=value pasted into `SHOPIFY_STORE` value)
  - Permission error at deploy:
    - "Permission denied on secret … CUBE_CLIENT_SECRET … The service account must be granted roles/secretmanager.secretAccessor"

### Root causes

1. Cloud Run env misconfiguration (one value contained many env pairs). Result: app cannot read expected envs.
2. Secret encoding: `CUBE_CLIENT_SECRET` stored with non‑UTF‑8 bytes (PowerShell default UTF‑16 BOM when uploaded via file), causing Cloud Run to abort the instance before the app binds to 8080.
3. Secret IAM: the runtime service account lacked Secret Accessor at the secret level during deploy attempts.
4. App startup fragility: module-level env assertions could crash before Express bound to the port, producing the generic readiness error.

### Code changes applied (committed locally)

- `apps/vendor-connectors/src/server.js`
  - Register `/health` before anything else
  - Defer all feature imports via dynamic `import()` handlers to prevent import-time crashes
  - Lazily mount `/admin`

- `apps/vendor-connectors/src/shopify.js`
  - Replace module-load throws with an `assertShopifyEnv()` called at request time (prevents hard crash on startup)

### GUI-only runbook to green

1) Secret encoding – fix CUBE_CLIENT_SECRET

- Secret Manager → `CUBE_CLIENT_SECRET` → Add new version → paste value in the textbox (no file upload)
- Ensure no leading/trailing spaces or newlines; save (this stores UTF‑8)

2) Secret IAM – bind correct principal

- Secret Manager → `CUBE_CLIENT_SECRET` → Permissions → Grant access
  - Principal: `802427545823-compute@developer.gserviceaccount.com`
  - Role: Secret Manager Secret Accessor

3) Cloud Run configuration – bind specific secret version

- Cloud Run → `vendor-connectors` → Edit & deploy new revision
- Security tab: Runtime SA must be `802427545823-compute@developer.gserviceaccount.com`
- Variables & secrets tab:
  - Environment variables (each on its own row):
    - `SHOPIFY_STORE = t0uds3-a2.myshopify.com`
    - `CUBE_OAUTH_TOKEN_URL = https://auth-core-cloud.cube.eu/connect/token`
    - `CUBE_API_BASE_URL = https://api.cube.eu/connectapi`
    - `CUBE_ACR_VALUES = tenant:c4c124a7-3f84-4f9d-bcd4-67316c7bba01`
    - `CUBE_CLIENT_ID = 278f9529-94ae-448c-a46c-e84125a2e15d`
    - `ADMIN_BASIC_AUTH = admin:YourStrongPassword`
  - Secrets as environment variables (click Change and select a numeric version):
    - `SHOPIFY_ADMIN_TOKEN` → Version: the desired numeric version → Env var: `SHOPIFY_ADMIN_TOKEN`
    - `CUBE_CLIENT_SECRET` → Version: the new numeric UTF‑8 version → Env var: `CUBE_CLIENT_SECRET`
- Container tab: Port = 8080; Command/Args empty
- Deploy

4) Verification

- `GET /health` → `{ ok: true, ts: … }`
- `GET /admin` → prompts for Basic Auth (`admin` / `YourStrongPassword`)
- Optional: Cloud Run → Revisions → latest → View logs (confirm no non‑UTF‑8 or permission errors)

5) Fast unblock (if secret mapping still blocks)

- Temporarily remove the secret mapping and set `CUBE_CLIENT_SECRET` as a plain environment variable; deploy
- Once the service is live, switch back to secret mapping with a verified UTF‑8 version and proper IAM

## 3) Exact errors (for future searchability)

- Secret encoding:
  - `Secret "projects/.../CUBE_CLIENT_SECRET/versions/latest" contains non-UTF8 data. Instance startup will now abort.`
- IAM during deploy:
  - `Permission denied on secret … CUBE_CLIENT_SECRET/versions/latest … must be granted roles/secretmanager.secretAccessor`
- Readiness:
  - `Revision 'vendor-connectors-xxxxx' is not ready and cannot serve traffic. The user-provided container failed to start and listen on PORT=8080 …`

## 4) Current status & next actions

- Theme changes are committed locally and ready to push
- Backend code defensive startup changes are committed locally; requires image rebuild and redeploy

Actions:

1. Secret Manager: ensure `CUBE_CLIENT_SECRET` latest version is pasted via UI; grant Accessor to the runtime SA at the secret level
2. Cloud Run: rebind secrets to specific numeric versions; deploy new revision
3. Verify `/health` and `/admin`
4. Push theme (`git push origin main`) to auto-deploy theme changes

## 5) Rollback

- Cloud Run: Revisions → switch traffic back to a previously ready revision
- Theme: Shopify Admin → Online Store → Themes → Version history → Restore

## 6) Appendices

### A. Files touched (today)

- `sections/pipeline-main-product.liquid`
- `templates/index.json`
- `apps/vendor-connectors/src/server.js`
- `apps/vendor-connectors/src/shopify.js`

### B. Quick health URLs

- Cloud Run base: `https://vendor-connectors-802427545823.europe-west6.run.app`
  - Health: `/health`
  - Admin: `/admin`




## 7) Deployment record — Cloud Run `vendor-connectors` (2025-08-14)

- Revision: `vendor-connectors-00013-g8m`
- Service URL: `https://vendor-connectors-802427545823.europe-west6.run.app`
- Runtime SA: `802427545823-compute@developer.gserviceaccount.com`
- Secret versions mapped (env):
  - `CUBE_CLIENT_SECRET` → `CUBE_CLIENT_SECRET:1`
  - `SHOPIFY_ADMIN_TOKEN` → `SHOPIFY_ADMIN_TOKEN:1`
- IAM fix applied: granted `roles/secretmanager.secretAccessor` on `CUBE_CLIENT_SECRET` to runtime SA
- CLI used:

```
gcloud secrets add-iam-policy-binding CUBE_CLIENT_SECRET \
  --project=godspeed-backend \
  --member=serviceAccount:802427545823-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

gcloud run services update vendor-connectors \
  --region=europe-west6 \
  --project=godspeed-backend \
  --update-secrets "CUBE_CLIENT_SECRET=CUBE_CLIENT_SECRET:1,SHOPIFY_ADMIN_TOKEN=SHOPIFY_ADMIN_TOKEN:1"
```

- Verification:
  - `GET /health` → 200 OK with body: `{ ok: true, ts: <epoch-ms> }`
  - `GET /admin` (no auth) → 401 Authentication required
  - `GET /admin` with Basic Auth `admin:1234` → 200 OK

- Notes:
  - Use `--update-secrets` (not `--set-secrets`) for Cloud Run service updates
  - Always pin a numeric secret version; avoid `latest`