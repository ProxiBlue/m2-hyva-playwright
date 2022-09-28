import type { Page, TestInfo } from "@playwright/test";
import { test, expect } from "../fixtures";

import * as data from "../../../../data/apps/ui-testing-playground/home/data.json";
import * as actions from "../../../utils/base/actions";
import * as locators from "../locators/home.locator";

export default class HomePage {
  constructor(public page: Page, public workerInfo: TestInfo) {}

  async navigateToUITestingPlayground() {
    await actions.navigateTo(this.page, process.env.URL, this.workerInfo);
    const url = this.page.url();

    await test.step(
      this.workerInfo.project.name +
        ": Check if URL contains " +
        data.urlContains,
      async () => expect(url).toContain(data.urlContains)
    );
  }

  async verifyLinks() {
    await test.step(
      this.workerInfo.project.name + ": Verify if dynamic id link is enabled",
      async () =>
        await expect(this.page.locator(locators.dynamicIdLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name +
        ": Verify if class attribute link is enabled",
      async () =>
        await expect(
          this.page.locator(locators.classAttributeLink)
        ).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name +
        ": Verify if hidden layers link is enabled",
      async () =>
        await expect(this.page.locator(locators.hiddenLayersLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if load delay link is enabled",
      async () =>
        await expect(this.page.locator(locators.loadDelayLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if ajax data link is enabled",
      async () =>
        await expect(this.page.locator(locators.ajaxDataLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name +
        ": Verify if client side delay link is enabled",
      async () =>
        await expect(
          this.page.locator(locators.clientSideDelayLink)
        ).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if click link is enabled",
      async () =>
        await expect(this.page.locator(locators.clickLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if text input link is enabled",
      async () =>
        await expect(this.page.locator(locators.textInputLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if scroll bars link is enabled",
      async () =>
        await expect(this.page.locator(locators.scrollBarsLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name +
        ": Verify if dynamic table link is enabled",
      async () =>
        await expect(this.page.locator(locators.dynamicTableLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if verify text link is enabled",
      async () =>
        await expect(this.page.locator(locators.verifyTextLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if progress bar link is enabled",
      async () =>
        await expect(this.page.locator(locators.progressBarLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if visibility link is enabled",
      async () =>
        await expect(this.page.locator(locators.visibilityLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if sample app link is enabled",
      async () =>
        await expect(this.page.locator(locators.sampleAppLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if mouse over link is enabled",
      async () =>
        await expect(this.page.locator(locators.mouseOverLink)).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name +
        ": Verify if non breaking space link is enabled",
      async () =>
        await expect(
          this.page.locator(locators.nonBreakingSpaceLink)
        ).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name +
        ": Verify if overalpped element link is enabled",
      async () =>
        await expect(
          this.page.locator(locators.overlappedElementLink)
        ).toBeEnabled()
    );

    await test.step(
      this.workerInfo.project.name + ": Verify if shadow DOM link is enabled",
      async () =>
        await expect(this.page.locator(locators.shadowDOMLink)).toBeEnabled()
    );
  }

  async clickLink(link: string) {
    await actions.clickElement(this.page, link, this.workerInfo);
  }
}
