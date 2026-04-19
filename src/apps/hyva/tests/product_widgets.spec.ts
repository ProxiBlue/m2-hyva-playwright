// NOTE: "Recently viewed" test is skipped when the widget is not configured on the homepage.
// To run it, add a "Recently Viewed Products" widget to the homepage via Content > Widgets.
import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

describe("Product widgets test suite", () => {

    test.setTimeout(60000);

    test.beforeEach(async ({}, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Upsell products visible on PDP", async ({ simpleProductPage, page }) => {
        await simpleProductPage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        // Hyva renders upsell in section#upsell with snap-slider
        const upsellSection = page.locator('section#upsell, section[data-slider-type="upsell"]');

        // Short-circuit BEFORE scrollIntoViewIfNeeded: with actionTimeout:0 and
        // slowMo, scrolling a non-existent locator blocks until the 60s test
        // timeout rather than being caught.
        if ((await upsellSection.count()) === 0) {
            test.skip(true, 'No upsell products section on this product page');
        }
        await upsellSection.first().scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});

        if (!(await upsellSection.first().isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No upsell products section on this product page');
        }

        // Verify heading
        const upsellHeading = page.getByText('We found other products you might like!');
        await expect(upsellHeading, 'Upsell heading should be visible').toBeVisible();

        // Verify at least one product card
        const upsellProducts = upsellSection.first().locator('.product-item');
        const productCount = await upsellProducts.count();
        expect(productCount).toBeGreaterThan(0);
    });

    test("Upsell product links are clickable", async ({ simpleProductPage, page }) => {
        await simpleProductPage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        const upsellSection = page.locator('section#upsell, section[data-slider-type="upsell"]');
        if ((await upsellSection.count()) === 0) {
            test.skip(true, 'No upsell products section on this product page');
        }
        await upsellSection.first().scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});

        if (!(await upsellSection.first().isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No upsell products section on this product page');
        }

        // Click first upsell product link
        const upsellLinks = upsellSection.first().locator('a[href*=".html"]');
        const linkCount = await upsellLinks.count();
        if (linkCount === 0) {
            test.skip(true, 'No clickable upsell product links found');
        }

        const initialUrl = page.url();
        await upsellLinks.first().click();
        await page.waitForLoadState('domcontentloaded');

        // Verify we navigated to a different product page
        expect(page.url()).not.toBe(initialUrl);
        await expect(
            page.locator(pageLocators.pageTitle).first(),
            'Should navigate to a product page'
        ).toBeVisible({ timeout: 10000 });
    });

    test("Recently viewed products populate", async ({ simpleProductPage, page }) => {
        // Visit first product
        await simpleProductPage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        // Visit a second product
        await page.goto(process.env.url + 'chaz-kangeroo-hoodie.html');
        await page.waitForLoadState('domcontentloaded');

        // Navigate to homepage to check recently viewed widget
        await page.goto(process.env.url || '');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        // Look for recently viewed widget — check if it exists in DOM first
        const widgetSelector = '[x-data*="initRecentlyViewed"], .block-viewed-products-grid, section[data-slider-type="recently-viewed"]';
        const widgetCount = await page.locator(widgetSelector).count();

        if (widgetCount === 0) {
            test.skip(true, 'Recently viewed widget not rendered on this page');
        }

        const recentlyViewedWidget = page.locator(widgetSelector).first();
        await recentlyViewedWidget.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        if (!(await recentlyViewedWidget.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'Recently viewed widget not visible');
        }

        // Verify at least one product is shown
        const viewedProducts = recentlyViewedWidget.locator('.product-item, a[href*=".html"]');
        const productCount = await viewedProducts.count();
        expect(productCount).toBeGreaterThan(0);
    });
});
