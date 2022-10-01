import type { Page, TestInfo } from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as data from "../data/ajax-data/data.json";
import * as locators from "../locators/ajax-data.locator";
import { test, expect } from "../fixtures";

export default class AjaxDataPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title, this.workerInfo);
  }

  async verifyAjaxMessage() {
    await actions.clickElement(
      this.page,
      locators.buttonTriggeringAjaxRequestButton,
      this.workerInfo
    );
    await actions.verifyElementExists(
      this.page,
      locators.successParagraph,
      this.workerInfo
    );
    const successText = await actions.getInnerText(
      this.page,
      locators.successParagraph,
      this.workerInfo
    );
    await test.step(
      this.workerInfo.project.name +
        ": Verify if success message equals" +
        data.successText,
      async () => {
        expect(successText).toEqual(data.successText);
      }
    );
  }
}
