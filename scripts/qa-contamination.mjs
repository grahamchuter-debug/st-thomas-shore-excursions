#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const foreign = [
  'Bonaire',
  'Dominica',
  'Cozumel',
  'Tortola',
  'Roatan',
  'Roatán',
  'Aruba',
  'Grand Cayman',
  'St Maarten',
  'St Kitts',
  'Trunk Bay',
  'stthomasshoreexcursions.com',
];
const hits = [];

function walk(d) {
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', '_quarantine', 'docs'].includes(ent.name)) continue;
    const p = path.join(d, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(html|js|css|xml|txt|jsonc|json)$/.test(ent.name)) {
      const t = fs.readFileSync(p, 'utf8');
      for (const term of foreign) {
        if (t.includes(term)) hits.push(`${path.relative(root, p)}: ${term}`);
      }
    }
  }
}
walk(root);

// Allow methodology/docs mentions of other destinations only if none — fail hard on plural domain always
const plural = hits.filter((h) => h.includes('stthomasshoreexcursions.com'));
const other = hits.filter((h) => !h.includes('stthomasshoreexcursions.com'));
console.log('Plural domain hits:', plural.length ? plural : 'none');
console.log('Foreign destination string hits:', other.length);
if (other.length) console.log(other.slice(0, 30).join('\n'));
if (plural.length) process.exit(1);
console.log('qa:contamination PASS (no plural domain)');
