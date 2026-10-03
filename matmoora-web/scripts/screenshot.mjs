import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const outDir = process.argv[2] || '/tmp/matmoora-shots';
await mkdir(outDir, { recursive: true });

const pages = [
  { name: '01-home-en', url: 'http://localhost:3000/en' },
  { name: '02-home-ar', url: 'http://localhost:3000/ar' },
  { name: '03-investigation-en', url: 'http://localhost:3000/en/investigations/el-geneina-attack-2023' },
  { name: '04-investigation-ar', url: 'http://localhost:3000/ar/investigations/el-geneina-attack-2023' },
  { name: '05-archive-en', url: 'http://localhost:3000/en/archive' },
  { name: '06-archive-ar', url: 'http://localhost:3000/ar/archive' },
  { name: '07-archive-filtered-en', url: 'http://localhost:3000/en/archive?type=publication' },
  { name: '08-archive-piece-en', url: 'http://localhost:3000/en/archive/wandering-shell' },
  { name: '09-about-en', url: 'http://localhost:3000/en/about' },
  { name: '10-about-ar', url: 'http://localhost:3000/ar/about' },
];

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-gpu'],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });

for (const p of pages) {
  const page = await ctx.newPage();
  console.log('shot', p.name, p.url);
  await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${outDir}/${p.name}.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log('done →', outDir);
