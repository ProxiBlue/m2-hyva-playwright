import {describe, test} from "@hyva/fixtures";
import { shouldSkipTest } from "@utils/functions/test-skip";

describe("Home test suite", () => {

    test.beforeEach(async ({ homePage}, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await homePage.navigateTo();
    });

    test("it can navigate to the homepage", async ({homePage}, testInfo) => {
        await homePage.verifyDomTitle();
    });

    test('it can perform search from homepage', async ({homePage, isMobile}, testInfo) => {
        await homePage.canSearchFromHomepage(isMobile);
    });
});
