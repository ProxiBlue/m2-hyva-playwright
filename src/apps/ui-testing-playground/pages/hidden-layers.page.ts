import type { Page } from "@playwright/test";
import * as actions from "../../../utils/actions";
import * as data from "../../../../data/apps/ui-testing-playground/hidden-layers/data.json";
import * as locators from "../locators/hidden-layers.locator";
import { test, expect } from "../fixtures";

export default class HiddenLayersPage {
  constructor(public page: Page) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title);
  }

  async verifyGreenButton() {
    await actions.verifyElementExists(this.page, locators.greenButton);
  }

  async validateGreenButton() {
    await actions.clickElement(this.page, locators.greenButton);
    await actions.verifyElementExists(this.page, locators.blueButton);

    const greenButtonPosition = await actions.getElementCoordinates(
      this.page,
      locators.greenButton
    );
    const blueButtonPosition = await actions.getElementCoordinates(
      this.page,
      locators.blueButton
    );

    await test.step("Verify if both buttons are in the same position", async () =>
      expect(greenButtonPosition).toStrictEqual(blueButtonPosition));
  }
}
