import { test, describe } from "../fixtures";
import * as locators from "../locators/home.locator";

test.beforeEach(async ({ homePage }) => {
  await homePage.navigateToUITestingPlayground();
});

describe("Class Attribute", () => {
  test("Verify title and buttons in Class Attribute page", async ({
    homePage,
    classAttributePage,
  }) => {
    await homePage.clickLink(locators.classAttributeLink);
    await classAttributePage.verifyPageTitle();
    await classAttributePage.verifyClassAttributeButtons();
    await classAttributePage.verifyAlert();
  });
});
