import type { Page, TestInfo } from "@playwright/test";
import * as actions from "../../../utils/actions";
import * as data from "../../../../data/apps/ui-testing-playground/text-input/data.json";
import * as locators from "../locators/text-input.locator";
import { test, expect } from "../fixtures";

export default class TextInputPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title, this.workerInfo);
  }

  async verifyUpdatingButton() {
    await test.step(
      this.workerInfo.project.name +
        ": Verify button innerText is equal to " +
        data.buttonBeforeChangeText,
      async () =>
        expect(
          await actions.getInnerText(
            this.page,
            locators.updatingButton,
            this.workerInfo
          )
        ).toEqual(data.buttonBeforeChangeText)
    );

    await actions.type(
      this.page,
      locators.textInput,
      data.textInputValue,
      this.workerInfo
    );

    await actions.clickElement(
      this.page,
      locators.updatingButton,
      this.workerInfo
    );

    await test.step(
      this.workerInfo.project.name +
        ": Verify button innerText is equal to " +
        data.textInputValue,
      async () =>
        expect(
          await actions.getInnerText(
            this.page,
            locators.updatingButton,
            this.workerInfo
          )
        ).toEqual(data.textInputValue)
    );
  }
}
