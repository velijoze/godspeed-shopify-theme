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


