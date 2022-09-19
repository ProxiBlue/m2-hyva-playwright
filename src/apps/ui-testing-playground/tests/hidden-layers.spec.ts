import { test, describe } from "../fixtures";
import * as homePageLocators from "../locators/home.locator";
import * as hiddenLayersPageLocators from "../locators/hidden-layers.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Hidden Layers", () => {
  test("Verify title and button in hidden layers page", async ({
    homePage,
    commonPage,
    hiddenLayersPage,
  }) => {
    await homePage.clickLink(homePageLocators.hiddenLayersLink);
    await commonPage.waitForAnimationEnd(hiddenLayersPageLocators.greenButton);
    await hiddenLayersPage.verifyPageTitle();
    await commonPage.verifySnapshotIfNotHeadless();
    await hiddenLayersPage.verifyGreenButton();
    await hiddenLayersPage.validateGreenButton();
  });
});
