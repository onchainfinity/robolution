const { test, expect } = require("@playwright/test");

test("the Chinese page remains usable without horizontal overflow", async ({ page }) => {
  await page.goto("/?lang=zh-CN");

  await expect(page.locator("#language-select")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Robolution 000", exact: true })).toBeVisible();
  await expect(page.locator(".track-card")).toHaveCount(9);

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});
