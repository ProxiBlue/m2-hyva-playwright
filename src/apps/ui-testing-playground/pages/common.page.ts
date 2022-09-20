import type { Page, TestInfo } from "@playwright/test";
import { matchScreenshot } from "../../../utils/screenshots";
import * as actions from "../../../utils/actions";
import config from "../../../../playwright.config";

export default class CommonPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifySnapshotIfNotHeadless(name: string) {
    !config.use.headless &&
      (await matchScreenshot(this.page, name, this.workerInfo));
  }

  async waitForAnimationEnd(locator: string) {
    await actions.waitForAnimationEnd(this.page, locator);
  }
}
