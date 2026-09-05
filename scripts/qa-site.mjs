#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

const root = process.cwd();
const DOMAIN_BAD = 'stthomasshoreexcursions.com';
const FORBIDDEN = [
  'Sunshine Guaranteed',
  'Check Availability',
  'Book a Tour',
  'Book Now',
  'href="#availability"',
  'AggregateRating',
  'shoreexcursionsgroup',
  'viator.com',
  DOMAIN_BAD,
];

const mustPreserve = [
  '/',
  '/best-beaches-in-st-thomas-for-cruise-passengers',
  '/one-day-in-st-thomas-from-cruise-ship',
  '/st-thomas-cruise-port-guide',
  '/best-st-thomas-shore-excursions',
  '/st-thomas-beach-excursions',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/methodology',
];

function walkHtml() {
  const files = [];
  function w(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (['node_modules', '.git', 'images', 'content', 'partials'].includes(ent.name)) continue;
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) w(p);
      else if (ent.name.endsWith('.html')) files.push(p);
    }
  }
  w(root);
  return files;
}

const issues = [];
for (const f of walkHtml()) {
  const t = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f);
  for (const bad of FORBIDDEN) {
    if (t.includes(bad)) issues.push(`${rel}: contains ${bad}`);
  }
  if (!t.includes('<h1') && !t.includes('font-display text-3xl') && rel !== 'template.html') {
    // built pages should have inlined content with headings
    if (!t.includes('data-inlined="true"')) issues.push(`${rel}: missing inlined content marker`);
  }
  if (t.includes('data-inlined="true"') && !/<main[^>]*>[\s\S]{100,}<\/main>/.test(t)) {
    issues.push(`${rel}: main content too short for no-JS`);
  }
  // dead commercial hash only
  if (/href="#availability"/.test(t)) issues.push(`${rel}: dead availability hash`);
}

// content scan for dead commercial CTAs
function scanContent(d) {
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, ent.name);
    if (ent.isDirectory()) scanContent(p);
    else if (ent.name.endsWith('.html')) {
      const t = fs.readFileSync(p, 'utf8');
      for (const bad of FORBIDDEN) {
        if (t.includes(bad)) issues.push(`content-scan ${path.relative(root, p)}: ${bad}`);
      }
    }
  }
}
scanContent(path.join(root, 'content'));
scanContent(path.join(root, 'partials'));

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (sitemap.includes('.html')) issues.push('sitemap still has .html URLs');
if (sitemap.includes(DOMAIN_BAD)) issues.push('sitemap plural domain');
if (!sitemap.includes('/about')) issues.push('sitemap missing /about');

console.log('Static scan issues:', issues.length);
if (issues.length) {
  console.log(issues.slice(0, 50).join('\n'));
  process.exit(1);
}

// Local server smoke for must-preserve file existence
for (const route of mustPreserve) {
  const file = route === '/' ? 'index.html' : route.slice(1) + '.html';
  if (!fs.existsSync(path.join(root, file))) {
    console.error('Missing page shell', file);
    process.exit(1);
  }
}

console.log('qa:site PASS');
console.log('Preserved routes present:', mustPreserve.length);
