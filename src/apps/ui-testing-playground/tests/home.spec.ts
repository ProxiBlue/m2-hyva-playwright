import { test, describe } from "../fixtures";
import * as locators from "../locators/home.locator";

describe("Home", () => {
  test("Verify links in home page", async ({ homePage, commonPage }) => {
    await homePage.navigateToUITestingPlayground();
    await commonPage.waitForAnimationEnd(locators.dynamicIdLink);
    await commonPage.verifySnapshotIfNotHeadless();
    await homePage.verifyLinks();
  });
});
