import { test, describe } from "@hyva/fixtures";
import { expect } from "@playwright/test";


describe("Cart actions with one Item in cart price values", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Displays the correct product prices and totals for simple product with no special price", async (
        { cartPage, simpleProductPage }, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.getProductPrice().then(async (price) => {
            await simpleProductPage.addToCart();
            await cartPage.navigateTo();
            cartPage.getItemSubTotal(0).then(async (subTotal) => {
                expect(subTotal).toEqual(price);
                await cartPage.checkSubtotalMatches(price);
                await cartPage.checkGrandTotalMatches(price);
            });

        });

    });


});
