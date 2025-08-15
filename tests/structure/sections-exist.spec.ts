import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function getAllTemplateJsonFiles(dir: string): string[] {
  return fs.readdirSync(dir)
    .flatMap(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) return [];
      return f.endsWith('.json') ? [p] : [];
    });
}

function collectSectionTypesFromTemplate(filePath: string): string[] {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    const sections = json.sections || {};
    const types = Object.values<any>(sections).map((s: any) => s?.type).filter(Boolean);
    return types as string[];
  } catch {
    return [];
  }
}

test('all section "type" values in templates map to existing files', async () => {
  const root = process.cwd();
  const templatesDir = path.join(root, 'templates');
  const sectionsDir = path.join(root, 'sections');

  const files = getAllTemplateJsonFiles(templatesDir);
  const sectionTypes = new Set<string>();
  files.forEach(f => collectSectionTypesFromTemplate(f).forEach(t => sectionTypes.add(t)));

  const whitelist = new Set<string>(['header-group', 'footer-group', 'main-page', 'page', 'main-article']);
  const missing: string[] = [];
  for (const type of sectionTypes) {
    if (whitelist.has(type)) continue;
    const candidate = path.join(sectionsDir, `${type}.liquid`);
    if (!fs.existsSync(candidate)) missing.push(type);
  }

  if (missing.length) console.error('Missing section files for types:', missing);
  expect(missing).toEqual([]);
});


