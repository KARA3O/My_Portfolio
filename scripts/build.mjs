// Copies the public parts of the portfolio into dist/ for Cloudflare.
// It is an allowlist on purpose: anything not listed here (package.json, README, .git, scripts/)
// never reaches the internet. Add new top-level folders to PUBLIC_DIRS if you create them.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

const PUBLIC_DIRS = ['css', 'js', 'assets'];
const PUBLIC_ROOT_FILES = ['_headers', '_redirects', 'robots.txt'];
// Placeholder files that keep empty folders in git; they are not needed online.
const SKIP_NAMES = new Set(['.gitkeep', '.DS_Store', 'Thumbs.db']);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

let count = 0;
const copy = (from, to) => {
  cpSync(from, to, {
    recursive: true,
    filter: (src) => {
      const name = src.split(/[\\/]/).pop();
      if (SKIP_NAMES.has(name)) return false;
      if (statSync(src).isFile()) count++;
      return true;
    },
  });
};

for (const name of readdirSync(root)) {
  if (extname(name) === '.html') copy(join(root, name), join(out, name));
}
for (const name of PUBLIC_ROOT_FILES) {
  if (existsSync(join(root, name))) copy(join(root, name), join(out, name));
}
for (const dir of PUBLIC_DIRS) {
  if (existsSync(join(root, dir))) copy(join(root, dir), join(out, dir));
}

console.log(`Built dist/ with ${count} files.`);
