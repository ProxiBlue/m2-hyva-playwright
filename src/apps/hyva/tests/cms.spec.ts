import {describe, test} from "@hyva/fixtures";

describe("CMS Pages", () => {

    test.beforeEach(async ({ cmsPage }, testInfo) => {
        // @ts-ignore
        test.skip(process.env.skipBaseTests.includes(testInfo.title), testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
    });

    test("it can display the default 404 page", async ({ cmsPage }, testInfo) => {
        await cmsPage.navigateToWrongPage();
        await cmsPage.checkErrorPage();
    });

    test("it can open default CMS pages", async ({ cmsPage }, testInfo) => {
        await cmsPage.openDefaultCMSPages();
    });
});
