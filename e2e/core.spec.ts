import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function enterDemo(page: Page) {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /Enter preview/ })).toBeVisible();
  await page.getByRole("button", { name: /Enter preview/ }).click();
  await expect(page).toHaveURL(/\/$/);
}
test("demo fixture covers onboarding, activity, notes, week navigation, and export", async ({ page }) => {
  await enterDemo(page); await expect(page.getByRole("heading", { name: /Twelve weeks/ })).toBeVisible();
  await page.getByLabel("First Friday").fill("2026-09-04"); await page.getByRole("button", { name: "Save setup" }).click();
  await expect(page.getByText(/Demo mode|Saved to your private notebook/)).toBeVisible(); await page.getByRole("link", { name: /What a robot is/ }).click();
  await page.getByLabel(/Watch Princeton Lecture 1/).check(); await page.getByRole("textbox", { name: "Evidence" }).fill("A measured, uncut run would convince a skeptical engineer."); await page.getByLabel("Confidence (1–5)").fill("4"); await page.getByLabel("Minutes").fill("180"); await page.getByRole("button", { name: /Save week/ }).click();
  await expect(page.getByText(/Demo mode|Saved to your private notebook/)).toBeVisible(); await page.reload(); await expect(page.getByRole("heading", { name: /Understand the mechanism/ })).toBeVisible(); await page.getByRole("link", { name: /Next week/ }).click(); await expect(page).toHaveURL(/\/week\/2/);
  await page.getByRole("link", { name: /Progress/ }).last().click(); await expect(page.getByRole("heading", { name: /Score the judgment/ })).toBeVisible(); await page.getByLabel("Closed-loop explanation").first().selectOption("2"); await page.getByLabel("Technical vocabulary").first().selectOption("2"); await page.getByRole("button", { name: /Save milestone|Save when online/ }).first().click(); await expect(page.getByRole("button", { name: /Save when online|Saved/ }).first()).toBeVisible(); await page.getByRole("link", { name: /Settings/ }).last().click();
  const downloadPromise = page.waitForEvent("download"); await page.getByRole("button", { name: "JSON" }).click(); expect((await downloadPromise).suggestedFilename()).toBe("robotics-learning-log.json"); await page.getByRole("button", { name: /Sign out/ }).click(); await expect(page).toHaveURL(/\/login/);
});
test("dashboard has no serious axe violations and keyboard navigation reaches the menu", async ({ page }) => { await enterDemo(page); const results = await new AxeBuilder({ page }).analyze(); expect(results.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? "")).map((item) => item.id)).toEqual([]); await page.keyboard.press("Tab"); await expect(page.locator(":focus-visible")).toHaveCount(1); });
