import {describe, test, expect} from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const productLocators = loadLocators('locators/product.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');
const sideCartLocators = loadLocators('locators/sidecart.locator', 'hyva');

describe("Home test suite", () => {

    test.beforeEach(async ({ homePage}, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await homePage.navigateTo();
    });

    test("it can navigate to the homepage", async ({homePage}, testInfo) => {
        await homePage.verifyDomTitle();
    });

    test('it can perform search from homepage', async ({homePage, isMobile}, testInfo) => {
        await homePage.canSearchFromHomepage(isMobile);
    });

    test('it can add a homepage product to cart', async ({ page, sideCartPage }) => {
        // Skip if homepage has no product grid (e.g. B2B sites with category-only landing)
        const productGrid = page.locator(productLocators.productGrid).first();
        if (!(await productGrid.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No product grid on homepage');
        }

        const addToCartButton = productGrid
            .locator(productLocators.productGridItem)
            .first()
            .locator('button', { hasText: 'Add to Cart' });

        await expect(addToCartButton.first()).toBeVisible();
        await addToCartButton.first().click();

        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator(pageLocators.message_success)).toBeVisible({ timeout: 10000 });

        // Verify product appears in minicart
        await sideCartPage.open();
        const items = await page.$$(sideCartLocators.items);
        expect(items.length).toBeGreaterThan(0);
    });
});
