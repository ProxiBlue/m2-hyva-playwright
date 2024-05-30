import { test, describe } from "@hyva/fixtures";

describe("Cart actions with one Item in cart", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test("it can change the quantity in the cart ", async ({ cartPage }, testInfo) => {
        await cartPage.navigateTo();
        // first, confirm we have a qty of 1 in the cart
        await cartPage.checkQuantity(0, 1);
        // then change it
        await cartPage.changeQuantity(0,2);
        const itemLineTotal = await cartPage.getLineItemsPrices();
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
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
        await cartPage.checkGrandTotalMatches(itemLineTotal.toFixed(2));
    });

});
