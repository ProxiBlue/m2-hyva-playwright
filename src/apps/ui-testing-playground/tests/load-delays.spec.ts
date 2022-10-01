import { test, describe } from "../fixtures";
import * as homePageLocators from "../locators/home.locator";
import * as loadDelaysPageLocators from "../locators/load-delays.locator";
import * as data from "../data/load-delays.data.json";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Load Delays", () => {
  test("Verify title and button in Load delays page", async ({
    homePage,
    commonPage,
    loadDelaysPage,
  }) => {
    await homePage.clickLink(homePageLocators.loadDelayLink);
    await commonPage.waitForAnimationEnd(
      loadDelaysPageLocators.loadDelayButton
    );
    await loadDelaysPage.verifyPageTitle();
    await commonPage.verifySnapshot(data.verifyTitleScreenshotName);
    await loadDelaysPage.verifyloadDelayButton();
  });
});
