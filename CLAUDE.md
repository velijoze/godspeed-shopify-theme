# Godspeed Shopify Theme - Claude Development Context

## Project Overview
This is a modern Shopify theme for Godspeed, an e-bike store, rebuilt with clean CSS after removing Tailwind CSS completely.

## Current Status: ⚠️ DEPLOYMENT ISSUES
**Last Updated:** 2025-01-22

### 🚨 Critical Issue:
- Font sizes are too small on the live site
- Layout needs improvement for better readability
- Git push authentication was failing but now works
- CSS changes in godspeed-clean.css aren't appearing on live site despite successful commits

### ✅ Completed Work:
1. **Tailwind CSS Removal** - All Tailwind removed from theme
2. **Header Height Fix** - Fixed 305px header issue to proper 70-80px
3. **Purple Circle Elimination** - Removed visual artifacts blocking content
4. **Clean CSS Implementation** - Custom godspeed-clean.css file created
5. **Playwright Testing** - Working test suite for layout verification

## File Structure
```
/mnt/c/users/zcega/onedrive/godspeed/shopify/godspeed/godspeed-authentic/
├── assets/
│   ├── godspeed-clean.css       # Main custom CSS file - THIS IS THE KEY FILE
│   ├── application.css.DISABLED  # Disabled Tailwind CSS
│   ├── tailwind.css.DISABLED    # Disabled Tailwind CSS
│   └── theme-overrides.css.DISABLED # Disabled overrides
├── layout/
│   └── theme.liquid             # Updated to load godspeed-clean.css last
├── sections/
│   └── header.liquid            # Updated with clean classes (not Tailwind)
├── snippets/
│   └── card-product.liquid      # Uses standard product card (not Tailwind version)
├── tests/
│   ├── visual-check.spec.ts     # Playwright layout tests
│   └── screenshots/             # Visual test results
└── test-layout-windows.js       # Windows-compatible test script
```

## Key CSS File: assets/godspeed-clean.css
- **Purpose:** Main styling file that overrides all base theme CSS
- **Current version:** "HUGE FONTS VERSION 3.0" with red background test
- **Load order:** Loaded LAST in theme.liquid to ensure overrides work
- **Font sizes:** Currently set to 32px body, 5rem logo, but NOT appearing on live site

## Layout Issues That Need Fixing:
1. **Font Sizes Too Small** - All text needs to be larger and more readable
2. **Layout Proportions** - Spacing and container sizes need improvement
3. **Professional Appearance** - Must look good for management presentation

## Deployment Setup:
- **Git repo:** https://github.com/velijoze/godspeed-shopify-theme.git
- **Deploy from:** godspeed-authentic directory (NOT the parent godspeed directory)
- **Live site:** https://t0uds3-a2.myshopify.com/
- **Git auth:** Working (was failing, now fixed)

## Critical Problem:
CSS changes are being committed and pushed successfully to GitHub, but they're not appearing on the live Shopify site. This suggests either:
1. Shopify store isn't connected to this GitHub repo for auto-deployment
2. There's a deployment pipeline issue
3. CSS is being cached aggressively
4. Wrong CSS file is being loaded

## CSS Loading in theme.liquid:
```liquid
{{ 'base.css' | asset_url | stylesheet_tag }}
<!-- Other component CSS files -->
{{ 'godspeed-clean.css' | asset_url | stylesheet_tag }}
```

## Recent Commits:
- d782807: MASSIVE FONT CHANGES - RED BACKGROUND TEST
- f24777f: AGGRESSIVE HEADER FIX: Override all base theme CSS  
- ff3f056: Fix header height issue and improve Playwright testing

## Test Commands:
```bash
# Test layout (requires Playwright dependencies)
node test-layout-windows.js

# Run Playwright tests (requires webserver)
npm test

# Check git status
git status
git push
```

## Next Steps:
1. **Solve deployment issue** - Figure out why CSS changes don't reach live site
2. **Fix font sizes** - Make all text larger and more readable
3. **Improve layout** - Better spacing and professional appearance
4. **Verify changes appear** - Ensure modifications actually deploy

## Important Notes:
- ALWAYS work in godspeed-authentic directory, not parent godspeed directory
- CSS file has massive changes that should be obvious (red background, 32px fonts)
- If changes don't appear on live site, it's a deployment issue, not CSS issue
- User deploys by git commit + git push from godspeed-authentic directory