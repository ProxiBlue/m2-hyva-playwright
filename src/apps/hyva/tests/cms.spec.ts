import {describe, test} from "@hyva/fixtures";
import { shouldSkipTest } from "@utils/functions/test-skip";

describe("CMS Pages", () => {

    test.beforeEach(async ({ cmsPage }, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
    });

    test("it can display the default 404 page", async ({ cmsPage }, testInfo) => {
        await cmsPage.navigateToWrongPage();
        await cmsPage.checkErrorPage();
    });

    test("it can open default CMS pages", async ({ cmsPage }, testInfo) => {
        await cmsPage.openDefaultCMSPages();
    });
});
