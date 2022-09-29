import type { Page, TestInfo } from "@playwright/test";
import * as actions from "@utils/base/actions";
import * as data from "@data/apps/ui-testing-playground/dynamic-id/data.json";
import * as locators from "../locators/dynamic-id.locator";

export default class DynamicIdPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title, this.workerInfo);
  }

  async verifyDynamicIdButton() {
    await actions.verifyElementExists(
      this.page,
      locators.dynamicIdButton,
      this.workerInfo
    );
  }
}
