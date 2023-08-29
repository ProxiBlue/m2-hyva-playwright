import { test, describe } from "../fixtures";

describe("Home", () => {
    test("Verify home page", async ({ homePage }) => {
        await homePage.navigateTo();
        await homePage.verifyDomTitle();
        await homePage.verifyPageTitle()
    });
});
