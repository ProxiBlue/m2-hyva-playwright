import type { Page } from "@playwright/test";
import * as actions from "../../../utils/actions";
import * as data from "../../../../data/apps/ui-testing-playground/dynamic-id/data.json";
import * as locators from "../locators/dynamic-id.locator";

export default class DynamicIdPage {
  constructor(public page: Page) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title);
  }

  async verifyDynamicIdButton() {
    await actions.verifyElementExists(this.page, locators.dynamicIdButton);
  }
}
