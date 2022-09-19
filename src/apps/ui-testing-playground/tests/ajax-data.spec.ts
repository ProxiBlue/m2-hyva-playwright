import { test, describe } from "../fixtures";
import * as homePageLocators from "../locators/home.locator";
import * as ajaxDataPageLocators from "../locators/ajax-data.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Ajax Data", () => {
  test("Verify title in Ajax data page", async ({
    homePage,
    commonPage,
    ajaxDataPage,
  }) => {
    await homePage.clickLink(homePageLocators.ajaxDataLink);
    await commonPage.waitForAnimationEnd(
      ajaxDataPageLocators.buttonTriggeringAjaxRequestButton
    );
    await ajaxDataPage.verifyPageTitle();
    await commonPage.verifySnapshotIfNotHeadless();
  });

  test("Verify ajax message in Ajax data page", async ({
    homePage,
    commonPage,
    ajaxDataPage,
  }) => {
    await homePage.clickLink(homePageLocators.ajaxDataLink);
    await commonPage.waitForAnimationEnd(
      ajaxDataPageLocators.buttonTriggeringAjaxRequestButton
    );
    await ajaxDataPage.verifyAjaxMessage();
    await commonPage.verifySnapshotIfNotHeadless();
  });
});
