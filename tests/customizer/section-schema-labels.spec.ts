import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const CUSTOM_SECTION_HINTS = ['pipeline', 'brand', 'sustainability', 'locations', 'benefits', 'key-features', 'advanced-filters', 'product-tabs'];

function extractSchemaJSON(filePath: string): any | null {
  const raw = fs.readFileSync(filePath, 'utf8');
  const start = raw.indexOf('{% schema %}');
  const end = raw.indexOf('{% endschema %}');
  if (start === -1 || end === -1) return null;
  const jsonPart = raw.slice(start + '{% schema %}'.length, end);
  try {
    return JSON.parse(jsonPart);
  } catch {
    return null;
  }
}

test('custom sections have "Custom – …" in schema.name', async () => {
  const sectionsDir = path.join(process.cwd(), 'sections');
  const files = fs.readdirSync(sectionsDir).filter(f => f.endsWith('.liquid'));

  const violations: string[] = [];
  for (const f of files) {
    const isCustom = CUSTOM_SECTION_HINTS.some(p => f.includes(p));
    if (!isCustom) continue;
    const schema = extractSchemaJSON(path.join(sectionsDir, f));
    if (!schema || !schema.name) {
      violations.push(`Section "${f}" missing schema name`);
      continue;
    }
    const name = String(schema.name);
    if (!/^Custom\s*[-–]\s*/i.test(name)) {
      violations.push(`Section "${f}" schema.name "${name}" must be prefixed with "Custom – "`);
    }
  }

  if (violations.length) console.error(violations.join('\n'));
  expect(violations).toEqual([]);
});


