import test, { expect, Page } from "@playwright/test";

export const matchScreenshot = async (page: Page, path: string) => {
  await test.step("Check if screenshot matches with " + path, async () => {
    return expect(await page.screenshot()).toMatchSnapshot(path, {
      threshold: 0.3,
    });
  });
};

export const takeScreenshot = async (
  page: Page,
  path: string,
  fullPageFlag: boolean
) => {
  await test.step("Capture screenshot to " + path, async () => {
    await page.screenshot({
      path: path,
      fullPage: fullPageFlag,
    });
  });
};
