import { test, describe } from "../fixtures";
import * as homePageLocators from "../locators/home.locator";
import * as textInputPageLocators from "../locators/text-input.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Text Input", () => {
  test("Verify title in Text input page", async ({
    homePage,
    commonPage,
    textInputPage,
  }) => {
    await homePage.clickLink(homePageLocators.textInputLink);
    await commonPage.waitForAnimationEnd(textInputPageLocators.updatingButton);
    await textInputPage.verifyPageTitle();
    await commonPage.verifySnapshotIfNotHeadless();
  });

  test("Verify updating button in Text input page", async ({
    homePage,
    commonPage,
    textInputPage,
  }) => {
    await homePage.clickLink(homePageLocators.textInputLink);
    await commonPage.waitForAnimationEnd(textInputPageLocators.updatingButton);
    await commonPage.verifySnapshotIfNotHeadless();
    await textInputPage.verifyUpdatingButton();
    await commonPage.verifySnapshotIfNotHeadless();
  });
});
