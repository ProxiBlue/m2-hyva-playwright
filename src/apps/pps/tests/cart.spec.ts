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

    test("Can clear the cart", async ({ cartPage }) => {
        await cartPage.navigateTo();
        await cartPage.clearCart();
        await actions.verifyElementIsVisible(cartPage.page, cartLocators.cart_empty, cartPage.workerInfo);
    });

    test("Can cancel clear the cart", async ({ cartPage }) => {
        await cartPage.navigateTo();
        await cartPage.clearCartCancel();
        await actions.verifyElementDoesNotExists(cartPage.page, cartLocators.cart_empty, cartPage.workerInfo);
    });

});
