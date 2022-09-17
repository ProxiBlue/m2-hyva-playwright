import { test, describe } from "../fixtures";

describe("Home", () => {
  test("Verify links in home page", async ({ homePage }) => {
    await homePage.navigateToUITestingPlayground();
    await homePage.verifyLinks();
  });
});
