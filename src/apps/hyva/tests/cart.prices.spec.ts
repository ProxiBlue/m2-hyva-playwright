import { test, describe } from "@hyva/fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/product.locator";
import { expect } from "@playwright/test";
import * as pageLocators from "@hyva/locators/page.locator";
import * as cartLocators from "@hyva/locators/cart.locator";

describe("Cart prices with one Item in cart", () => {

    test.beforeEach(async ({ simpleProductPage }) => {
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test("Displays the correct product prices and totals for simple product with no special price", async (
        { cartPage, simpleProductPage }, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        const productPrice = await simpleProductPage.getProductPrice();
        await cartPage.navigateTo();
        const cartItemPrice = await cartPage.getItemSubTotal(0);
        await expect(cartItemPrice).toEqual(productPrice);
        await cartPage.checkSubtotalMatches(cartItemPrice);
        await cartPage.checkGrandTotalMatches(cartItemPrice);
    });

});
