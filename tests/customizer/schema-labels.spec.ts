import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const MUST_BE_CUSTOM = new Set<string>([
  'Collection Page Settings',
  'Filter Configuration',
  'Toolbar Settings',
  'Product Card Styling',
  'Performance & UX',
  'Social Proof Settings',
  'Theme Features'
]);

test('custom groups in settings_schema.json are labeled "Custom – …"', async () => {
  const schemaPath = path.join(process.cwd(), 'config', 'settings_schema.json');
  const raw = fs.readFileSync(schemaPath, 'utf8');
  const schema = JSON.parse(raw) as Array<{ name?: string }>;

  const violations: string[] = [];
  for (const group of schema) {
    const name = group.name?.trim();
    if (!name) continue;
    if (MUST_BE_CUSTOM.has(name)) {
      if (!/^Custom\s*[-–]\s*/i.test(name)) {
        violations.push(`Group "${name}" must be prefixed with "Custom – "`);
      }
    }
  }

  if (violations.length) console.error(violations.join('\n'));
  expect(violations).toEqual([]);
});


