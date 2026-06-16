import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, '..');
const distDir = join(pkgRoot, 'dist');
const repoCdn = join(pkgRoot, '../../cdn');
const candidates = ['accessflow.js', 'accessflow.global.js'];

mkdirSync(repoCdn, { recursive: true });

for (const file of readdirSync(distDir)) {
  if (file.endsWith('.css') || file.endsWith('.css.map')) {
    unlinkSync(join(distDir, file));
  }
}

const source = candidates
  .map((name) => join(pkgRoot, 'dist/cdn', name))
  .find((path) => existsSync(path));

if (!source) {
  throw new Error('CDN bundle not found after build');
}

copyFileSync(source, join(repoCdn, 'accessflow.js'));

if (existsSync(`${source}.map`)) {
  copyFileSync(`${source}.map`, join(repoCdn, 'accessflow.js.map'));
}

const legacyDir = join(pkgRoot, '../../accessflow');
copyFileSync(source, join(legacyDir, 'accessflow.js'));

console.log('Synced CDN bundle to /cdn/accessflow.js and /accessflow/accessflow.js');
