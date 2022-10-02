import type { Page, TestInfo } from "@playwright/test";
import { matchScreenshot } from "@utils/base/web/screenshots";
import * as actions from "@utils/base/web/actions";
import { appConfigPath } from "@config";

export default class CommonPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifySnapshot(name: string) {
    const config = require(appConfigPath);
    !config.default.use.headless &&
      (await matchScreenshot(this.page, name, this.workerInfo));
  }

  async waitForAnimationEnd(locator: string) {
    await actions.waitForAnimationEnd(this.page, locator);
  }
}
