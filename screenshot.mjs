// Usage: node screenshot.mjs <url> [label]
// Set WIDTH to change the viewport width, e.g. WIDTH=390 node screenshot.mjs http://localhost:3000 mobile
// Set FULL=0 to capture only the viewport instead of the full page.
// Saves full-page screenshots to ./temporary screenshots/screenshot-N[-label].png
import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, 'temporary screenshots');

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3];

await mkdir(OUT_DIR, { recursive: true });
const nums = (await readdir(OUT_DIR))
  .map((f) => f.match(/^screenshot-(\d+)/)?.[1])
  .filter(Boolean)
  .map(Number);
const n = (nums.length ? Math.max(...nums) : 0) + 1;
const file = path.join(OUT_DIR, `screenshot-${n}${label ? `-${label}` : ''}.png`);

const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: Number(process.env.WIDTH) || 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  // Let load animations finish before capturing.
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: file, fullPage: process.env.FULL !== '0' });
  console.log(`Saved ${file}`);
} finally {
  await browser.close();
}
