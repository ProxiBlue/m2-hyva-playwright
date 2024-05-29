import { test, describe, expect } from "@hyva/fixtures";

import * as productLocators from "@hyva/locators/product.locator";

describe("Side cart price check", () => {

    test('Check if the items and prices in the slider cart are displayed correctly', async ({ page, simpleProductPage, sideCartPage }, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
        await sideCartPage.checkQtyIndication(1);
        let itemPrice = await simpleProductPage.getProductPrice();
        await sideCartPage.open();
        // get the subtotal of the first product in the cart
        sideCartPage.getItemPrice(0).then(async (price) => {
            // check if the subtotal matches the product price
            expect(price).toEqual(itemPrice);
        });
        let miniCartSubtotalText = await sideCartPage.getMiniCartSubtotal();
        let total = Number(miniCartSubtotalText.replace(/[^0-9\.-]+/g, ""));
        let cleanItemPrice = Number(itemPrice.replace(/[^0-9\.-]+/g, ""));
        expect(total).toEqual(cleanItemPrice);
        // lets add in another item, and confirm price is increased correctly
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
        await sideCartPage.checkQtyIndication(2);
        itemPrice = await simpleProductPage.getProductPrice();
        await sideCartPage.open();
        // get the subtotal of the first product in the cart
        sideCartPage.getItemPrice(0).then(async (price) => {
            // check if the subtotal matches the product price
            expect(price).toEqual(itemPrice);
        });
        miniCartSubtotalText = await sideCartPage.getMiniCartSubtotal();
        total = Number(miniCartSubtotalText.replace(/[^0-9\.-]+/g, ""));
        cleanItemPrice = Number(itemPrice.replace(/[^0-9\.-]+/g, "")) * 2;
        expect(total).toEqual(cleanItemPrice);
    });

});
