import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const sidecartLocators = loadLocators('locators/sidecart.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');

describe("Cart persistence test suite", () => {

    test.setTimeout(120000);

    test.beforeEach(async ({}, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Product remains in cart after login", async ({ simpleProductPage, customerPage, customerData, sideCartPage, page }) => {
        // Add product to cart as guest
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();

        // Verify item is in minicart
        await sideCartPage.checkQtyIndication(1);

        // Create account (will auto-login)
        await customerPage.createAccount(customerData);

        // Verify cart still has the product after login
        await page.goto(process.env.url + '/checkout/cart');
        await page.waitForLoadState('domcontentloaded');

        // Cart should not be empty
        const cartEmpty = page.locator('.cart-empty');
        const isEmpty = await cartEmpty.isVisible({ timeout: 3000 }).catch(() => false);
        expect(isEmpty, 'Cart should not be empty after login').toBe(false);

        // Cart should contain the product
        const cartContent = await page.locator('#shopping-cart-table').textContent();
        expect(cartContent).toContain(simpleProductPage.pageData.default.name);
    });
});
