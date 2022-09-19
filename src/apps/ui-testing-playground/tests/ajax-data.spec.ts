import { test, describe } from "../fixtures";
import * as locators from "../locators/home.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Ajax Data", () => {
  test("Verify title in Ajax data page", async ({
    homePage,
    commonPage,
    ajaxDataPage,
  }) => {
    await homePage.clickLink(locators.ajaxDataLink);
    await ajaxDataPage.verifyPageTitle();
    await commonPage.verifySnapshot();
  });

  test("Verify ajax message in Ajax data page", async ({
    homePage,
    commonPage,
    ajaxDataPage,
  }) => {
    await homePage.clickLink(locators.ajaxDataLink);
    await ajaxDataPage.verifyAjaxMessage();
    await commonPage.verifySnapshot();
  });
});
