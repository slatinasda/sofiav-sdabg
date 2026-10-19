#!/usr/bin/env node

/**
 * Removes unused moment locale files to keep the bundle small.
 */

import fs from 'node:fs';
import path from 'node:path';

const localesDir = path.resolve('node_modules/moment/locale');
const keep = new Set(['bg.js', 'en-gb.js']);

if (!fs.existsSync(localesDir)) {
  process.exit(0);
}

for (const entry of fs.readdirSync(localesDir, { withFileTypes: true })) {
  if (entry.isFile() && !keep.has(entry.name)) {
    fs.rmSync(path.join(localesDir, entry.name), { force: true });
  }
}
