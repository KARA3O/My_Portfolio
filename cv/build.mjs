// Builds the CV PDFs from cv/cv.html with Microsoft Edge or Google Chrome in headless mode.
//   npm run cv
//   → assets/Karabo_Thindisa_CV.pdf       public copy (linked from the Résumé button)
//   → cv/out/Karabo_Thindisa_CV_full.pdf  full copy for applications, only if cv/private.local.json exists
// private.local.json fills the <!--slot:…--> blocks, e.g. {"note": "<p class=\"note\">…</p>", "references": "<p class=\"ref\">…</p>"}.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Chrome first: on this computer Edge's headless PDF printing silently writes nothing.
const browser = [
  process.env.CV_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p));
if (!browser) throw new Error('No Edge or Chrome found. Set CV_BROWSER to the browser path.');

const template = readFileSync(join(here, 'cv.html'), 'utf8');
const fill = (values) =>
  template.replace(/<!--slot:(\w+)-->([\s\S]*?)<!--\/slot-->/g, (_, name, fallback) => values[name] ?? fallback);

const outDir = join(here, 'out');
mkdirSync(outDir, { recursive: true });

function print(html, pdfPath) {
  // The page sits in cv/ while printing so ../assets/... image paths resolve.
  const page = join(here, '_print.html');
  writeFileSync(page, html);
  try {
    execFileSync(browser, [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--user-data-dir=${join(outDir, '.browser-profile')}`,
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(page).href,
    ], { stdio: 'ignore' });
  } finally {
    rmSync(page, { force: true });
  }
  if (!existsSync(pdfPath)) throw new Error(`${browser} did not write ${pdfPath}. Try another browser with CV_BROWSER.`);
  console.log(`Wrote ${pdfPath}`);
}

print(fill({}), join(root, 'assets', 'Karabo_Thindisa_CV.pdf'));

const privateFile = join(here, 'private.local.json');
if (existsSync(privateFile)) {
  print(fill(JSON.parse(readFileSync(privateFile, 'utf8'))), join(outDir, 'Karabo_Thindisa_CV_full.pdf'));
} else {
  console.log('No cv/private.local.json, so the full copy with references was skipped.');
}
