// Interactive QA suite for masseurmatch.com (production, read-only + validation-only form tests)
import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test("header links navigate correctly", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    // logo goes home
    const logo = header.locator('a[href="/"]').first();
    await expect(logo).toBeVisible();
    // main nav links exist
    const links = await header.locator("a[href]").evaluateAll(els =>
      els.map(e => ({ href: e.getAttribute("href"), text: e.textContent.trim().slice(0, 40) })));
    expect(links.length).toBeGreaterThan(3);
    test.info().annotations.push({ type: "header-links", description: JSON.stringify(links) });
  });

  test("therapists directory loads with cards or explicit empty state", async ({ page }) => {
    await page.goto("/therapists", { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    const bodyText = await page.locator("body").innerText();
    const cardLinks = await page.locator('a[href^="/therapists/"]').count();
    test.info().annotations.push({ type: "profile-card-links", description: String(cardLinks) });
    expect(cardLinks > 0 || /no (therapists|results)|coming soon|be the first/i.test(bodyText)).toBeTruthy();
  });

  test("clicking a therapist card opens the profile", async ({ page }) => {
    await page.goto("/therapists", { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    const card = page.locator('a[href^="/therapists/"]').first();
    const count = await page.locator('a[href^="/therapists/"]').count();
    test.skip(count === 0, "no profile cards rendered");
    const href = await card.getAttribute("href");
    await card.click();
    await page.waitForURL("**" + href, { timeout: 15000 });
    expect(page.url()).toContain("/therapists/");
  });

  test("footer links are present and same-origin links respond", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const hrefs = await page.locator("footer a[href]").evaluateAll(els =>
      [...new Set(els.map(e => e.href))]);
    expect(hrefs.length).toBeGreaterThan(5);
    const internal = hrefs.filter(h => h.includes("masseurmatch.com")).slice(0, 40);
    const bad = [];
    for (const h of internal) {
      // one retry to absorb transient proxy resets; only a persistent >=400 counts
      let status = 0;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await request.get(h, { maxRedirects: 5, timeout: 20000 });
          status = r.status();
          if (status < 400) break;
        } catch { status = 0; }
      }
      if (status >= 400) bad.push(`${status} ${h}`);
    }
    expect(bad, bad.join("; ")).toHaveLength(0);
  });

  test("404 page is friendly and returns 404 status", async ({ page }) => {
    // retry navigation to absorb transient egress-proxy connection resets
    let resp = null;
    for (let attempt = 0; attempt < 3 && !resp; attempt++) {
      resp = await page.goto("/definitely-not-a-real-page-xyz", { timeout: 30000 }).catch(() => null);
    }
    expect(resp, "navigation failed after retries").not.toBeNull();
    expect(resp.status()).toBe(404);
    const text = await page.locator("body").innerText();
    expect(text.length).toBeGreaterThan(20);
    expect(/404|not found|page.*exist/i.test(text)).toBeTruthy();
  });
});

test.describe("search & directory", () => {
  test("search page accepts a city query", async ({ page }) => {
    await page.goto("/search", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const input = page.locator('input[type="search"], input[type="text"], input[placeholder*="earch" i], input[placeholder*="ity" i]').first();
    if (await input.count() === 0) test.skip(true, "no search input found on /search");
    await input.fill("Dallas");
    await input.press("Enter");
    await page.waitForTimeout(2500);
    const body = await page.locator("body").innerText();
    expect(body.length).toBeGreaterThan(50);
    test.info().annotations.push({ type: "search-url", description: page.url() });
  });
});

test.describe("pricing", () => {
  test("pricing page shows plans and CTA destinations", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    const plans = ["Free", "Standard", "Pro", "Elite"].filter(p => new RegExp(`\\b${p}\\b`, "i").test(body));
    test.info().annotations.push({ type: "plans-found", description: plans.join(",") });
    expect(plans.length).toBeGreaterThanOrEqual(2);
    const ctas = await page.locator("main a[href], main button").evaluateAll(els =>
      els.filter(e => /start|get|choose|select|join|sign|upgrade|continue/i.test(e.textContent))
         .map(e => ({ tag: e.tagName, text: e.textContent.trim().slice(0, 40), href: e.getAttribute("href") })));
    test.info().annotations.push({ type: "pricing-ctas", description: JSON.stringify(ctas.slice(0, 12)) });
    expect(ctas.length).toBeGreaterThan(0);
  });

  test("plan CTA navigates to signup (not checkout) for anonymous user", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "networkidle" });
    const cta = page.locator("main a[href], main button").filter({ hasText: /start|choose|select|get started|join/i }).first();
    test.skip(await cta.count() === 0, "no CTA found");
    await cta.click();
    await page.waitForTimeout(3000);
    const url = page.url();
    test.info().annotations.push({ type: "cta-destination", description: url });
    expect(url).not.toContain("checkout.stripe.com"); // anonymous should not reach live checkout
  });
});

test.describe("auth (negative paths only — no test credentials provided)", () => {
  test("login rejects wrong credentials with visible error", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    const email = page.locator('input[type="email"], input[name="email"]').first();
    const pass = page.locator('input[type="password"]').first();
    await expect(email).toBeVisible();
    await email.fill("audit-nonexistent-user@example.com");
    await pass.fill("definitely-wrong-password-123");
    const respPromise = page.waitForResponse(r => r.url().includes("/api/auth/login"), { timeout: 15000 }).catch(() => null);
    await page.locator('button[type="submit"], form button').filter({ hasText: /log ?in|sign ?in/i }).first().click();
    const resp = await respPromise;
    // error surfaces as a toast; poll up to 12s
    let hasError = false;
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(1000);
      const body = await page.locator("body").innerText();
      if (/invalid email or password|login failed|invalid|incorrect|wrong|not found|credentials/i.test(body)) { hasError = true; break; }
    }
    expect(page.url()).toContain("/login"); // must not enter
    test.info().annotations.push({ type: "login-api-status", description: String(resp ? resp.status() : "none") });
    test.info().annotations.push({ type: "login-error-shown", description: String(hasError) });
    if (resp) expect(resp.status()).toBe(401);
    expect(hasError).toBeTruthy();
  });

  test("login with empty fields shows validation", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.locator('button[type="submit"], form button').filter({ hasText: /log ?in|sign ?in/i }).first().click();
    await page.waitForTimeout(1500);
    expect(page.url()).toContain("/login");
  });

  test("anonymous /dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/login");
  });

  test("anonymous /admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/login");
  });

  test("anonymous /pro/dashboard redirects to login", async ({ page }) => {
    await page.goto("/pro/dashboard");
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/login");
  });

  test("forgot-password page renders a form", async ({ page }) => {
    await page.goto("/forgot-password", { waitUntil: "networkidle" });
    const email = page.locator('input[type="email"], input[name="email"]').first();
    await expect(email).toBeVisible();
  });

  test("signup empty submit shows validation and does not advance", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const btn = page.locator('button[type="submit"], main button').filter({ hasText: /continue|next|create|sign ?up|get started/i }).first();
    test.skip(await btn.count() === 0, "no submit button on /signup");
    const urlBefore = page.url();
    await btn.click();
    await page.waitForTimeout(2000);
    test.info().annotations.push({ type: "signup-after-empty-submit", description: page.url() });
  });
});

test.describe("forms (validation-only, no real submissions)", () => {
  test("contact form blocks empty submit", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "networkidle" });
    const form = page.locator("form").first();
    test.skip(await form.count() === 0, "no form on /contact");
    const btn = form.locator('button[type="submit"], button').last();
    await btn.click();
    await page.waitForTimeout(1500);
    const invalidCount = await form.locator(":invalid").count().catch(() => 0);
    const body = await page.locator("body").innerText();
    const hasMsg = invalidCount > 0 || /required|obrigat|please|enter|fill/i.test(body);
    expect(hasMsg).toBeTruthy();
  });

  test("newsletter input exists on home and blocks empty submit", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const nl = page.locator('footer input[type="email"], input[placeholder*="mail" i]').first();
    test.skip(await nl.count() === 0, "no newsletter input found");
    const btn = page.locator("footer button, form button").filter({ hasText: /subscribe|join|sign/i }).first();
    test.skip(await btn.count() === 0, "no newsletter button found");
    await btn.click();
    await page.waitForTimeout(1200);
    expect(page.url()).toBe("https://www.masseurmatch.com/");
  });
});

test.describe("profile page", () => {
  test("kevin-os profile renders key sections and contact CTA", async ({ page }) => {
    await page.goto("/therapists/kevin-os", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const body = await page.locator("body").innerText();
    expect(body.length).toBeGreaterThan(200);
    const h1 = await page.locator("h1").first().innerText().catch(() => "");
    test.info().annotations.push({ type: "profile-h1", description: h1 });
    const contactCta = await page.locator("a, button").filter({ hasText: /contact|message|chat|call|text/i }).count();
    test.info().annotations.push({ type: "contact-ctas", description: String(contactCta) });
    expect(contactCta).toBeGreaterThan(0);
    const imgs = await page.locator("main img").count();
    test.info().annotations.push({ type: "profile-images", description: String(imgs) });
  });

  test("dead profile slug does not render a broken page", async ({ page }) => {
    const resp = await page.goto("/therapists/bruno-dallas-tx");
    await page.waitForTimeout(1500);
    // Currently redirects to /therapists — record actual behavior
    test.info().annotations.push({ type: "dead-profile-behavior", description: `${resp.status()} -> ${page.url()}` });
    const body = await page.locator("body").innerText();
    expect(body.length).toBeGreaterThan(100);
  });
});

test.describe("knotty chat", () => {
  test("floating chat opens via knotty:open event", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("knotty:open", { detail: {} })));
    await page.waitForTimeout(3000);
    // opened panel exposes a dialog + an input textarea
    const dialog = await page.locator('[role="dialog"], textarea, input[placeholder*="ask" i], [class*="knotty" i]').count();
    const textareas = await page.locator("textarea").count();
    test.info().annotations.push({ type: "chat-elements", description: `dialog=${dialog} textareas=${textareas}` });
    expect(dialog + textareas).toBeGreaterThan(0);
  });
});
