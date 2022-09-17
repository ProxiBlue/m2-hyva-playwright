import test, { expect, Page, TestInfo } from "@playwright/test";

export const matchScreenshot = async (
  page: Page,
  path: string,
  workerInfo: TestInfo
) => {
  await test.step(
    workerInfo.project.name + ": Check if screenshot matches with snapshot",
    async () => {
      return expect(await page.screenshot()).toMatchSnapshot(path, {
        threshold: 0.3,
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
