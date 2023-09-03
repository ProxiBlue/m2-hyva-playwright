import { test, describe } from "../fixtures";
import * as actions from "@utils/base/web/actions";
import { expect } from "@playwright/test";
import * as cartLocators from "@hyva/locators/cart.locator";
import * as shippingRateData from "../data/cart.shipping_estimate.data.json";
import * as locators from "../locators/cart.shipping_estimate.locator";
import * as productLocators from "@hyva/locators/product.locator";
import * as pageLocators from "@hyva/locators/page.locator";

describe("Cart shipping estimate with ShipperHQ", () => {

    test.setTimeout(120000)

    test("Isolated shipping rate test", async (
        { page, cartPage}) => {
        await page.goto(process.env.URL + shippingRateData.product_1);
        await page.fill(productLocators.product_qty_input, '1')
        await page.locator(productLocators.product_add_to_cart_button).click();
        await page.waitForLoadState("networkidle");
        expect(await page.locator(pageLocators.message_success).isVisible()).toBe(true);
        expect(await page.locator(pageLocators.message_success).textContent()).toContain('to your cart');
        await page.goto(process.env.URL + shippingRateData.product_2);
        await page.fill(productLocators.product_qty_input, '50')
        await page.locator(productLocators.product_add_to_cart_button).click();
        await page.waitForLoadState("networkidle");
        expect(await page.locator(pageLocators.message_success).isVisible()).toBe(true);
        expect(await page.locator(pageLocators.message_success).textContent()).toContain('to your cart');
        await cartPage.navigateTo();
        await expect(await page.getByText(shippingRateData.form_heading).isVisible()).toBe(true);
        await page.getByLabel('zip').clear();
        await page.selectOption(locators.region, shippingRateData.region);
        await page.fill(locators.postcode, shippingRateData.postcode)
        await page.dispatchEvent(locators.postcode, 'input');
        const response = await page.waitForResponse(response => response.url().includes('/estimate-shipping-methods'));
        await expect(response.status()).toBe(200);
        const responseBody =  await response.text();
        const responseObject = JSON.parse(responseBody);
        let count = responseObject.length;
        await expect(count).toBe(3);
        let shippingAmount = '';
        try {
            for (var key in responseObject) {
                switch (key) {
                    case '0':
                        await expect(responseObject[key].carrier_code).toBe('multicarrier');
                        await expect(responseObject[key].method_code).toBe('ground-freight');
                        shippingAmount = responseObject[key].amount;
                        break;
                    case '1':
                        await expect(responseObject[key].carrier_code).toBe('shqups');
                        await expect(responseObject[key].method_code).toBe('2DA');
                        break;
                    case '2':
                        await expect(responseObject[key].carrier_code).toBe('shqups');
                        await expect(responseObject[key].method_code).toBe('1DA');
                        break;
                }
            }
        } finally {
            // now select the shipping rate
            await page.locator(locators.ground_freight).check();
            await page.waitForLoadState("networkidle");
            await cartPage.checkShippingMatches(shippingAmount, shippingRateData.rate_label);
        }

    });

});
