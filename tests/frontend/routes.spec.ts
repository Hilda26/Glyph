import { expect, test } from "@playwright/test";

test("archive landing and workbench are usable on mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TURN PUBLIC ARCHIVES INTO VERIFIED TEXT." })).toBeVisible();
  await page.goto("/t/1/transcribe");
  await expect(page.getByLabel("Source image workbench")).toBeVisible();
  await expect(page.getByRole("button", { name: /Connect Studionet wallet|Submit to consensus/ })).toBeVisible();
});

