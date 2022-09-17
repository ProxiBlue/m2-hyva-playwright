import { test, describe } from "../fixtures";
import * as locators from "../locators/home.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Dynamic ID", () => {
  test("Verify title and button in Dynamic Id page", async ({
    homePage,
    dynamicIdPage,
  }) => {
    await homePage.clickLink(locators.dynamicIdLink);
    await dynamicIdPage.verifyPageTitle();
    await dynamicIdPage.verifyDynamicIdButton();
  });
});
