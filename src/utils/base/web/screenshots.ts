import test, { expect, Page, TestInfo } from "@playwright/test";
import fs from "fs";

export const matchScreenshot = async (
  page: Page,
  name: string,
  workerInfo: TestInfo
) => {
  workerInfo.snapshotSuffix = "";
  await test.step(
    workerInfo.project.name + ": Check if screenshot matches with snapshot",
    async () => {
      await page.evaluate(() => document.fonts.ready);

      const screenshotFullPath =
        workerInfo.snapshotDir +
        "/" +
        name +
        "-" +
        workerInfo.project.name +
        ".png";

      if (fs.existsSync(screenshotFullPath)) {
        return expect(
          await page.screenshot({
            fullPage: true,
          })
        ).toMatchSnapshot({
          name: name + ".png",
          threshold: 0.3,
          maxDiffPixelRatio: 0.03,
        });
      } else {
        console.log("No previous snapshots found. Taking baseline screenshot");
        takeScreenshot(page, screenshotFullPath, true, workerInfo);
      }
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
