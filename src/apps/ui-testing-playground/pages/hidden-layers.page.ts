import type { Page, TestInfo } from "@playwright/test";
import * as actions from "../../../utils/actions";
import * as data from "../../../../data/apps/ui-testing-playground/hidden-layers/data.json";
import * as locators from "../locators/hidden-layers.locator";
import { test, expect } from "../fixtures";

export default class HiddenLayersPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title, this.workerInfo);
  }

  async verifyGreenButton() {
    await actions.verifyElementExists(
      this.page,
      locators.greenButton,
      this.workerInfo
    );
  }

  async validateGreenButton() {
    await actions.clickElement(
      this.page,
      locators.greenButton,
      this.workerInfo
    );
    await actions.verifyElementExists(
      this.page,
      locators.blueButton,
      this.workerInfo
    );

    const greenButtonPosition = await actions.getElementCoordinates(
      this.page,
      locators.greenButton
    );
    const blueButtonPosition = await actions.getElementCoordinates(
      this.page,
      locators.blueButton
    );

    await test.step(
      this.workerInfo.project.name +
        ": Verify if both buttons are in the same position",
      async () => expect(greenButtonPosition).toStrictEqual(blueButtonPosition)
    );
  }
}
