import { test, describe } from "../fixtures";
import * as homePageLocators from "../locators/home.locator";
import * as classAttributePageLocators from "../locators/class-attribute.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Class Attribute", () => {
  test("Verify title and buttons in Class Attribute page", async ({
    homePage,
    commonPage,
    classAttributePage,
  }) => {
    await homePage.clickLink(homePageLocators.classAttributeLink);
    await commonPage.waitForAnimationEnd(
      classAttributePageLocators.primaryButton
    );
    await classAttributePage.verifyPageTitle();
    await classAttributePage.verifyClassAttributeButtons();
    await classAttributePage.verifyAlert();
  });
});
