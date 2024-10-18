import { test, describe, expect } from "@hyva/fixtures";

import * as productLocators from "@hyva/locators/product.locator";

describe("Side cart price check", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test('it checks if the prices in the slider are displayed correctly', async ({ simpleProductPage, sideCartPage }, testInfo) => {
        await sideCartPage.checkQtyIndication(1);
        let itemPrice = await simpleProductPage.getProductPrice();
        await sideCartPage.open();
        // get the subtotal of the first product in the cart
        let lineItemPrice = await sideCartPage.getItemPrice(0);
        expect(lineItemPrice).toEqual(itemPrice);
        let miniCartSubtotalText = await sideCartPage.getMiniCartSubtotal();
        let total = Number(miniCartSubtotalText.replace(/[^0-9\.-]+/g, ""));
        let cleanItemPrice = Number(itemPrice.replace(/[^0-9\.-]+/g, ""));
        expect(total).toEqual(cleanItemPrice);
        // lets add in another item, and confirm price is increased correctly
        await simpleProductPage.navigateTo();
        itemPrice = await simpleProductPage.getProductPrice();
        await simpleProductPage.addToCart();
        await sideCartPage.checkQtyIndication(2);
        await sideCartPage.open();
        // get the subtotal of the first product in the cart
        lineItemPrice = await sideCartPage.getItemPrice(0)
        expect(lineItemPrice).toEqual(itemPrice);
        miniCartSubtotalText = await sideCartPage.getMiniCartSubtotal();
        total = Number(miniCartSubtotalText.replace(/[^0-9\.-]+/g, ""));
        cleanItemPrice = Number(itemPrice.replace(/[^0-9\.-]+/g, "")) * 2;
        expect(total).toEqual(cleanItemPrice);
    });

});
