import { test, describe, expect } from "@hyva/fixtures";
import { parsePrice } from "@utils/functions/price";
import { shouldSkipTest } from "@utils/functions/test-skip";

describe("Configurable product price check", () => {

    test.setTimeout(90000);

    test.beforeEach(async ({ configurableProductPage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await configurableProductPage.navigateTo();
    });

    test("Configurable PDP price matches minicart price", async ({ configurableProductPage, sideCartPage, page }) => {
        // Select product options (swatch or dropdown)
        try {
            await configurableProductPage.selectProductSwatch();
        } catch {
            await configurableProductPage.selectProductAttributes();
        }

        // Get PDP price after option selection
        await page.waitForTimeout(500); // Wait for price update after option selection
        const pdpPriceText = await page.locator('.product-info-main .final-price .price').first().textContent() || '';
        const pdpPrice = parsePrice(pdpPriceText);
        expect(pdpPrice).toBeGreaterThan(0);

        // Add to cart
        await configurableProductPage.addToCart();

        // Open sidecart and get price
        await sideCartPage.open();
        const minicartPriceText = await sideCartPage.getItemPrice(0);
        const minicartPrice = parsePrice(minicartPriceText || '');

        expect(minicartPrice).toEqual(pdpPrice);
    });
});
