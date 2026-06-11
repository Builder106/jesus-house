import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { dwellForDemo } from '../support/dwell';
import { installDemoEnhancements } from '../support/demo-page-setup';

const { Given, When, Then, Before, After } = createBdd();

// Parish contact contract — the only contact info allowed in this repo.
// No congregant names, member photos, or personal numbers, ever.
const PARISH_EMAIL = 'rccgjhmiddletown@gmail.com';
const PARISH_PHONE_TEL = 'tel:+18605184640';

// ─── Lifecycle ──────────────────────────────────────────────────────────────

// Install demo cursor + zoom + cream-background pin before every scenario.
// No-op outside DEMO=1, so QA scenarios pay nothing.
Before(async ({ page }) => {
  await installDemoEnhancements(page);
});

// Linger on the final frame for demo recordings so the end-state reads
// as a still rather than blinking to black.
After(async ({ page }) => {
  if (process.env.DEMO === '1') {
    const tail = Number(process.env.DEMO_TAIL_MS ?? 1500);
    try {
      await page.waitForTimeout(tail);
    } catch {
      // ignore
    }
  }
});

// ─── Navigation ────────────────────────────────────────────────────────────

Given('I am on the home page', async ({ page }) => {
  await page.goto('/');
  // networkidle alone isn't enough — hydration can still be in flight.
  // Anchor on the header wordmark, which the contract guarantees.
  await page
    .getByText('RCCG Jesus House')
    .first()
    .waitFor({ state: 'visible', timeout: 15_000 });
  await dwellForDemo(page);
});

Given('I am on the {string} page', async ({ page }, path: string) => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await dwellForDemo(page);
});

When('I click the {string} link', async ({ page }, label: string) => {
  await page.getByRole('link', { name: label, exact: false }).first().click();
  await page.waitForLoadState('networkidle');
  await dwellForDemo(page);
});

When('I click the {string} button', async ({ page }, label: string) => {
  await page.getByRole('button', { name: label, exact: false }).first().click();
  await dwellForDemo(page);
});

When('I scroll down by {int} pixels', async ({ page }, pixels: number) => {
  await page.evaluate((px) => window.scrollBy({ top: px, behavior: 'smooth' }), pixels);
  await dwellForDemo(page, 1500);
});

When('I scroll back to the top', async ({ page }) => {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await dwellForDemo(page, 1500);
});

When('I pause for narration', async ({ page }) => {
  await dwellForDemo(page, 2500);
});

// ─── Assertions ────────────────────────────────────────────────────────────

Then('I see the heading {string}', async ({ page }, text: string) => {
  // Fall back to a text search if the role-based locator misses (decorative
  // headline treatments can break strict role-name resolution). `.or()` of
  // two single-element locators can resolve to two distinct nodes, which
  // trips strict mode — collapse the union to the first match.
  const byRole = page.getByRole('heading', { name: new RegExp(text, 'i') }).first();
  const byText = page.getByText(new RegExp(text, 'i')).first();
  await expect(byRole.or(byText).first()).toBeVisible();
  await dwellForDemo(page);
});

Then('I see a heading about visiting', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /visit/i }).first()).toBeVisible();
  await dwellForDemo(page);
});

Then('I see the text {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  await dwellForDemo(page);
});

Then('the page title contains {string}', async ({ page }, text: string) => {
  await expect(page).toHaveTitle(new RegExp(text, 'i'));
});

Then('the URL is {string}', async ({ page }, path: string) => {
  const expected = new URL(path, 'http://localhost:4200').pathname;
  await expect(page).toHaveURL(new RegExp(expected.replace(/\//g, '\\/') + '(?:[?#].*)?$'));
});

Then('the footer shows the parish affiliation', async ({ page }) => {
  const footer = page.getByRole('contentinfo');
  await expect(
    footer.getByText('A parish of The Redeemed Christian Church of God'),
  ).toBeVisible();
  await dwellForDemo(page);
});

// ─── Ride request (signature feature, v1 = mailto/tel CTA) ─────────────────

Then('the {string} link opens an email to the parish', async ({ page }, label: string) => {
  const link = page.getByRole('link', { name: label, exact: false }).first();
  await expect(link).toBeVisible();
  // Don't click — a mailto: navigation would hand off to the OS mail
  // client. The href itself is the contract.
  await expect(link).toHaveAttribute('href', new RegExp(`^mailto:${PARISH_EMAIL}`));
  await dwellForDemo(page);
});

Then('the ride section offers an email link to the parish', async ({ page }) => {
  // The accessible name of the ride links isn't pinned by the contract;
  // the href is. Match by href, scoped to the parish address only.
  const mailto = page.locator(`a[href^="mailto:${PARISH_EMAIL}"]`).first();
  await mailto.scrollIntoViewIfNeeded();
  await expect(mailto).toBeVisible();
  await dwellForDemo(page);
});

Then('the ride section offers a phone link to the parish', async ({ page }) => {
  const tel = page.locator(`a[href^="${PARISH_PHONE_TEL}"]`).first();
  await tel.scrollIntoViewIfNeeded();
  await expect(tel).toBeVisible();
  await dwellForDemo(page);
});
