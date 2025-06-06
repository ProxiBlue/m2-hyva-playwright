import { test, describe } from "@hyva/fixtures";
import { shouldSkipTest } from "@utils/functions/test-skip";

describe("Category test suite", () => {

     test.beforeEach(async ({ categoryPage}, testInfo) => {
         // Use the helper function to determine if the test should be skipped
         const shouldSkip = shouldSkipTest(testInfo);

         test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
         await categoryPage.navigateTo();
     });

    test("Filters", async ({ categoryPage }, testInfo) => {
        await categoryPage.checkFilter();
    });

    test("it can sort the products on price from lowest to highest", async ({ categoryPage }, testInfo) => {
        await categoryPage.sortProductsByPriceLowToHigh();
    });

    test("it can sort the products on price from highest to lowest", async ({ categoryPage }, testInfo) => {
        await categoryPage.sortProductsByPriceHighToLow();
    });

    test("it can sort the products by name (a-z)", async ({ categoryPage }, testInfo) => {
        await categoryPage.sortProductsByNameAscending();
    });

    test("it can sort the products by name (z-a)", async ({ categoryPage }, testInfo) => {
        await categoryPage.sortProductsByNameDescending();
    });

    test("it can change the number of displayed products (limiter)", async ({ categoryPage }, testInfo) => {
        await categoryPage.limitProducts();
    });

    test("it checks if the breadcrumb is displayed correctly", async ({ categoryPage }, testInfo) => {
        await categoryPage.checkBreadcrumbs();
    });

    test("it can switch from list to grid view", async ({ categoryPage }, testInfo) => {
        await categoryPage.ListAndGrid();
    });

    test("it checks if the pagination is working", async ({ categoryPage }, testInfo) => {
        await categoryPage.checkPager();
    });

    test("it can add multiple products to compare, and compare count indicators work.", async ({ categoryPage }, testInfo) => {
        await categoryPage.addToCompare();
    });


});
