// Synchronize locale keys: ensure de.json, fr.json, it.json contain all keys from en.default.json.
// Existing translations are preserved; only missing keys are filled with English fallback.

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const SOURCE_FILE = path.join(LOCALES_DIR, 'en.default.json');
const TARGETS = ['de.json', 'fr.json', 'it.json'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function mergeMissing(source, target) {
  if (Array.isArray(source)) {
    // Do not attempt to merge arrays; leave target as-is if present, else copy source
    return target === undefined ? source : target;
  }
  if (typeof source !== 'object' || source === null) {
    return target === undefined ? source : target;
  }
  const out = { ...(typeof target === 'object' && target ? target : {}) };
  for (const key of Object.keys(source)) {
    out[key] = mergeMissing(source[key], out[key]);
  }
  return out;
}

function main() {
  const src = readJson(SOURCE_FILE);
  for (const t of TARGETS) {
    const targetPath = path.join(LOCALES_DIR, t);
    if (!fs.existsSync(targetPath)) {
      writeJson(targetPath, src);
      console.log(`Created ${t} from en.default.json`);
      continue;
    }
    const tgt = readJson(targetPath);
    const merged = mergeMissing(src, tgt);
    writeJson(targetPath, merged);
    console.log(`Synced missing keys into ${t}`);
  }
}

main();


