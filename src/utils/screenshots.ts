import test, { expect, Page, TestInfo } from "@playwright/test";

export const matchScreenshot = async (page: Page, workerInfo: TestInfo) => {
  await test.step(
    workerInfo.project.name + ": Check if screenshot matches with snapshot",
    async () => {
      await page.evaluate(() => document.fonts.ready);
      return expect(
        await page.screenshot({
          fullPage: true,
        })
      ).toMatchSnapshot({
        threshold: 0.3,
        maxDiffPixelRatio: 0.03,
      });
    }
  );
};

export const takeScreenshot = async (
  page: Page,
  path: string,
  fullPageFlag: boolean,
  workerInfo: TestInfo
) => {
  await page.evaluate(() => document.fonts.ready);
  await test.step(
    workerInfo.project.name + ": Capture screenshot to " + path,
    async () => {
      await page.screenshot({
        path: path,
        fullPage: fullPageFlag,
      });
    }
  );
};
