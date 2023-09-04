import {describe, test} from "@hyva/fixtures";

describe("Home", () => {
    test("Verify home page", async ({homePage}, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await homePage.navigateTo();
        await homePage.verifyDomTitle();
    });

    test('Can perform search from homepage', async ({homePage, isMobile}, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await homePage.navigateTo();
        await homePage.canSearchFromHomepage(isMobile);
    });
});
