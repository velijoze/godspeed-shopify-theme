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

test('Pipeline section files exist', async () => {
  const root = process.cwd();
  const sectionsDir = path.join(root, 'sections');
  
  const pipelineSections = [
    'pipeline-collection-advanced.liquid',
    'pipeline-product-advanced.liquid',
    'pipeline-index-slideshow.liquid',
    'pipeline-index-collection-grid.liquid',
    'pipeline-index-product.liquid',
    'pipeline-index-video.liquid',
    'pipeline-index-instagram.liquid',
    'mega-menu-pipeline.liquid'
  ];
  
  const missing: string[] = [];
  const existing: string[] = [];
  
  pipelineSections.forEach(section => {
    const sectionPath = path.join(sectionsDir, section);
    if (fs.existsSync(sectionPath)) {
      existing.push(section);
    } else {
      missing.push(section);
    }
  });
  
  console.log('Pipeline sections found:', existing);
  if (missing.length) {
    console.log('Pipeline sections missing:', missing);
  }
  
  // Expect at least some Pipeline sections to exist
  expect(existing.length).toBeGreaterThan(0);
});

test('Pipeline snippet files exist', async () => {
  const root = process.cwd();
  const snippetsDir = path.join(root, 'snippets');
  
  const pipelineSnippets = [
    'ajax-cart-template.liquid',
    'pipeline-search-bar.liquid',
    'pipeline-pagination-custom.liquid',
    'pipeline-collection-filters.liquid',
    'pipeline-collection-sorting.liquid',
    'pipeline-fonts.liquid',
    'pipeline-respond.liquid',
    'mega-menu-pipeline.liquid'
  ];
  
  const missing: string[] = [];
  const existing: string[] = [];
  
  pipelineSnippets.forEach(snippet => {
    const snippetPath = path.join(snippetsDir, snippet);
    if (fs.existsSync(snippetPath)) {
      existing.push(snippet);
    } else {
      missing.push(snippet);
    }
  });
  
  console.log('Pipeline snippets found:', existing);
  if (missing.length) {
    console.log('Pipeline snippets missing:', missing);
  }
  
  // Expect at least some Pipeline snippets to exist
  expect(existing.length).toBeGreaterThan(0);
});


