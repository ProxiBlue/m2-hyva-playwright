import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { parsePrice } from "@utils/functions/price";
import { shouldSkipTest } from "@utils/functions/test-skip";

const cartLocators = loadLocators('locators/cart.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');

describe("Cart quantity test suite", () => {

    test.setTimeout(90000);

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test("Change quantity on cart page", async ({ cartPage, page }) => {
        await cartPage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        // Get initial subtotal
        const initialPriceText = await page.locator(cartLocators.cart_row_subtotal).first().textContent() || '';
        const initialPrice = parsePrice(initialPriceText);
        expect(initialPrice).toBeGreaterThan(0);

        // Change qty to 3 using the spinbutton
        const qtyInput = page.getByRole('spinbutton', { name: 'Qty' }).first();
        await qtyInput.fill('3');

        // Click update cart button
        await page.getByRole('button', { name: 'Update Shopping Cart' }).click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Verify qty was updated
        const updatedQty = await page.getByRole('spinbutton', { name: 'Qty' }).first().inputValue();
        expect(updatedQty).toBe('3');

        // Verify subtotal updated (should be 3x the unit price)
        const updatedPriceText = await page.locator(cartLocators.cart_row_subtotal).first().textContent() || '';
        const updatedPrice = parsePrice(updatedPriceText);
        expect(updatedPrice).toBeCloseTo(initialPrice * 3, 1);
    });
});
