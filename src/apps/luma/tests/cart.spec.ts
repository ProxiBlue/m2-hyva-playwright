import { test, describe } from "@luma/fixtures";
import { shouldSkipTest } from "@utils/functions/test-skip";

describe("Cart actions with one Item in cart", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test("it can add an item to the cart ", async ({ cartPage }, testInfo) => {
        await cartPage.navigateTo();
        // first, confirm we have a qty of 1 in the cart
        await cartPage.checkQuantity(0, 1);
    });


    test("it can change the quantity in the cart ", async ({ cartPage }, testInfo) => {
        await cartPage.navigateTo();
        // first, confirm we have a qty of 1 in the cart
        await cartPage.checkQuantity(0, 1);
        // then change it
        await cartPage.changeQuantity(0,2);
        const itemLineTotal = await cartPage.getLineItemsPrices();
        //@ts-ignore
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
    });

    test("it can remove a product from the cart ", async ({ cartPage }, testInfo) => {
        await cartPage.navigateTo();
        await cartPage.deleteItem(0);
    });

    test("Displays the correct product prices and totals for simple product with no special price, and no shipping selected", async (
        { cartPage, simpleProductPage }, testInfo) => {
        await cartPage.navigateTo();
        const itemLineTotal = await cartPage.getLineItemsPrices();
        //@ts-ignore
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
        //@ts-ignore
        await cartPage.checkGrandTotalMatches(itemLineTotal.toFixed(2));
    });

});
