import { test, describe } from "@luma/fixtures";
import { shouldSkipTest } from "@utils/functions/test-skip";

describe("Cart actions with one Item in cart", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test("it can add an item to the cart", async ({ cartPage }) => {
        await cartPage.navigateTo();
        await cartPage.checkQuantity(0, 1);
    });

    test("it can change the quantity in the cart", async ({ cartPage }) => {
        await cartPage.navigateTo();
        await cartPage.checkQuantity(0, 1);
        await cartPage.changeQuantity(0, 2);
        const itemLineTotal = await cartPage.getLineItemsPrices();
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
    });

    test("it can remove a product from the cart", async ({ cartPage }) => {
        await cartPage.navigateTo();
        await cartPage.deleteItem(0);
    });

    test("displays correct product prices and totals for simple product", async ({ cartPage }) => {
        await cartPage.navigateTo();
        const itemLineTotal = await cartPage.getLineItemsPrices();
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
        await cartPage.checkGrandTotalMatches(itemLineTotal.toFixed(2));
    });

});
