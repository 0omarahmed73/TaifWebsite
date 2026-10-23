import { expect, test } from "@playwright/test";

// The URL hash follows the section in view, without adding history entries.
test("hash follows the section in view and clears at the top", async ({ page }) => {
  await page.goto("/");
  const historyBefore = await page.evaluate(() => history.length);

  for (const id of ["features", "about", "faq"]) {
    await page.evaluate(
      (target) => document.getElementById(target)!.scrollIntoView({ behavior: "instant" }),
      id,
    );
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
  }
  await expect(page.locator('#site-nav a[aria-current="true"]')).toHaveAttribute("href", "#faq");
  // The language switch keeps the visitor on the same section.
  await page.evaluate(() => (document.querySelector("details[data-lang-dropdown]") as HTMLDetailsElement).open = true);
  await expect(page.locator('a[data-lang-switch="ar"]').first()).toHaveAttribute("href", /#faq$/);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
  expect(await page.evaluate(() => history.length)).toBe(historyBefore);
});
