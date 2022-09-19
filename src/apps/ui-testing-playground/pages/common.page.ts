import type { Page, TestInfo } from "@playwright/test";
import { matchScreenshot } from "../../../utils/screenshots";
import * as actions from "../../../utils/actions";

export default class CommonPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifySnapshot() {
    await matchScreenshot(this.page, this.workerInfo);
  }

  async waitForAnimationEnd(locator: string) {
    await actions.waitForAnimationEnd(this.page, locator);
  }
}
