import {describe, test} from "@hyva/fixtures";

describe("Home", () => {

    test.beforeEach(async ({ homePage}, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await homePage.navigateTo();
    });

    test("it can navigate to the homepage", async ({homePage}, testInfo) => {
        await homePage.verifyDomTitle();
    });

    test('it can perform search from homepage ', async ({homePage, isMobile}, testInfo) => {
        await homePage.canSearchFromHomepage(isMobile);
    });
});
