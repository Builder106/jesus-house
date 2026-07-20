import { createRequire } from 'module';
import { promises as fs } from 'fs';
import path from 'path';

const require = createRequire(
  '/Users/yinkavaughan/My Drive (yvaughan@wesleyan.edu)/CS/Projects/Personal/Churches/jesus-house/site/node_modules/',
);
const { chromium } = require('@playwright/test');

const REC = '/Users/yinkavaughan/My Drive (yvaughan@wesleyan.edu)/CS/Projects/Personal/Churches/jesus-house/design-research/recordings';
const W = 1440, H = 900;
const slug = 'ten-years-away';
const url = 'https://ten.375.studio/en';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const dir = path.join(REC, slug);
await fs.mkdir(dir, { recursive: true });
const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir, size: { width: W, height: H } } });
const page = await context.newPage();
let status = 'ok';
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);
  for (const re of [/accept/i, /agree/i, /got it/i, /^ok$/i, /enter/i, /english/i, /continue/i]) {
    try { const b = page.getByRole('button', { name: re }).first(); if (await b.isVisible({ timeout: 600 })) { await b.click({ timeout: 1200 }); await sleep(500); } } catch {}
  }
  await sleep(4500);
  const step = Math.round(H * 0.7);
  for (let i = 1; i <= 18; i++) {
    try { await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), step * i); await page.mouse.wheel(0, step); } catch {}
    await sleep(1700);
  }
  await sleep(800);
  try { await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); } catch {}
  await sleep(1500);
} catch (e) { status = 'error: ' + (e.message || e).toString().slice(0, 140); }
await context.close();
let out = null;
try {
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.webm'));
  if (files.length) { out = path.join(REC, slug + '.webm'); await fs.rename(path.join(dir, files[0]), out); await fs.rmdir(dir).catch(() => {}); }
} catch {}
await browser.close();
console.log(`${slug}: ${status}${out ? ' -> ' + out.split('/').pop() : ' NO VIDEO'}`);
