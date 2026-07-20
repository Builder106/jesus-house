import { createRequire } from 'module';
import { promises as fs } from 'fs';
import path from 'path';

// Resolve playwright from the site/ install regardless of where this script lives.
const require = createRequire(
  '/Users/yinkavaughan/My Drive (yvaughan@wesleyan.edu)/CS/Projects/Personal/Churches/jesus-house/site/node_modules/',
);
const { chromium } = require('@playwright/test');

const REC = '/Users/yinkavaughan/My Drive (yvaughan@wesleyan.edu)/CS/Projects/Personal/Churches/jesus-house/design-research/recordings';
const W = 1440, H = 900;

const SITES = [
  { slug: 'st-beatus-caves', url: 'https://www.beatushoehlen.swiss/en/' },
  { slug: '21hrs-moon', url: 'https://www.21hrs.space/' },
  { slug: 'since-you-arrived', url: 'https://sinceyouarrived.world/hub' },
  { slug: 'serve-robotics', url: 'https://www.serverobotics.com/' },
  { slug: 'emily-nixon', url: 'https://www.emilynixon.com/' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function dismissOverlays(page) {
  const labels = [/accept/i, /agree/i, /got it/i, /^ok$/i, /allow all/i, /enter/i, /continue/i, /english/i];
  for (const re of labels) {
    try {
      const btn = page.getByRole('button', { name: re }).first();
      if (await btn.isVisible({ timeout: 600 })) { await btn.click({ timeout: 1200 }); await sleep(500); }
    } catch {}
  }
}

async function scrollThrough(page, totalMs = 30000) {
  const step = Math.round(H * 0.7);
  const tick = 1700;
  const ticks = Math.floor(totalMs / tick);
  for (let i = 1; i <= ticks; i++) {
    const top = step * i;
    try {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), top);
      // Fallback for scroll-hijack libs (Lenis/Locomotive): also send wheel deltas.
      await page.mouse.wheel(0, step);
    } catch {}
    await sleep(tick);
  }
  // settle on a final frame, then glide back toward the top
  await sleep(800);
  try { await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); } catch {}
  await sleep(1500);
}

async function recordSite({ slug, url }, browser) {
  const dir = path.join(REC, slug);
  await fs.mkdir(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir, size: { width: W, height: H } },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  let status = 'ok';
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(1500);
    await dismissOverlays(page);
    await sleep(4500); // let intro/hero loaders + entrance animations play
    await scrollThrough(page, 30000);
  } catch (e) {
    status = 'error: ' + (e.message || e).toString().slice(0, 120);
  }
  await context.close(); // flush video
  // rename the single webm in dir to <slug>.webm
  let out = null;
  try {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.webm'));
    if (files.length) {
      out = path.join(REC, slug + '.webm');
      await fs.rename(path.join(dir, files[0]), out);
      await fs.rmdir(dir).catch(() => {});
    }
  } catch {}
  return { slug, status, out };
}

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const results = [];
for (const s of SITES) {
  process.stdout.write(`recording ${s.slug} ... `);
  const r = await recordSite(s, browser);
  console.log(r.status === 'ok' ? `done -> ${r.out}` : r.status);
  results.push(r);
}
await browser.close();
console.log('\nSUMMARY:');
for (const r of results) console.log(`  ${r.slug}: ${r.status}${r.out ? ' (' + r.out.split('/').pop() + ')' : ' (NO VIDEO)'}`);
