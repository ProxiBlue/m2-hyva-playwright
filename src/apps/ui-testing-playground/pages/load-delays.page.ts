import type { Page, TestInfo } from "@playwright/test";
import * as actions from "../../../utils/actions";
import * as data from "../../../../data/apps/ui-testing-playground/load-delays/data.json";
import * as loadDelayslocators from "../locators/load-delays.locator";

export default class DynamicIdPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifyPageTitle() {
    await actions.waitForAnimationEnd(
      this.page,
      loadDelayslocators.loadDelayButton
    );
    await actions.verifyPageTitle(this.page, data.title, this.workerInfo);
  }

  async verifyloadDelayButton() {
    await actions.verifyElementExists(
      this.page,
      loadDelayslocators.loadDelayButton,
      this.workerInfo
    );
  }
}
