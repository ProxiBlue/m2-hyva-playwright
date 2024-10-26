import {test, describe, expect } from "../fixtures";
import * as locators from "@luma/locators/customer.locator";
import * as pageLocators from "@hyva/locators/page.locator";

describe("Frontend Checkout actions with one Item in cart", () => {

    test.setTimeout(90000);

    test.beforeEach(async ({simpleProductPage}, testInfo) => {
        //@ts-ignore
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test("it can proceed to checkout as guest from cart page using Check / Money Order", async ({cartPage, checkoutPage, customerData}) => {
        await cartPage.navigateTo();
        const itemLineTotal = await cartPage.getLineItemsPrices();
        //@ts-ignore
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
        await cartPage.clickProceedToCheckout();
        await checkoutPage.fillCustomerForm(customerData)
        await checkoutPage.selectShippingMethod();
        const checkoutSubTotal = await checkoutPage.getSubTotal();
        // test totals matches
        expect(itemLineTotal).toEqual(checkoutSubTotal);
        await checkoutPage.selectPaymentmethodByName('Check / Money order');
        await checkoutPage.actionPlaceOrder();
        await checkoutPage.testSuccessPage();
    });

    test("it can proceed to checkout as guest from cart page using Bank Transfer", async ({cartPage, checkoutPage, customerData}) => {
        await cartPage.navigateTo();
        const itemLineTotal = await cartPage.getLineItemsPrices();
        //@ts-ignore
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
        await cartPage.clickProceedToCheckout();
        await checkoutPage.fillCustomerForm(customerData)
        await checkoutPage.selectShippingMethod();
        const checkoutSubTotal = await checkoutPage.getSubTotal();
        // test totals matches
        expect(itemLineTotal).toEqual(checkoutSubTotal);
        await checkoutPage.selectPaymentmethodByName('Bank Transfer Payment');
        await checkoutPage.actionPlaceOrder();
        await checkoutPage.testSuccessPage();
    });

    test("it can proceed to checkout from cart as guest page using Cash On Delivery", async (
        {cartPage, checkoutPage, customerData, customerPage, page}) => {
        await cartPage.navigateTo();
        const itemLineTotal = await cartPage.getLineItemsPrices();
        //@ts-ignore
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
        await cartPage.clickProceedToCheckout();
        // possible there is a requirement to register / login before checkout.
        await page.waitForLoadState("domcontentloaded");
        // Wait for the popup with a specific timeout
        // Check for the popup with a specific timeout
        const popup = await page.$('.popup-authentication');
        if (popup) {
            await expect(page.locator('.popup-authentication').getByRole('link', {name: locators.create_button})).toBeVisible();
            await page.locator('.popup-authentication').getByRole('link', {name: locators.create_button}).click();
            await page.waitForLoadState('domcontentloaded');
            await customerPage.fillCreateForm(customerData)
            await page.waitForLoadState('domcontentloaded');
            await page.getByRole('button', {name: locators.create_button}).click();
            await page.waitForLoadState('domcontentloaded');
            await page.waitForSelector(pageLocators.message_success);
        }
        if(!popup) {
            await checkoutPage.fillCustomerForm(customerData)
        }
        await checkoutPage.selectShippingMethod();
        const checkoutSubTotal = await checkoutPage.getSubTotal();
        // test totals matches
        expect(itemLineTotal).toEqual(checkoutSubTotal);
        await checkoutPage.selectPaymentmethodByName('Cash On Delivery');
        await checkoutPage.actionPlaceOrder();
        await checkoutPage.testSuccessPage();
    });

});
