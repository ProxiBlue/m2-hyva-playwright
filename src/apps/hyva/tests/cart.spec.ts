import { test, describe } from "@hyva/fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/product.locator";
import { expect } from "@playwright/test";
import * as pageLocators from "@hyva/locators/page.locator";
import * as cartLocators from "@hyva/locators/cart.locator";

describe("Cart actions with one Item in cart", () => {

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

    test("Can change the quantity in the cart", async ({ cartPage }, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await cartPage.navigateTo();
        await cartPage.changeQuantity(0,2);
        //const cartItemPrice = await cartPage.getItemSubTotal(0);
        //await cartPage.checkSubtotalMatches(cartItemPrice);
        //await cartPage.checkGrandTotalMatches(cartItemPrice);
    });

    test("Can delete item from the cart", async ({ cartPage }, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await cartPage.navigateTo();
        await cartPage.deleteItem(0);
        await actions.verifyElementIsVisible(cartPage.page, cartLocators.cart_empty, cartPage.workerInfo);
    });


});
