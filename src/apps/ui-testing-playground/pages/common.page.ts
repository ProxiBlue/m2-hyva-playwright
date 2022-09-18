import type { Page, TestInfo } from "@playwright/test";
import { matchScreenshot } from "../../../utils/screenshots";

export default class CommonPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifySnapshot() {
    await matchScreenshot(this.page, this.workerInfo);
  }
}
