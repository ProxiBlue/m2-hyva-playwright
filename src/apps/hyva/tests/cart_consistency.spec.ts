import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { parsePrice } from "@utils/functions/price";
import { shouldSkipTest } from "@utils/functions/test-skip";

const cartLocators = loadLocators('locators/cart.locator', 'hyva');
const productLocators = loadLocators('locators/product.locator', 'hyva');

describe("Cart data consistency test suite", () => {

    test.setTimeout(90000);

    test.beforeEach(async ({}, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Simple product data consistent PDP to cart", async ({ simpleProductPage, page }) => {
        await simpleProductPage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        // Capture product name from PDP
        const pdpName = await page.locator(productLocators.title).textContent() || '';
        expect(pdpName.trim()).not.toBe('');

        // Capture product price from PDP
        const pdpPriceText = await simpleProductPage.getProductPrice();
        const pdpPrice = parsePrice(pdpPriceText);
        expect(pdpPrice).toBeGreaterThan(0);

        // Add to cart with qty 1
        await simpleProductPage.addToCart();

        // Navigate to cart page
        await page.goto(process.env.url + '/checkout/cart');
        await page.waitForLoadState('domcontentloaded');

        // Verify product name in cart
        const cartItemName = await page.locator(cartLocators.cart_row_item_name).first().textContent() || '';
        expect(cartItemName.trim()).toContain(pdpName.trim());

        // Verify price in cart matches PDP
        const cartPriceText = await page.locator(cartLocators.cart_row_item_price).first().textContent() || '';
        const cartPrice = parsePrice(cartPriceText);
        expect(cartPrice).toEqual(pdpPrice);

        // Verify qty is 1
        const cartQty = await page.locator(cartLocators.cart_row_qty_input).first().inputValue();
        expect(cartQty).toBe('1');
    });

    test("Configurable product data consistent PDP to cart", async ({ configurableProductPage, page }) => {
        await configurableProductPage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        // Capture product name from PDP
        const pdpName = await page.locator(productLocators.title).textContent() || '';
        expect(pdpName.trim()).not.toBe('');

        // Select product options
        try {
            await configurableProductPage.selectProductSwatch();
        } catch {
            await configurableProductPage.selectProductAttributes();
        }

        // Get price after option selection
        await page.waitForTimeout(500);
        const pdpPriceText = await page.locator(productLocators.productItemPrice).first().textContent() || '';
        const pdpPrice = parsePrice(pdpPriceText);
        expect(pdpPrice).toBeGreaterThan(0);

        // Add to cart
        await configurableProductPage.addToCart();

        // Verify options in cart (navigates to cart page internally)
        await configurableProductPage.verifyOptionsInCart();

        // Also verify name is present in cart
        const cartItemName = await page.locator(cartLocators.cart_row_item_name).first().textContent() || '';
        expect(cartItemName.trim()).toContain(pdpName.trim());
    });
});
