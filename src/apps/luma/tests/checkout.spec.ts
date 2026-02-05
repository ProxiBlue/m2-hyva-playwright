import { test, describe, expect } from "../fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

// Load locators dynamically
const locators = loadLocators('locators/customer.locator', 'luma');
const pageLocators = loadLocators('locators/page.locator', 'luma');

describe("Frontend Checkout actions with one Item in cart", () => {

    test.setTimeout(90000);

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test("it can proceed to checkout as guest using Check / Money Order", async ({ cartPage, checkoutPage, customerData }) => {
        await cartPage.navigateTo();
        const itemLineTotal = await cartPage.getLineItemsPrices();
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
        await cartPage.clickProceedToCheckout();
        await checkoutPage.fillCustomerForm(customerData);
        await checkoutPage.selectShippingMethod();
        const checkoutSubTotal = await checkoutPage.getSubTotal();
        expect(itemLineTotal).toEqual(checkoutSubTotal);
        await checkoutPage.selectPaymentmethodByName('Check / Money order');
        await checkoutPage.actionPlaceOrder();
        await checkoutPage.testSuccessPage();
    });

    test("it can proceed to checkout as guest using Bank Transfer", async ({ cartPage, checkoutPage, customerData }) => {
        await cartPage.navigateTo();
        const itemLineTotal = await cartPage.getLineItemsPrices();
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
        await cartPage.clickProceedToCheckout();
        await checkoutPage.fillCustomerForm(customerData);
        await checkoutPage.selectShippingMethod();
        const checkoutSubTotal = await checkoutPage.getSubTotal();
        expect(itemLineTotal).toEqual(checkoutSubTotal);
        await checkoutPage.selectPaymentmethodByName('Bank Transfer Payment');
        await checkoutPage.actionPlaceOrder();
        await checkoutPage.testSuccessPage();
    });

    test("it can proceed to checkout as guest using Cash On Delivery", async ({ cartPage, checkoutPage, customerData, customerPage, page }) => {
        await cartPage.navigateTo();
        const itemLineTotal = await cartPage.getLineItemsPrices();
        await cartPage.checkSubtotalMatches(itemLineTotal.toFixed(2));
        await cartPage.clickProceedToCheckout();
        await page.waitForLoadState("domcontentloaded");

        // Check for authentication popup (some Luma configs require login)
        const popup = await page.$('.popup-authentication');
        if (popup) {
            await expect(page.locator('.popup-authentication').getByRole('link', { name: locators.create_button })).toBeVisible();
            await page.locator('.popup-authentication').getByRole('link', { name: locators.create_button }).click();
            await page.waitForLoadState('domcontentloaded');
            await customerPage.fillCreateForm(customerData);
            await page.waitForLoadState('domcontentloaded');
            await page.getByRole('button', { name: locators.create_button }).click();
            await page.waitForLoadState('domcontentloaded');
            await page.waitForSelector(pageLocators.message_success);
        } else {
            await checkoutPage.fillCustomerForm(customerData);
        }

        await checkoutPage.selectShippingMethod();
        const checkoutSubTotal = await checkoutPage.getSubTotal();
        expect(itemLineTotal).toEqual(checkoutSubTotal);
        await checkoutPage.selectPaymentmethodByName('Cash On Delivery');
        await checkoutPage.actionPlaceOrder();
        await checkoutPage.testSuccessPage();
    });

});
