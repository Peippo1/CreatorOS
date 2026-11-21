import { expect, test } from "@playwright/test";

test("local beta journey persists and learns from one experiment", async ({ page }) => {
  await page.goto("/workspace");
  await expect(page.getByRole("heading", { name: "Turn content into a learning loop." })).toBeVisible();

  await page.getByPlaceholder("I help...").fill("I help independent creators build a reliable publishing system.");
  await page.getByPlaceholder("Course, consulting, membership, product...").fill("Creator growth coaching");
  await page.getByRole("button", { name: "Save growth profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();

  const sourceTitle = "E2E transcript — synthetic beta evidence";
  await page.getByPlaceholder("Podcast episode: audience research").fill(sourceTitle);
  await page.getByPlaceholder("Paste a transcript, notes, comments, or research...").fill("Synthetic test evidence: creators need a repeatable weekly system, clearer audience language, and a way to learn from outcomes.");
  await page.getByRole("button", { name: "Add evidence" }).click();
  await expect(page.getByText(sourceTitle)).toBeVisible();

  await page.getByPlaceholder("Experiment title").fill("E2E weekly publishing experiment");
  await page.getByPlaceholder("Hook or angle").fill("Stop guessing what to publish next");
  await page.getByPlaceholder("Hypothesis").fill("A sharper audience problem will increase qualified clicks.");
  await page.getByRole("button", { name: "Add experiment" }).click();
  await expect(page.getByLabel("Title for E2E weekly publishing experiment")).toBeVisible();

  await page.getByLabel("Experiment", { exact: true }).selectOption({ label: "E2E weekly publishing experiment" });
  await page.getByRole("spinbutton", { name: "Views" }).fill("100");
  await page.getByRole("spinbutton", { name: "Clicks" }).fill("12");
  await page.getByRole("spinbutton", { name: "Signups" }).fill("3");
  await page.getByRole("button", { name: "Record outcome" }).click();
  await expect(page.getByText("Outcome recorded.")).toBeVisible();
  await expect(page.getByText("Your strongest signal is Short post on LinkedIn")).toBeVisible();

  const exportResponse = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export my data" }).click();
  const download = await exportResponse;
  expect(download.suggestedFilename()).toBe("creatoros-export.json");

  await page.reload();
  const deleteSource = page.getByRole("button", { name: `Delete ${sourceTitle}` });
  await expect(deleteSource).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await deleteSource.click();
  await expect(page.getByText("Source deleted.")).toBeVisible();
  await page.reload();
  await expect(page.getByText(sourceTitle)).toHaveCount(0);
});

test("unauthenticated workspace redirects when auth is configured", async ({ page }) => {
  test.skip(!process.env.E2E_AUTH_REQUIRED, "Local smoke uses the deterministic demo adapter.");
  await page.goto("/workspace");
  await expect(page).toHaveURL(/\/login\?next=%2Fworkspace|\/login\?next=\/workspace/);
});
