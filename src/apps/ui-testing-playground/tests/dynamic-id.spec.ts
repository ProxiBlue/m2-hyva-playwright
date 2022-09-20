import { test, describe } from "../fixtures";
import * as homePageLocators from "../locators/home.locator";
import * as dynamicIdPageLocators from "../locators/dynamic-id.locator";
import * as data from "../../../../data/apps/ui-testing-playground/dynamic-id/data.json";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Dynamic ID", () => {
  test("Verify title and button in Dynamic Id page", async ({
    homePage,
    commonPage,
    dynamicIdPage,
  }) => {
    await homePage.clickLink(homePageLocators.dynamicIdLink);
    await commonPage.waitForAnimationEnd(dynamicIdPageLocators.dynamicIdButton);
    await dynamicIdPage.verifyPageTitle();
    await commonPage.verifySnapshotIfNotHeadless(
      data.verifyTitleScreenshotName
    );
    await dynamicIdPage.verifyDynamicIdButton();
  });
});
