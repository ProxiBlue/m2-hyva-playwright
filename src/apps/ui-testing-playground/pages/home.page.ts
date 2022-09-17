import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures";
import * as fs from "fs";

import * as data from "../../../../data/apps/ui-testing-playground/home/data.json";
import * as actions from "../../../utils/actions";
import { matchScreenshot, takeScreenshot } from "../../../utils/screenshots";
import * as locators from "../locators/home.locator";

export default class HomePage {
  constructor(public page: Page) {}

  async navigateToUITestingPlayground() {
    await actions.navigateTo(this.page, data.url);
    const url = this.page.url();

    await test.step("Check if URL contains " + data.urlContains, async () =>
      expect(url).toContain(data.urlContains)
    );
  }

  async verifyHomePageSnapshot() {
    fs.existsSync(data.homePagePath)
      ? await matchScreenshot(this.page, data.homePagePath)
      : await takeScreenshot(this.page, data.homePagePath, true);
  }

  async verifyLinks() {
    await test.step("Verify if dynamic id link is enabled", async () =>
      await expect(this.page.locator(locators.dynamicIdLink)).toBeEnabled());

    await test.step("Verify if class attribute link is enabled", async () =>
      await expect(
        this.page.locator(locators.classAttributeLink)
      ).toBeEnabled());

    await test.step("Verify if hidden layers link is enabled", async () =>
      await expect(this.page.locator(locators.hiddenLayersLink)).toBeEnabled());

    await test.step("Verify if load delay link is enabled", async () =>
      await expect(this.page.locator(locators.loadDelayLink)).toBeEnabled());

    await test.step("Verify if ajax data link is enabled", async () =>
      await expect(this.page.locator(locators.ajaxDataLink)).toBeEnabled());

    await test.step("Verify if client side delay link is enabled", async () =>
      await expect(
        this.page.locator(locators.clientSideDelayLink)
      ).toBeEnabled());

    await test.step("Verify if click link is enabled", async () =>
      await expect(this.page.locator(locators.clickLink)).toBeEnabled());

    await test.step("Verify if text input link is enabled", async () =>
      await expect(this.page.locator(locators.textInputLink)).toBeEnabled());

    await test.step("Verify if scroll bars link is enabled", async () =>
      await expect(this.page.locator(locators.scrollBarsLink)).toBeEnabled());

    await test.step("Verify if dynamic table link is enabled", async () =>
      await expect(this.page.locator(locators.dynamicTableLink)).toBeEnabled());

    await test.step("Verify if verify text link is enabled", async () =>
      await expect(this.page.locator(locators.verifyTextLink)).toBeEnabled());

    await test.step("Verify if progress bar link is enabled", async () =>
      await expect(this.page.locator(locators.progressBarLink)).toBeEnabled());

    await test.step("Verify if visibility link is enabled", async () =>
      await expect(this.page.locator(locators.visibilityLink)).toBeEnabled());

    await test.step("Verify if sample app link is enabled", async () =>
      await expect(this.page.locator(locators.sampleAppLink)).toBeEnabled());

    await test.step("Verify if mouse over link is enabled", async () =>
      await expect(this.page.locator(locators.mouseOverLink)).toBeEnabled());

    await test.step("Verify if non breaking space link is enabled", async () =>
      await expect(
        this.page.locator(locators.nonBreakingSpaceLink)
      ).toBeEnabled());

    await test.step("Verify if overalpped element link is enabled", async () =>
      await expect(
        this.page.locator(locators.overlappedElementLink)
      ).toBeEnabled());

    await test.step("Verify if shadow DOM link is enabled", async () =>
      await expect(this.page.locator(locators.shadowDOMLink)).toBeEnabled());
  }

  async clickLink(link: string) {
    await actions.clickElement(this.page, link);
  }
}
