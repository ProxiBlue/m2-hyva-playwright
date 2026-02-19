// NOTE: "Request password reset" test is skipped when CAPTCHA is enabled (default Luma sample data).
// To run it, disable CAPTCHA in Stores > Configuration > Customers > CAPTCHA > Forms > Forgot Password.
import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface ForgotPasswordData {
    default: {
        success_message?: string;
    };
}

const defaultData: ForgotPasswordData = {
    default: {
        success_message: "If there is an account associated with",
    }
};

let data = loadJsonData<ForgotPasswordData>('forgot_password.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Forgot password test suite", () => {

    test.setTimeout(120000);

    test.beforeEach(async ({}, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Request password reset with valid email", async ({ page }) => {
        await page.goto(process.env.url + 'customer/account/forgotpassword/');
        await page.waitForLoadState('domcontentloaded');

        await page.getByRole('textbox', { name: 'Email', exact: true }).fill('testuser@example.com');

        await page.getByRole('button', { name: 'Reset My Password' }).click({ force: true });
        await page.waitForLoadState('domcontentloaded');

        // Check for CAPTCHA error (some environments have CAPTCHA enabled)
        const captchaError = page.getByText('Incorrect CAPTCHA');
        if (await captchaError.isVisible({ timeout: 3000 }).catch(() => false)) {
            test.skip(true, 'CAPTCHA is enabled on forgot password — cannot test programmatically');
        }

        const successMessage = data.default.success_message || '';
        await expect(
            page.locator(pageLocators.message_success),
            'Password reset success message should be visible'
        ).toContainText(successMessage, { timeout: 30000 });
    });

    test("Forgot password with empty email shows validation", async ({ page }) => {
        await page.goto(process.env.url + 'customer/account/forgotpassword/');
        await page.waitForLoadState('domcontentloaded');

        await page.getByRole('button', { name: 'Reset My Password' }).click({ force: true });
        await page.waitForTimeout(1000);

        // Should remain on the same page with validation error
        const emailField = page.getByRole('textbox', { name: 'Email', exact: true });
        await expect(emailField).toBeVisible();

        // No success message should appear
        const successMsg = page.locator(pageLocators.message_success);
        await expect(successMsg).not.toBeVisible({ timeout: 3000 });
    });
});
