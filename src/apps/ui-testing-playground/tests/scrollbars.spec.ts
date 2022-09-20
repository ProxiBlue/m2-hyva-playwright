import { test, describe } from "../fixtures";
import * as homePageLocators from "../locators/home.locator";
import * as scrollBarsPageLocators from "../locators/scrollbars.locator";
import * as data from "../../../../data/apps/ui-testing-playground/scrollbars/data.json";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Scrollbars", () => {
  test("Verify title in Scrollbars page", async ({
    homePage,
    commonPage,
    scrollBarsPage,
  }) => {
    await homePage.clickLink(homePageLocators.scrollBarsLink);
    await commonPage.waitForAnimationEnd(scrollBarsPageLocators.hidingButton);
    await commonPage.verifySnapshotIfNotHeadless(
      data.verifyTitleScreenshotName
    );
    await scrollBarsPage.verifyPageTitle();
  });

  test("Verify hidden button Scrollbars page", async ({
    homePage,
    commonPage,
    scrollBarsPage,
  }) => {
    await homePage.clickLink(homePageLocators.scrollBarsLink);
    await commonPage.waitForAnimationEnd(scrollBarsPageLocators.hidingButton);
    await scrollBarsPage.scrollToElement();
    await commonPage.verifySnapshotIfNotHeadless(
      data.verifyHidingButtonScreenshotName
    );
  });
});
