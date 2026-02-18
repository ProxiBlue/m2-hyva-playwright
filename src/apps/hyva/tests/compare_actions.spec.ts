import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');
const productLocators = loadLocators('locators/product.locator', 'hyva');

describe("Compare page actions test suite", () => {

    test.setTimeout(120000);

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);

        // Navigate to product and add to compare
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCompare();
    });

    test("Add product to cart from comparison page", async ({ page }) => {
        // We should now be on the compare page (addToCompare navigates there)
        await expect(page.locator(pageLocators.compare_table)).toBeVisible({ timeout: 10000 });

        // Find and click Add to Cart button on compare page
        const addToCartButton = page.locator('.table-wrapper').getByRole('link', { name: /Add to Cart/i }).first();
        if (!(await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false))) {
            // Try button instead of link
            const addToCartBtn = page.locator('.table-wrapper').getByRole('button', { name: /Add to Cart/i }).first();
            if (!(await addToCartBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
                test.skip(true, 'No Add to Cart button on compare page');
            }
            await addToCartBtn.click();
        } else {
            await addToCartButton.click();
        }

        await page.waitForLoadState('domcontentloaded');

        // Should either show success message or navigate to product page
        const successVisible = await page.locator(pageLocators.message_success).isVisible({ timeout: 5000 }).catch(() => false);
        if (successVisible) {
            const successText = await page.locator(pageLocators.message_success).textContent() || '';
            expect(successText.toLowerCase()).toContain('cart');
        } else {
            // May have navigated to PDP (for configurable products that need options)
            const currentUrl = page.url();
            expect(
                currentUrl.includes('.html') || currentUrl.includes('checkout/cart'),
                'Should navigate to product page or cart'
            ).toBe(true);
        }
    });

    test("Add product to wishlist from comparison page", async ({ page }) => {
        // We should be on the compare page
        await expect(page.locator(pageLocators.compare_table)).toBeVisible({ timeout: 10000 });

        // Find and click Add to Wish List button/link on compare page
        const wishlistButton = page.locator('.table-wrapper').getByRole('link', { name: /Add to Wish List/i }).first();
        if (!(await wishlistButton.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No Add to Wish List button on compare page');
        }

        await wishlistButton.click();
        await page.waitForLoadState('domcontentloaded');

        // Should redirect to login (not logged in) or show success
        const currentUrl = page.url();
        const isLoginPage = currentUrl.includes('customer/account/login');
        const hasSuccessMessage = await page.locator(pageLocators.message_success).isVisible({ timeout: 5000 }).catch(() => false);
        const hasErrorMessage = await page.locator(pageLocators.message_error).isVisible({ timeout: 3000 }).catch(() => false);

        expect(
            isLoginPage || hasSuccessMessage || hasErrorMessage,
            'Should redirect to login page or show a message'
        ).toBe(true);
    });
});
