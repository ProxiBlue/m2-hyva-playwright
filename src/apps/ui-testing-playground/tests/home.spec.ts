import { test, describe } from "../fixtures";

describe("Home", () => {
  test("Verify links in home page", async ({ homePage, commonPage }) => {
    await homePage.navigateToUITestingPlayground();
    await commonPage.verifySnapshot();
    await homePage.verifyLinks();
  });
});
