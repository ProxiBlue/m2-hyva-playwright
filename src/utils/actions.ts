import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

export const pressEnter = async (page: Page) => {
  await test.step("Press enter", async () => {
    await page.keyboard.press("Enter");
  });
};

export const type = async (page: Page, locator: string, text: string) => {
  await test.step("Enter text: " + text, async () => {
    await page.type(locator, text);
  });
};

export const getInnerText = async (page: Page, locator: string) => {
  await test.step("Get innertext from " + locator, async () => {
    return await page.innerText(locator);
  });
};

export const navigateTo = async (page: Page, url: string) => {
  await test.step("Go to " + url, async () => {
    await page.goto(url);
  });
};

export const verifyPageTitle = async (page: Page, title: string) => {
  await test.step("Verify page title is '" + title + "'", async () => {
    return await expect(page).toHaveTitle(title);
  });
};

export const verifyElementExists = async (page: Page, locator: string) => {
  await test.step("Verify element exists " + locator, async () => {
    await expect(page.locator(locator)).toHaveCount(1);
  });
};

export const verifyElementDoesNotExists = async (
  page: Page,
  locator: string
) => {
  await test.step("Verify element does not exist " + locator, async () => {
    await expect(page.locator(locator)).toHaveCount(0);
  });
};

export const verifyElementIsVisible = async (page: Page, locator: string) => {
  await test.step("Verify element is visible " + locator, async () => {
    return expect(await page.locator(locator).isVisible()).toBe(true);
  });
};

export const verifyElementIsEnabled = async (page: Page, locator: string) => {
  await test.step("Verify element is enabled " + locator, async () => {
    return expect(await page.locator(locator).isEnabled()).toBe(true);
  });
};

export const clickElement = async (page: Page, locator: string) => {
  await test.step("Click element " + locator, async () => {
    await page.locator(locator).click();
  });
};

export const getElementCoordinates = async (page: Page, locator: string) => {
  return await page.locator(locator).boundingBox();
};
