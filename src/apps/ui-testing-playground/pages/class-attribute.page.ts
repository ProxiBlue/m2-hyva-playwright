import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures";
import * as actions from "../../../utils/actions";
import * as data from "../../../../data/apps/ui-testing-playground/class-attribute/data.json";
import * as locators from "../locators/class-attribute.locator";

export default class ClassAttributePage {
  constructor(public page: Page) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title);
  }

  async verifyClassAttributeButtons() {
    await actions.verifyElementExists(this.page, locators.primaryButton);
    await actions.verifyElementExists(this.page, locators.successButton);
    await actions.verifyElementExists(this.page, locators.warningButton);
  }

  async verifyAlert() {
    let alertHandler = false;

    await test.step("Initialize listener for alert", async () =>
      this.page.on("dialog", async (dialog) => {
        setTimeout(async function () {
          await dialog.accept();
          alertHandler = true;
          console.log("Alert accepted");
          expect(dialog.message()).toEqual(data.alertText);
        }, 500);
      }));

    await actions.clickElement(this.page, locators.primaryButton);
    if (!alertHandler) this.page.waitForEvent("dialog");
  }
}
