import { test } from "@playwright/test";
import * as examplePage from "../pages/example.page";

test.beforeAll(async () => {
  console.log("Before tests");
});

test.afterAll(async () => {
  console.log("After tests");
});

test.afterEach(async ({}, testInfo) => {
  console.log(`Running after ${testInfo.title}`);
  if (testInfo.status !== testInfo.expectedStatus)
    console.log(`${testInfo.title} did not run as expected!`);
});

test("Navigate to Google", async ({ page }) => {
  await examplePage.navigateToGoogle(page);
});

test("Search for Playwright", async ({ page }) => {
  await examplePage.searchForPlaywright(page);
});
