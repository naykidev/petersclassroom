import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, '..');
const repoRoot = join(pkgRoot, '../..');
const distDir = join(pkgRoot, 'dist');
const repoCdn = join(repoRoot, 'cdn');
const cssSource = join(pkgRoot, 'src/assets/accessflow.css');
const iconSource = join(repoRoot, 'accessibility.png');
const candidates = ['accessflow.js', 'accessflow.global.js'];

mkdirSync(repoCdn, { recursive: true });
mkdirSync(distDir, { recursive: true });

copyFileSync(cssSource, join(distDir, 'accessflow.css'));
copyFileSync(cssSource, join(repoCdn, 'accessflow.css'));
copyFileSync(cssSource, join(repoRoot, 'accessflow/accessflow.css'));

if (existsSync(iconSource)) {
  copyFileSync(iconSource, join(repoCdn, 'accessibility.png'));
  copyFileSync(iconSource, join(repoRoot, 'accessflow/accessibility.png'));
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

copyFileSync(source, join(repoRoot, 'accessflow/accessflow.js'));

console.log('Synced CDN assets to /cdn/ and /accessflow/');
