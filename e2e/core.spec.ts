import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function enterDemo(page: Page) {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /Enter preview/ })).toBeVisible();
  await page.getByRole("button", { name: /Enter preview/ }).click({ force: true });
  await expect(page).toHaveURL(/\/$/);
}

test("demo fixture covers onboarding, activity, notes, account, and export", async ({ page }) => {
  await enterDemo(page);
  await expect(page.getByRole("heading", { name: /Twelve weeks/ })).toBeVisible();
  await page.getByLabel("First Friday").fill("2026-09-04");
  await page.getByRole("button", { name: "Save setup" }).click();
  await expect(page.locator("main > .flash").first()).toBeVisible();
  await page.goto("/week/1");
  await expect(page.getByText("Content sources").first()).toBeVisible();
  await page.getByLabel(/Watch Princeton Lecture 1/).check();
  await page.getByRole("textbox", { name: "Evidence" }).fill("A measured, uncut run would convince a skeptical engineer.");
  await page.getByLabel("Confidence (1–5)").fill("4");
  await page.getByLabel("Minutes").fill("180");
  await page.getByRole("button", { name: /Save week/ }).click();
  await expect(page.locator("main > .flash").first()).toBeVisible();
  await page.goto("/week/2");
  await expect(page).toHaveURL(/\/week\/2/);
  await page.getByRole("link", { name: /Progress/ }).last().click();
  await expect(page.getByRole("heading", { name: /Score the judgment/ })).toBeVisible();
  await page.getByLabel("Closed-loop explanation").first().selectOption("2");
  await page.getByLabel("Technical vocabulary").first().selectOption("2");
  await page.getByRole("button", { name: /Save milestone|Save when online/ }).first().click();
  await page.getByRole("link", { name: /Account/ }).last().click();
  await expect(page).toHaveURL(/\/account/);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /JSON/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("robotics-learning-log.json");
  await page.getByRole("button", { name: /Sign out/ }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("dashboard has no serious axe violations and keyboard navigation reaches the menu", async ({ page }) => {
  await enterDemo(page);
  const dashboardHeader = page.locator(".page-header");
  if ((page.viewportSize()?.width ?? 0) >= 640) expect(await dashboardHeader.evaluate((node) => node.getBoundingClientRect().height)).toBeLessThanOrEqual(560);
  await page.goto("/resources");
  const compactHeader = page.locator(".page-header");
  expect(await compactHeader.evaluate((node) => node.classList.contains("page-header-has-aside"))).toBe(false);
  if ((page.viewportSize()?.width ?? 0) >= 640) expect(await compactHeader.evaluate((node) => node.getBoundingClientRect().height)).toBeLessThanOrEqual(440);
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? "")).map((item) => item.id)).toEqual([]);
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus-visible")).toHaveCount(1);
  const accountMenuButton = page.getByRole("button", { name: /Account menu for/ });
  await accountMenuButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(accountMenuButton).toBeFocused();
});

test("evaluator gateway responses can be deterministically mocked", async ({ page }) => {
  let called = false;
  await page.route("**/api/evaluate", async (route) => { called = true; await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ accuracy: 3, causalReasoning: 3, simplicity: 2, transfer: 3, feedback: "mock", misconceptions: [], nextRevisionPrompt: "mock" }) }); });
  await enterDemo(page);
  const response = await page.evaluate(async () => { const result = await fetch("/api/evaluate", { method: "POST", headers: { Authorization: "Bearer deterministic-test-token", "Content-Type": "application/json" }, body: JSON.stringify({ weekId: "week-1", questionId: "w1-q1", answer: "A".repeat(100) }) }); return { status: result.status, body: await result.json() }; });
  expect(response.status).toBe(200);
  expect(called).toBe(true);
});

test("topic stages remain readable, keyboard-friendly, and reachable at every viewport", async ({ page }) => {
  await enterDemo(page);
  await page.goto("/week/12");
  await expect(page.getByRole("heading", { name: /Markets, moats/ })).toBeVisible();
  await expect(page.getByRole("group", { name: "Learning stages" })).toBeVisible();
  await expect(page.getByRole("region", { name: /Learn stage/ })).toBeVisible();
  await page.getByRole("button", { name: "Teach back" }).click();
  await expect(page.getByRole("region", { name: /Teach back stage/ })).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);

  const width = page.viewportSize()?.width ?? 0;
  if (width < 640) {
    await expect(page.locator(".bottom-nav")).toBeVisible();
    await expect(page.locator(".week-save-bar")).toBeVisible();
    await expect(page.locator(".brand-copy")).toBeHidden();
  } else {
    await expect(page.locator(".bottom-nav")).toBeHidden();
    await expect(page.locator(".week-save-bar")).toBeHidden();
    expect(await page.locator(".topic-page-header").evaluate((node) => node.getBoundingClientRect().height)).toBeLessThanOrEqual(440);
  }

  const overflow = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
  expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth);
  const wrappedAffordances = await page.locator(".button, .nav-link, .stage-tab, .resource-action, .footer a").evaluateAll((nodes) => nodes.filter((node) => {
    const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
    return style.whiteSpace !== "nowrap" && rect.height > parseFloat(style.lineHeight || "0") * 1.65;
  }).map((node) => node.textContent?.trim()).filter(Boolean));
  expect(wrappedAffordances).toEqual([]);

  await page.goto("/week/1");
  await page.getByLabel(/Watch Princeton Lecture 1/).check();
  await expect(page.locator(".week-save-status")).toContainText("Unsaved changes");
  const saveButton = width < 640 ? page.locator(".week-save-bar button", { hasText: "Save week" }) : page.locator(".week-save-control");
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect(page.locator(".week-save-status")).toContainText(/Unsaved changes.*offline/i);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const clearance = await page.evaluate(() => ({ footerBottom: document.querySelector("footer")?.getBoundingClientRect().bottom ?? 0, navTop: document.querySelector(".bottom-nav")?.getBoundingClientRect().top ?? innerHeight }));
  if (width < 640) expect(clearance.footerBottom).toBeLessThanOrEqual(clearance.navTop);
});

test("the compact resource index stays scannable at 200% zoom", async ({ page }) => {
  await enterDemo(page);
  await page.goto("/resources");
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await expect(page.getByRole("heading", { name: /Read close/ })).toBeVisible();
  const dimensions = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  await expect(page.getByRole("link", { name: /Open source/ }).first()).toBeVisible();
});
