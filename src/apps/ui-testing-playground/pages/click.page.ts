import type { Page, TestInfo } from "@playwright/test";
import * as actions from "../../../utils/base/actions";
import * as data from "../../../../data/apps/ui-testing-playground/click/data.json";
import * as locators from "../locators/click.locator";
import { test, expect } from "../fixtures";

export default class ClickPage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async verifyPageTitle() {
    await actions.verifyPageTitle(this.page, data.title, this.workerInfo);
  }

  async verifyButtons() {
    await test.step(
      this.workerInfo.project.name +
        ": Verify if button with class " +
        data.primaryButton +
        " exists",
      async () =>
        expect(
          await actions.elementHasClass(
            this.page,
            locators.badButton,
            data.primaryButton,
            this.workerInfo
          )
        ).toBeTruthy()
    );

    this.workerInfo.project.name === "webkit" ||
    this.workerInfo.project.name.indexOf("iPhone") >= 0
      ? await actions.pressEnterOnElement(
          this.page,
          locators.badButton,
          this.workerInfo
        )
      : await actions.clickElement(
          this.page,
          locators.badButton,
          this.workerInfo
        );

    await actions.waitForAnimationEnd(this.page, locators.badButton);

    await test.step(
      this.workerInfo.project.name +
        ": Verify if button with class " +
        data.primaryButton +
        " does not exists",
      async () =>
        expect(
          await actions.elementHasClass(
            this.page,
            locators.badButton,
            data.primaryButton,
            this.workerInfo
          )
        ).toBeFalsy()
    );

    await test.step(
      this.workerInfo.project.name +
        ": Verify if button with class " +
        data.successButton +
        " exists",
      async () =>
        expect(
          await actions.elementHasClass(
            this.page,
            locators.badButton,
            data.successButton,
            this.workerInfo
          )
        ).toBeTruthy()
    );
  }
}
