import { test, describe } from "@hyva/fixtures";

describe("Category Product List actions", () => {

     test.beforeEach(async ({ categoryPage}, testInfo) => {
         test.skip(process.env.skipBaseTests.includes(testInfo.title), testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
         await categoryPage.navigateTo();
     });

    test("Filters", async ({ categoryPage }, testInfo) => {
        await categoryPage.checkFilter();
    });

    test("Can sort products on price from lowest to highest", async ({ categoryPage }, testInfo) => {
        await categoryPage.sortProductsByPriceLowToHigh();
    });

    test("Can sort products on price from highest to lowest", async ({ categoryPage }, testInfo) => {
        await categoryPage.sortProductsByPriceHighToLow();
    });

    test("Can sort products by name ascending (a-z)", async ({ categoryPage }, testInfo) => {
        await categoryPage.sortProductsByNameAscending();
    });

    test("Can sort products by name descending (z-a)", async ({ categoryPage }, testInfo) => {
        await categoryPage.sortProductsByNameDescending();
    });

    test("Can Change number of products displayed (limiter)", async ({ categoryPage }, testInfo) => {
        await categoryPage.limitProducts();
    });

    test("Can see the correct breadcrumbs", async ({ categoryPage }, testInfo) => {
        await categoryPage.checkBreadcrumbs();
    });

    test("Can swap between list and grid view", async ({ categoryPage }, testInfo) => {
        await categoryPage.ListAndGrid();
    });

    test("Can move to next and previous page using pager", async ({ categoryPage }, testInfo) => {
        await categoryPage.checkPager();
    });

    test("Can add to compare", async ({ categoryPage }, testInfo) => {
        await categoryPage.addToCompare();
    });


});
