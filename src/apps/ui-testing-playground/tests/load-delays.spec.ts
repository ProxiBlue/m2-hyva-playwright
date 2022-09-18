import { test, describe } from "../fixtures";
import * as locators from "../locators/home.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Load Delays", () => {
  test("Verify title and button in Load delays page", async ({
    homePage,
    commonPage,
    loadDelaysPage,
  }) => {
    await homePage.clickLink(locators.loadDelayLink);
    await loadDelaysPage.verifyPageTitle();
    await commonPage.verifySnapshot();
    await loadDelaysPage.verifyloadDelayButton();
  });
});
