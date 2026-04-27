import { expect, test } from "@playwright/test";

test.describe("marketing homepage", () => {
  test("loads the landing page with the main product message", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Pulse Chat/i);

    await expect(
      page.getByRole("heading", {
        name: /team chat that feels fast, focused, and premium/i
      })
    ).toBeVisible();

    await expect(
      page.getByText(/real-time room-based chat app for teams, creators, and small communities/i)
    ).toBeVisible();
  });

  test("shows the main marketing CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /open app preview/i })).toHaveAttribute(
      "href",
      "/chat"
    );

    await expect(page.getByRole("link", { name: /explore features/i })).toHaveAttribute(
      "href",
      "#features"
    );

    await expect(page.getByRole("link", { name: /create account/i })).toHaveAttribute(
      "href",
      "/signup"
    );
  });

  test("navigates to the features section from the hero CTA", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /explore features/i }).click();

    await expect(page).toHaveURL(/#features$/);
    await expect(
      page.getByRole("heading", {
        name: /a serious foundation for a real chat product/i
      })
    ).toBeVisible();
  });

  test("shows the core feature cards", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /realtime rooms/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /replies and reactions/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /premium saas ui/i })).toBeVisible();
  });
});
