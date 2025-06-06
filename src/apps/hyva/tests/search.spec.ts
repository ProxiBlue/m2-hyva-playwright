import {describe, test} from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

// Load the locators dynamically based on the APP_NAME environment variable
const locators = loadLocators('locators/search.locator', 'hyva');

describe("Search test suite", () => {

    test.beforeEach(async ({ simpleProductPage, searchPage }, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.page.waitForLoadState('domcontentloaded');
        await simpleProductPage.page.click(locators.headerSearchIcon);
        await simpleProductPage.page.waitForLoadState('domcontentloaded');
    });

    test("it can show search suggestions", async ({ searchPage, isMobile }, testInfo) => {
        await searchPage.checkSearchSuggestions(isMobile);
    });

    test("it can search with multiple results", async ({ searchPage, isMobile }, testInfo) => {
        await searchPage.searchWithMultipleHits(isMobile);
    });

    test("it can search with no results", async ({ searchPage, isMobile }, testInfo) => {
        await searchPage.searchWithNoResults(isMobile);
    });
});
