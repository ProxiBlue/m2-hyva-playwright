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

        const firstProduct = productGrid.locator(productLocators.productGridItem).first();
        const addToCartButton = firstProduct.locator('button', { hasText: 'Add to Cart' }).first();

        await expect(addToCartButton).toBeVisible();

        // Some product grids render an "Add to Cart" button that redirects to the
        // PDP when the product requires options (data-mage-init redirectUrl). In
        // that case the click navigates away and no success message appears on
        // the homepage — skip rather than fail, since it is legitimate behaviour.
        const redirectUrl = await addToCartButton.evaluate((el) => {
            const init = el.getAttribute('data-mage-init') || '';
            const match = init.match(/"url"\s*:\s*"([^"]+)"/);
            return match ? match[1] : null;
        }).catch(() => null);

        if (redirectUrl) {
            test.skip(true, 'Homepage product requires options (redirects to PDP) — not a quick add-to-cart widget');
        }

        await addToCartButton.click();

        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator(pageLocators.message_success)).toBeVisible({ timeout: 10000 });

        // Verify product appears in minicart
        await sideCartPage.open();
        const items = await page.$$(sideCartLocators.items);
        expect(items.length).toBeGreaterThan(0);
    });
});
