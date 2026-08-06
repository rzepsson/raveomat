/**
 * Regenerates the screenshots used in the README.
 *
 * Needs a dev server on BASE_URL. Panel shots are skipped unless
 * DEMO_EMAIL / DEMO_PASSWORD are set:
 *
 *   npm run dev
 *   DEMO_EMAIL=... DEMO_PASSWORD=... node scripts/screenshots.mjs
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4321";
const OUT_DIR = "docs/screenshots";
const VIEWPORT = { width: 1440, height: 900 };

/** Cards fade in on scroll, so walk the page down and back before shooting. */
async function settle(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

async function shoot(page, name, { fullPage = false, scrollTo = 0, height } = {}) {
  if (height) await page.setViewportSize({ ...VIEWPORT, height });
  if (scrollTo) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage });
  if (height) await page.setViewportSize(VIEWPORT);
  console.log(`  ✓ ${name}.png`);
}

async function visit(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: "astro-dev-toolbar { display: none !important; }",
  });
  await settle(page);
}

const email = process.env.DEMO_EMAIL;
const password = process.env.DEMO_PASSWORD;

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  locale: "pl-PL",
});

console.log("public pages");
await visit(page, "/");
await shoot(page, "home");

await visit(page, "/wydarzenia");
await shoot(page, "events", { height: 1290 });

await visit(page, "/partnerzy");
await shoot(page, "partners");

// Sign-in modal, before we actually sign in.
await visit(page, "/");
await page.getByRole("button", { name: "ZALOGUJ" }).first().click();
await page.waitForSelector("#auth-email", { state: "visible" });
await page.waitForTimeout(500);
await shoot(page, "login");

const firstEvent =
  process.env.EVENT_ID ??
  (await page
    .evaluate(async (base) => {
      const res = await fetch(`${base}/wydarzenia`);
      const html = await res.text();
      return html.match(/\/wydarzenie\/([0-9a-f-]{36})/)?.[1] ?? null;
    }, BASE_URL)
    .catch(() => null));

if (firstEvent) {
  await visit(page, `/wydarzenie/${firstEvent}`);
  await shoot(page, "event");
} else {
  console.log("  ! no event found — skipping event detail");
}

if (!email || !password) {
  console.log("\nDEMO_EMAIL / DEMO_PASSWORD not set — skipping panel");
  await browser.close();
  process.exit(0);
}

console.log("\nsigning in");
await page.fill("#auth-email", email);
await page.fill("#auth-password", password);
await page.getByRole("button", { name: "Zaloguj się" }).click();
await page.waitForSelector("text=PANEL", { timeout: 20000 });
console.log("  ✓ signed in");

console.log("\npanel");
for (const [path, name] of [
  ["/panel/wydarzenia", "panel-events"],
  ["/panel/organizacja", "panel-organization"],
  ["/panel/ustawienia", "panel-settings"],
  ["/panel/skaner", "panel-scanner"],
]) {
  await visit(page, path);
  await shoot(page, name);
}

await browser.close();
console.log("\ndone");
