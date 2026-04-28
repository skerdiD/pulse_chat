import { expect, test } from "@playwright/test";

test.describe("sentry verification page", () => {
  test("shows when Sentry is not configured and disables test actions", async ({
    page,
  }) => {
    await page.goto("/sentry-example-page");

    await expect(page).toHaveTitle(/Sentry Verification \| Pulse Chat/i);
    await expect(
      page.getByRole("heading", { name: /sentry verification/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/NEXT_PUBLIC_SENTRY_DSN is missing in \.env\.local/i),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: /send client test issue/i }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: /trigger server test error/i }),
    ).toBeDisabled();
  });
});
