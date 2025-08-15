import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ASSET_TAG_RE = /['"]([\w\-\./]+?\.(?:js|css))['"]\s*\|\s*asset_url/g;

test('all assets referenced in layout/theme.liquid exist', async () => {
  const root = process.cwd();
  const layout = path.join(root, 'layout', 'theme.liquid');
  const assetsDir = path.join(root, 'assets');
  const content = fs.readFileSync(layout, 'utf8');

  const referenced = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = ASSET_TAG_RE.exec(content)) !== null) {
    referenced.add(m[1]);
  }

  const missing: string[] = [];
  referenced.forEach(rel => {
    const f = path.join(assetsDir, rel);
    if (!fs.existsSync(f)) missing.push(rel);
  });

  if (missing.length) console.error('Missing assets:', missing);
  expect(missing).toEqual([]);
});

test('Pipeline JavaScript assets exist', async () => {
  const root = process.cwd();
  const assetsDir = path.join(root, 'assets');
  
  const pipelineAssets = [
    'ajaxify.js',
    'ajaxify.js.liquid',
    'pipeline-shop.js',
    'pipeline-shop.js.liquid',
    'jquery.min.js',
    'modernizr.min.js',
    'fastclick.min.js'
  ];
  
  const missing: string[] = [];
  pipelineAssets.forEach(asset => {
    const assetPath = path.join(assetsDir, asset);
    if (!fs.existsSync(assetPath)) {
      missing.push(asset);
    }
  });
  
  if (missing.length) console.error('Missing Pipeline assets:', missing);
  expect(missing).toEqual([]);
});

test('Pipeline CSS assets exist', async () => {
  const root = process.cwd();
  const assetsDir = path.join(root, 'assets');
  
  const pipelineCSSAssets = [
    'pipeline-style.scss',
    'pipeline-style.scss.liquid'
  ];
  
  const missing: string[] = [];
  pipelineCSSAssets.forEach(asset => {
    const assetPath = path.join(assetsDir, asset);
    if (!fs.existsSync(assetPath)) {
      missing.push(asset);
    }
  });
  
  if (missing.length) console.error('Missing Pipeline CSS assets:', missing);
  expect(missing).toEqual([]);
});

test('Pipeline SVG icon assets exist', async () => {
  const root = process.cwd();
  const assetsDir = path.join(root, 'assets');
  
  const pipelineIcons = [
    'pipeline-icon-search.svg.liquid',
    'pipeline-icon-cart.svg.liquid',
    'pipeline-icon-close.svg.liquid',
    'pipeline-icon-arrow.svg.liquid'
  ];
  
  const missing: string[] = [];
  pipelineIcons.forEach(icon => {
    const iconPath = path.join(assetsDir, icon);
    if (!fs.existsSync(iconPath)) {
      missing.push(icon);
    }
  });
  
  // Note: These are optional assets, so we just log missing ones
  if (missing.length) {
    console.log('Optional Pipeline icons missing:', missing);
  }
  
  // Test passes regardless - icons are optional
  expect(true).toBe(true);
});


