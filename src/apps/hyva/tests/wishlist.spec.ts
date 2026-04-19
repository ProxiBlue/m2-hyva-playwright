import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface WishlistData {
    default: {
        empty_message?: string;
    };
}

const defaultData: WishlistData = {
    default: {
        // Hyvä view.phtml emits "You have no items in your wish list." (per-customer
        // wishlist view) while item/list.phtml emits "This Wish List has no Items".
        // Use a regex that accepts either so the test is resilient across the two
        // render paths.
        empty_message: "You have no items in your wish list.",
    }
};

// Shared regex used by the tests below: matches either Hyvä "empty wishlist"
// wording variant, case-insensitive, so we do not care which template branch
// actually renders.
const emptyWishlistRegex = /(you have no items in your wish list|this wish list has no items)/i;

let data = loadJsonData<WishlistData>('wishlist.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Wishlist test suite", () => {

    test.setTimeout(120000);

    test.beforeEach(async ({ customerPage, customerData }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);

        await customerPage.createAccount(customerData);
    });

    test("Wishlist page shows added product", async ({ simpleProductPage, page }) => {
        await simpleProductPage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        // Capture product name from PDP before adding to wishlist
        const pdpProductName = (await page.locator('h1').textContent() || '').trim();
        expect(pdpProductName).not.toBe('');

        await simpleProductPage.addToWishlistLoggedIn();

        await page.goto(process.env.url + 'wishlist/');
        await page.waitForLoadState('domcontentloaded');

        // Verify the product name appears on the wishlist page
        const productName = page.getByText(pdpProductName);
        await expect(
            productName.first(),
            'Product should be visible in wishlist'
        ).toBeVisible({ timeout: 10000 });
    });

    test("Remove product from wishlist", async ({ simpleProductPage, page }) => {
        await simpleProductPage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        await simpleProductPage.addToWishlistLoggedIn();

        await page.goto(process.env.url + 'wishlist/');
        await page.waitForLoadState('domcontentloaded');

        // Click remove button on the wishlist item
        const removeButton = page.getByRole('button', { name: /remove/i })
            .or(page.locator('a.btn-remove, a[title="Remove Item"]'));

        if (await removeButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
            await removeButton.first().click();
            await page.waitForLoadState('domcontentloaded');
        }

        // Verify empty wishlist message — scope to the Hyvä empty-state
        // container so we do not accidentally match other page copy.
        await expect(
            page.locator('.message.info.empty').getByText(emptyWishlistRegex),
            'Empty wishlist message should be visible'
        ).toBeVisible({ timeout: 10000 });
    });

    test("Empty wishlist shows message", async ({ page }) => {
        await page.goto(process.env.url + 'wishlist/');
        await page.waitForLoadState('domcontentloaded');

        await expect(
            page.locator('.message.info.empty').getByText(emptyWishlistRegex),
            'Empty wishlist message should be visible for new account'
        ).toBeVisible({ timeout: 10000 });
    });
});
