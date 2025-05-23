import {describe, test} from "@admin/fixtures";

describe("Admin", () => {

    test.beforeEach(async ({ adminPage }, testInfo) => {
        // @ts-ignore
        test.skip(process.env.skipBaseTests.includes(testInfo.title), testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await adminPage.navigateTo();
    });

    test("can login to admin panel", async ({adminPage}, testInfo) => {
        await adminPage.login();
    });

    test("can logout from admin panel", async ({adminPage}, testInfo) => {
        await adminPage.login();
        await adminPage.logout();
    });

});
