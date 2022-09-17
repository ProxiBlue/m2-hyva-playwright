import { test, describe } from "../fixtures";
import * as locators from "../locators/home.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Hidden Layers", () => {
  test("Verify title and button in hidden layers page", async ({
    homePage,
    hiddenLayersPage,
  }) => {
    await homePage.clickLink(locators.hiddenLayersLink);
    await hiddenLayersPage.verifyPageTitle();
    await hiddenLayersPage.verifyGreenButton();
    await hiddenLayersPage.validateGreenButton();
  });
});
