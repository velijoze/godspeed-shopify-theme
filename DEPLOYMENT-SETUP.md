# Shopify Theme Deployment Setup

## Overview
This repository now has automated deployment to Shopify via GitHub Actions. When you push changes to the `main` branch in the `godspeed-authentic/` directory, they will automatically deploy to your Shopify store.

## Required GitHub Secrets

You need to configure these secrets in your GitHub repository:

1. Go to your GitHub repository: https://github.com/velijoze/godspeed-shopify-theme
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of these:

### Required Secrets:

#### `SHOPIFY_STORE_URL`
- Your Shopify store URL
- Example: `t0uds3-a2.myshopify.com` (without https://)
- This is the domain you see in your Shopify admin

#### `SHOPIFY_STORE_PASSWORD` 
- Your theme access password
- To get this:
  1. Go to your Shopify admin
  2. Online Store → Themes
  3. Click **Actions** → **Edit code** on your current theme
  4. Or create a Theme Access Password in Apps & sales channels

#### `SHOPIFY_THEME_ID`
- Your theme ID number
- To find this:
  1. Go to Online Store → Themes in Shopify admin
  2. Click on your current theme
  3. Look at the URL: `/themes/[THEME_ID]`
  4. Use just the number (e.g., `123456789`)

## How It Works

### Automatic Deployment
- Every time you push changes to the `main` branch in `godspeed-authentic/`, GitHub Actions will:
  1. Install Shopify CLI
  2. Deploy all your theme files to Shopify
  3. Run tests to verify the deployment worked
  4. Show you exactly what files were deployed

### Manual Deployment
- You can also trigger deployment manually:
  1. Go to **Actions** tab in your GitHub repo
  2. Click **Deploy to Shopify** workflow
  3. Click **Run workflow**

## What Gets Deployed

All files in the `godspeed-authentic/` directory:
- ✅ `assets/godspeed-clean.css` (your main CSS file)
- ✅ `layout/theme.liquid` 
- ✅ `sections/header.liquid`
- ✅ `snippets/card-product-pipeline.liquid`
- ✅ All other theme files

## Testing Your Deployment

The workflow will automatically:
1. Deploy your files
2. Run Playwright tests to check the live site
3. Verify that your CSS changes appear
4. Upload test results as artifacts

## Deployment Status

You can check deployment status:
1. Go to **Actions** tab in GitHub
2. Look for the latest **Deploy to Shopify** workflow run
3. Green checkmark = successful deployment
4. Red X = deployment failed (check logs for details)

## File Change Detection

The workflow only runs when files in `godspeed-authentic/` change:
- Changes to CSS, Liquid, or any theme files will trigger deployment
- Changes to root directory files (like README) won't trigger deployment

## Environment Protection

The workflow uses a `production` environment, which means:
- You can add approval requirements before deployment
- You can restrict who can deploy to production
- Extra security for your live Shopify store

## Troubleshooting

### CSS Not Appearing on Live Site
- Check the deployment logs in GitHub Actions
- Verify all secrets are configured correctly
- Look for any error messages in the workflow run

### Authentication Errors
- Double-check your `SHOPIFY_STORE_URL` format (no https://)
- Verify your `SHOPIFY_STORE_PASSWORD` is correct
- Ensure your `SHOPIFY_THEME_ID` is just the number

### Deployment Failed
- Check the workflow logs in GitHub Actions
- Look for specific error messages
- Verify your theme files are valid

## Current Deployment Issue Solution

This deployment workflow solves your current problem where:
- ❌ CSS changes were committed to Git but not appearing on live site
- ✅ Now CSS changes will automatically deploy to Shopify
- ✅ You'll get confirmation that assets were deployed
- ✅ Automated testing verifies the changes appear

## Next Steps

1. **Configure the three GitHub secrets** (most important step)
2. **Push a small test change** to verify deployment works
3. **Check the Actions tab** to see your first deployment
4. **Visit your live site** to confirm CSS changes appear

Once configured, your deployment process becomes:
1. Make changes to files in `godspeed-authentic/`
2. Commit and push to main branch
3. GitHub automatically deploys to Shopify
4. Check your live site - changes should appear within 2-3 minutes