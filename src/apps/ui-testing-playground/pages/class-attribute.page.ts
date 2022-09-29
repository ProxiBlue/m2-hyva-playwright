import type { Page, TestInfo } from "@playwright/test";
import { test, expect } from "../fixtures";
import * as actions from "@utils/base/web/actions";
import * as data from "@data/apps/ui-testing-playground/class-attribute/data.json";
import * as locators from "../locators/class-attribute.locator";

export default class ClassAttributePage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title, this.workerInfo);
  }

  async verifyClassAttributeButtons() {
    await actions.verifyElementExists(
      this.page,
      locators.primaryButton,
      this.workerInfo
    );
    await actions.verifyElementExists(
      this.page,
      locators.successButton,
      this.workerInfo
    );
    await actions.verifyElementExists(
      this.page,
      locators.warningButton,
      this.workerInfo
    );
  }

  async verifyAlert() {
    let alertHandler = false;

    await test.step(
      this.workerInfo.project.name + ": Initialize listener for alert",
      async () =>
        this.page.on("dialog", async (dialog) => {
          setTimeout(async function () {
            await dialog.accept();
            alertHandler = true;
            expect(dialog.message()).toEqual(data.alertText);
          }, 500);
        })
    );

    await actions.clickElement(
      this.page,
      locators.primaryButton,
      this.workerInfo
    );
    if (!alertHandler) this.page.waitForEvent("dialog");
  }
}
