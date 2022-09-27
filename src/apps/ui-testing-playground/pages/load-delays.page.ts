import type { Page, TestInfo } from "@playwright/test";
import * as actions from "../../../utils/base/actions";
import * as data from "../../../../data/apps/ui-testing-playground/load-delays/data.json";
import * as locators from "../locators/load-delays.locator";

export default class LoadDelaysPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title, this.workerInfo);
  }

  async verifyloadDelayButton() {
    await actions.verifyElementExists(
      this.page,
      locators.loadDelayButton,
      this.workerInfo
    );
  }
}
