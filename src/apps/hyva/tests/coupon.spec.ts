import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const cartLocators = loadLocators('locators/cart.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface CouponData {
    default: {
        valid_coupon_code?: string;
        invalid_coupon_code?: string;
        coupon_applied_message?: string;
        coupon_removed_message?: string;
        invalid_coupon_error?: string;
    };
}

const defaultData: CouponData = {
    default: {
        valid_coupon_code: "",
        invalid_coupon_code: "INVALIDCODE999",
        coupon_applied_message: "You used coupon code",
        coupon_removed_message: "You canceled the coupon code.",
        invalid_coupon_error: "is not valid",
    }
};

let data = loadJsonData<CouponData>('coupon.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

async function expandCouponForm(page: any) {
    const couponToggle = page.getByText(cartLocators.discount_toggle);
    if (await couponToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        await couponToggle.click();
        await page.waitForTimeout(500);
    }
}

describe("Cart coupon test suite", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test("Add a valid coupon code in cart", async ({ cartPage, page }) => {
        const couponCode = data.default.valid_coupon_code || '';

        // Skip if no valid coupon configured for this store
        if (!couponCode) {
            test.skip(true, 'No valid coupon code configured in coupon.data.json');
        }

        await cartPage.navigateTo();
        await expandCouponForm(page);

        const couponInput = page.locator(cartLocators.coupon_input);
        if (!(await couponInput.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No coupon form available in cart');
        }

        await couponInput.fill(couponCode);
        await page.getByRole('button', { name: cartLocators.coupon_apply_button }).click();
        await page.waitForLoadState('domcontentloaded');

        const successMessage = data.default.coupon_applied_message || 'You used coupon code';
        await expect(
            page.locator(pageLocators.message_success),
            'Coupon applied success message should be visible'
        ).toContainText(successMessage, { timeout: 10000 });
    });

    test("Remove a coupon code from cart", async ({ cartPage, page }) => {
        const couponCode = data.default.valid_coupon_code || '';

        // Skip if no valid coupon configured for this store
        if (!couponCode) {
            test.skip(true, 'No valid coupon code configured in coupon.data.json');
        }

        await cartPage.navigateTo();
        await expandCouponForm(page);

        const couponInput = page.locator(cartLocators.coupon_input);
        if (!(await couponInput.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No coupon form available in cart');
        }

        await couponInput.fill(couponCode);
        await page.getByRole('button', { name: cartLocators.coupon_apply_button }).click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator(pageLocators.message_success)).toBeVisible({ timeout: 10000 });

        // Now remove the coupon
        await expandCouponForm(page);
        await page.getByRole('button', { name: cartLocators.coupon_cancel_button }).click();
        await page.waitForLoadState('domcontentloaded');

        const removedMessage = data.default.coupon_removed_message || 'You canceled the coupon code.';
        await expect(
            page.locator(pageLocators.message_success),
            'Coupon removed success message should be visible'
        ).toContainText(removedMessage, { timeout: 10000 });
    });

    test("Invalid coupon code is rejected", async ({ cartPage, page }) => {
        await cartPage.navigateTo();
        await expandCouponForm(page);

        const couponInput = page.locator(cartLocators.coupon_input);
        if (!(await couponInput.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No coupon form available in cart');
        }

        const invalidCode = data.default.invalid_coupon_code || 'INVALIDCODE999';
        await couponInput.fill(invalidCode);
        await page.getByRole('button', { name: cartLocators.coupon_apply_button }).click();
        await page.waitForLoadState('domcontentloaded');

        const errorMessage = data.default.invalid_coupon_error || 'is not valid';
        await expect(
            page.locator(pageLocators.message_error),
            'Invalid coupon error should be visible'
        ).toContainText(errorMessage, { timeout: 10000 });
    });
});
