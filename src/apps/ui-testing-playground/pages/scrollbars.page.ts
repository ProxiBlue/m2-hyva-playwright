import type { Page, TestInfo } from "@playwright/test";
import * as actions from "../../../utils/base/actions";
import * as data from "../../../../data/apps/ui-testing-playground/scrollbars/data.json";
import * as locators from "../locators/scrollbars.locator";

export default class ScrollBarsPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title, this.workerInfo);
  }

  async scrollToElement() {
    await actions.scrollToElement(
      this.page,
      locators.hidingButton,
      this.workerInfo
    );
  }
}
