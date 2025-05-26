import {describe, test} from "@hyva/fixtures";

describe("Search Functionality", () => {

    test.beforeEach(async ({ searchPage }, testInfo) => {
        // @ts-ignore
        test.skip(process.env.skipBaseTests.includes(testInfo.title), testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await searchPage.navigateTo();
    });

    test("it can search with multiple results", async ({ searchPage, isMobile }, testInfo) => {
        await searchPage.searchWithMultipleHits(isMobile);
    });

    test("it can search with no results", async ({ searchPage, isMobile }, testInfo) => {
        await searchPage.searchWithNoResults(isMobile);
    });

    test("it can show search suggestions", async ({ searchPage, isMobile }, testInfo) => {
        await searchPage.checkSearchSuggestions(isMobile);
    });
});
