#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = process.cwd();
const imgDir = path.join(root, 'images');
const active = new Set();

function scan(d) {
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', '_quarantine', 'images'].includes(ent.name)) continue;
    const p = path.join(d, ent.name);
    if (ent.isDirectory()) scan(p);
    else if (/\.(html|css)$/.test(ent.name)) {
      const t = fs.readFileSync(p, 'utf8');
      for (const m of t.matchAll(/images\/([a-zA-Z0-9._-]+)/g)) active.add(m[1]);
    }
  }
}
scan(root);

const missing = [];
const hashes = {};
for (const name of active) {
  const f = path.join(imgDir, name);
  if (!fs.existsSync(f)) {
    missing.push(name);
    continue;
  }
  hashes[name] = crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
}

const dupes = {};
for (const [name, h] of Object.entries(hashes)) {
  (dupes[h] ||= []).push(name);
}
const realDupes = Object.values(dupes).filter((a) => a.length > 1);

console.log('Active images:', active.size);
console.log('Missing:', missing.length ? missing : 'none');
console.log('Duplicate MD5 groups:', realDupes.length ? realDupes : 'none');
if (missing.length || realDupes.length) process.exit(1);
console.log('qa:images PASS');
