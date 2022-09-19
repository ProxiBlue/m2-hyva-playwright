import { test, describe } from "../fixtures";
import * as homePageLocators from "../locators/home.locator";
import * as clickPageLocators from "../locators/click.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Click", () => {
  test("Verify title in Click page", async ({
    homePage,
    commonPage,
    clickPage,
  }) => {
    await homePage.clickLink(homePageLocators.clickLink);
    await commonPage.waitForAnimationEnd(clickPageLocators.badButton);
    await clickPage.verifyPageTitle();
  });

  test("Verify buttons in Click page", async ({
    homePage,
    commonPage,
    clickPage,
  }) => {
    await homePage.clickLink(homePageLocators.clickLink);
    await commonPage.waitForAnimationEnd(clickPageLocators.badButton);
    await commonPage.verifySnapshotIfNotHeadless();
    await clickPage.verifyButtons();
    await commonPage.verifySnapshotIfNotHeadless();
  });
});
