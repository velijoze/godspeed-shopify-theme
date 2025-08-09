import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const LIQUID_RENDER_RE = /\{\%\s*(render|include)\s+['"]([\w\-\.]+)['"]/g;

function scanLiquidFiles(dir: string): string[] {
  return fs.readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) return scanLiquidFiles(p);
    return f.endsWith('.liquid') ? [p] : [];
  });
}

test('all rendered snippets exist', async () => {
  const root = process.cwd();
  const files = [
    ...scanLiquidFiles(path.join(root, 'layout')),
    ...scanLiquidFiles(path.join(root, 'sections')),
    ...scanLiquidFiles(path.join(root, 'snippets')),
  ];

  const referenced = new Set<string>();
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    let m: RegExpExecArray | null;
    while ((m = LIQUID_RENDER_RE.exec(content)) !== null) {
      referenced.add(m[2]);
    }
  }

  const snippetsDir = path.join(root, 'snippets');
  const missing: string[] = [];
  for (const name of referenced) {
    const file = path.join(snippetsDir, `${name}.liquid`);
    if (!fs.existsSync(file)) missing.push(name);
  }

  if (missing.length) console.error('Missing snippets:', missing);
  expect(missing).toEqual([]);
});


