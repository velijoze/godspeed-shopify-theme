### Purpose
Single source of truth for all outstanding issues, the concrete plan to fix them, and a clean “new prompt” to restart the conversation with full context.

### Current status (post-fix summary)
- Repo hygiene fixed:
  - Ignored embedded repo `migration/` via `.gitignore`.
  - Removed secret file `LOCAL-SECRETS-VALUES.md` from history and added to `.gitignore`.
  - Avoid pager issues and push rejects by rebasing workflow.
- Theme updates in place:
  - Product template `templates/product.json`: added Pipeline Image Hotspots section.
  - Header: centered layout, functional mobile drawer, sliders wired for sticky separator and logo alignment.
  - Home: replaced stock “Featured collection” with Pipeline Featured Collections Tabs.
  - Sections now appear in Customizer via “Custom – …” presets (e.g., Latest News, Size Calculator, Pipeline Collection Grid).
  - Locale sync script added to guarantee EN keys are present in DE/FR/IT without overwriting translations.
- Initial Playwright coverage added (Compare page, Pipeline PDP, Header customizer, Featured Tabs, QR snippet).

### Outstanding issues to consolidate (what you asked to be fixed)
1) Header customizer controls
   - Some sliders/toggles did nothing previously.
   - Ensure ALL header settings map to CSS/markup, including: menu type, sticky behavior variants, mobile/desktop logo alignment, line separator, color scheme.

2) Menus and navigation
   - Header shows nothing or inert hamburger if menu not assigned; mobile drawer must always open when a menu exists.
   - Define exact menu sets (Header/Main, Footer groups) and wire in GUI.

3) Product pages
   - Ensure all products use the Pipeline PDP by default; legacy templates removed from assignment.
   - Add “Image Hotspots (Pipeline)” and keep zoom lens behavior.
   - No duplicate sticky cart (layout vs PDP section).

4) Vendor Dashboard
   - Guarantee discoverability: page with `page.pipeline-dashboard.json` plus optional `Custom – VeloConnect Vendors` section.

5) Collections
   - Default to Pipeline Collection Grid with toolbar and filters; all toggles governed by Theme settings.

6) Home
   - Replace any Dawn-like sections with Pipeline-aligned ones (Featured Tabs, Latest News, Newsletter, Hero).

7) Compare & Size Calculator
   - Ensure both sections are available and discoverable in GUI; no console errors; working selections and validation.

8) Internationalization
   - English is source of truth; DE/FR/IT must exist and fall back correctly.
   - Move any remaining literals to locales.

9) Test coverage
   - Expand Playwright to cover every feature above (visual + functional) and iterate until green.

10) Git/push stability
   - Prevent pager interference and rebase-related rejects; ensure no secret files get committed again.

### Concrete plan to finish
- Header
  - Wire remaining settings (menu type desktop variants, color scheme) to CSS classes/data-attrs.
  - Guarantee mobile drawer trigger is always present when a menu is selected.

- Menus
  - Create and assign menus in GUI:
    - Header/Main: Home, E‑Bikes, Bicycles, Parts, Accessories, Workshop & Service Center, Financing, About Us, Compare, Sale.
    - Footer groups: Customer Service (Contact, Shipping, Warranty, Returns), Company (About, Locations, Sustainability), Legal (Privacy, Terms), Blog.

- Product templates
  - Keep `pipeline-main-product` as default; ensure hotspots section exists in `templates/product.json`.
  - Validate only one sticky cart is rendered (layout-level toggle off by default; PDP section-level governs).

- Vendor Dashboard
  - Create page: Pipeline Dashboard → Template `page.pipeline-dashboard` → add `Custom – VeloConnect Vendors` → configure blocks.

- Collections
  - Ensure `templates/collection.json` uses `pipeline-collection-grid`; tune columns/filters per Theme settings.

- Home
  - Keep Featured Collections Tabs + Latest News + Newsletter + Hero Pipeline; remove any Dawn Featured sections.

- I18n
  - Run `node scripts/sync-locales.js` whenever EN changes.
  - Move literals found during test failures into `locales/en.default.json`; sync into DE/FR/IT.

- Tests (additions to existing initial set)
  - Collections grid/filters: sorting, columns, pagination.
  - Search: predictive on/off asset gating, basic result flows.
  - Cart: drawer/page, add-to-cart, badge updates.
  - Toggles: wishlist, quick view, sticky cart (layout), social proof, exit intent, live chat (gated rendering).
  - Vendor dashboard: page loads, vendors table renders, data-config JSON present.
  - A11y smoke: landmark roles present, no obvious axe violations on key pages.

### Git + CI safety rules (do these every time)
- Local config:
  - `git config --local pull.rebase true`
  - `git config --local rebase.autoStash true`
  - `git config --local fetch.prune true`
  - `git config --local core.pager ""`
- Never commit secrets or local config:
  - `LOCAL-SECRETS-VALUES.md`, tokens, API keys stay untracked.
  - Keep `migration/` ignored.
- Workflow:
  - `git fetch origin && git pull --rebase origin main`
  - Make changes; I commit locally; you run `git push origin main` when ready.

### New prompt to start a fresh session
Copy/paste the block below as your first message to the assistant.

```
Context:
- Repo: velijoze/godspeed-shopify-theme (English source of truth; DE/FR/IT secondary locales).
- Theme: Pipeline-based, no Dawn sections; use Custom – sections where available.
- Do not push. You commit locally; I will push via `git push origin main`.

Goals:
1) Ensure every header control (sticky variants, logo alignment desktop/mobile, menu type, separator, color scheme) is wired and testable.
2) Product template: keep Pipeline PDP default; include Image Hotspots; avoid duplicate sticky cart.
3) Collections: default to Pipeline Collection Grid; filters/sorting toggleable via Theme settings.
4) Home: Featured Collections Tabs + Latest News + Newsletter + Hero Pipeline only.
5) Vendor Dashboard: page + VeloConnect Vendors section discoverable and configurable.
6) Compare & Size Calculator: fully functional, no console errors.
7) I18n: move literals to `locales/en.default.json`; sync DE/FR/IT.
8) Tests: expand Playwright to cover all above, fix failures, iterate until green.

Rules:
- Make isolated, reversible edits; preserve existing architecture and naming.
- No secret files; keep `migration/` ignored.
- After each logical change, add focused Playwright tests.
- Commit locally only; I will push.

Task:
Start by scanning for remaining hardcoded strings, wire missing header controls, and add Playwright specs for header/menu behavior. Then continue with collections grid tests. Commit locally after each step; stop before pushing.
```

### Metaobjects to create in Shopify (Settings → Custom data → Metaobjects)
- Product hotspots (definition: `product_hotspot`)
  - Fields: `product` (Product reference), `image` (File), `x` (Number 0–100), `y` (Number 0–100), `title` (Single line), `text` (Multi‑line)
- Compare models (definition: `compare_model`)
  - Fields: `handle` (Single line), `title` (Single line), `price_text` (Single line), `motor` (Single line), `battery` (Single line), `range` (Single line), `weight` (Single line), `frame` (Single line), `gears` (Single line), `brakes` (Single line), `suspension` (Single line)
- VeloConnect vendors (definition: `veloconnect_vendor`)
  - Fields: `name` (Single line), `endpoint_url` (URL), `enabled` (Boolean), `notes` (Multi‑line)
- Store locations (definition: `store_location`)
  - Fields: `name` (Single line), `address` (Multi‑line), `postal_code` (Single line), `city` (Single line), `phone` (Single line), `lat` (Number), `lng` (Number), `hours` (Multi‑line)
- Service offerings (definition: `service_offering`)
  - Fields: `title` (Single line), `description` (Multi‑line), `icon` (File), `link` (URL)
- “As seen in” logos (definition: `press_logo`)
  - Fields: `logo` (File), `alt` (Single line), `link` (URL)
- Financing plans (definition: `financing_plan`)
  - Fields: `provider` (Single line), `title` (Single line), `subtitle` (Single line), `apr` (Number), `term_months` (Number), `min_amount` (Number), `cta_label` (Single line), `cta_link` (URL)
- Brand carousel (definition: `brand_item`)
  - Fields: `name` (Single line), `logo` (File), `link` (URL)
- Social proof badges (definition: `social_proof_item`)
  - Fields: `icon` (File), `title` (Single line), `text` (Multi‑line)


