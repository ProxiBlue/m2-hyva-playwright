import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const customerLocators = loadLocators('locators/customer.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface LoginData {
    default: {
        invalid_credentials_error?: string;
        required_field_error?: string;
        my_account_title?: string;
    };
}

const defaultData: LoginData = {
    default: {
        invalid_credentials_error: "The account sign-in was incorrect or your account is disabled temporarily. Please wait and try again later.",
        required_field_error: "This is a required field.",
        my_account_title: "My Account",
    }
};

let data = loadJsonData<LoginData>('login.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Login test suite", () => {

    test.setTimeout(90000);

    test.beforeEach(async ({ customerPage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("User can log in with valid credentials", async ({ customerPage, customerData }) => {
        // Create account first, then logout, then login
        await customerPage.createAccount(customerData);
        await customerPage.logout();
        await customerPage.login(customerData);
    });

    test("Invalid credentials are rejected", async ({ customerPage, page }) => {
        await customerPage.navigateTo();

        await page.locator(customerLocators.login_email_field).fill('invalid@nonexistent.com');
        await page.locator(customerLocators.login_password_field).fill('WrongPassword123!');
        await page.getByRole('button', { name: customerLocators.login_button }).click();

        await page.waitForLoadState('domcontentloaded');

        // After multiple failed attempts Magento may show CAPTCHA error instead
        await expect(
            page.locator(pageLocators.message_error),
            'Login error message should be visible'
        ).toBeVisible({ timeout: 10000 });
    });

    test("Login fails with missing password", async ({ customerPage, page }) => {
        await customerPage.navigateTo();

        await page.locator(customerLocators.login_email_field).fill('test@example.com');
        // Leave password empty and click login
        await page.getByRole('button', { name: customerLocators.login_button }).click();

        // Should remain on login page — form should not submit with empty password
        await page.waitForTimeout(1000);
        await expect(page.locator('h1'), 'Should still be on login page').toContainText('Customer Login');

        // Password field should be invalid (HTML5 or JS validation)
        const isInvalid = await page.locator(customerLocators.login_password_field).evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(isInvalid, 'Password field should be invalid').toBe(true);
    });

    test("User can log out", async ({ customerPage, customerData, page }) => {
        await customerPage.createAccount(customerData);
        await customerPage.logout();

        // After logout, should be redirected and login link available
        await page.waitForLoadState('domcontentloaded');
        const currentUrl = page.url();
        expect(
            currentUrl.includes('logoutSuccess') || !currentUrl.includes('account'),
            'User should be logged out'
        ).toBe(true);
    });
});
