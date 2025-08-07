# Shopify Theme Deployment Setup ✅

## Overview
This repository has **WORKING** automated deployment to Shopify via GitHub Actions. When you push changes to the `main` branch, they automatically deploy to your Shopify store.

## ✅ DEPLOYMENT IS FIXED AND WORKING

### Required GitHub Secret

You only need ONE secret in your GitHub repository:

1. Go to your GitHub repository: https://github.com/velijoze/godspeed-shopify-theme
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**:

#### `SHOPIFY_ACCESS_TOKEN`
- **Value**: Your Shopify Admin API access token
- **Format**: `shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Current Token**: Already configured and working

## How It Works

### Automatic Deployment
Every time you push changes to the `main` branch, GitHub Actions will:
1. Install Shopify CLI
2. Deploy all theme files to your live Shopify theme
3. Show deployment status in GitHub Actions tab

### Manual Deployment
You can also trigger deployment manually:
1. Go to **Actions** tab in your GitHub repo
2. Click **Deploy to Shopify** workflow
3. Click **Run workflow**

## What Gets Deployed

All theme files in the repository:
- ✅ `assets/` - CSS, JS, images
- ✅ `layout/` - Theme layouts
- ✅ `sections/` - Theme sections
- ✅ `snippets/` - Reusable components
- ✅ `templates/` - Page templates
- ✅ `config/` - Theme settings
- ✅ `locales/` - Translations

## Deployment Workflow Details

The workflow uses:
- **Shopify CLI** with `@shopify/theme` package
- **Token Authentication** via `SHOPIFY_CLI_THEME_TOKEN` environment variable
- **Direct deployment** to live theme with `--live --allow-live --force` flags

## Deployment Status

Check deployment status:
1. Go to **Actions** tab in GitHub
2. Look for the latest **Deploy to Shopify** workflow run
3. ✅ Green checkmark = successful deployment
4. ❌ Red X = deployment failed (check logs)

## Troubleshooting

### If Deployment Fails
1. **Check GitHub Secret**: Ensure `SHOPIFY_ACCESS_TOKEN` is set correctly
2. **Check Token Permissions**: Token needs `write_themes` scope
3. **Check Action Logs**: Look for specific error messages

### Common Issues (All Fixed)
- ~~Authentication failures~~ ✅ Fixed with correct token variable
- ~~CLI installation issues~~ ✅ Fixed with proper npm install
- ~~Interactive prompts blocking~~ ✅ Fixed with --force flag

## Current Status

**✅ DEPLOYMENT IS WORKING**
- Last successful deployment confirmed
- All authentication issues resolved
- Workflow simplified and reliable

## Deployment Process

1. Make changes to theme files
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. GitHub automatically deploys to Shopify
4. Changes appear on live site within 2-3 minutes

## Technical Details

### Workflow File Location
`.github/workflows/deploy.yml`

### Key Configuration
```yaml
env:
  SHOPIFY_CLI_THEME_TOKEN: ${{ secrets.SHOPIFY_ACCESS_TOKEN }}
  SHOPIFY_FLAG_STORE: t0uds3-a2.myshopify.com
```

### Deployment Command
```bash
shopify theme push --live --allow-live --force
```

---

**Status**: ✅ Deployment pipeline is fully operational
**Store**: t0uds3-a2.myshopify.com
**Repository**: https://github.com/velijoze/godspeed-shopify-theme