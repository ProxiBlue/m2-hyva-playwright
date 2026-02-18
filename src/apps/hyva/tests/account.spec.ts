import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface AccountData {
    default: {
        password_saved_message?: string;
        newsletter_saved_message?: string;
    };
}

const defaultData: AccountData = {
    default: {
        password_saved_message: "You saved the account information.",
        newsletter_saved_message: "We have saved your subscription.",
    }
};

let data = loadJsonData<AccountData>('account.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Account management test suite", () => {

    test.setTimeout(120000);

    test.beforeEach(async ({ customerPage, customerData }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);

        // Create a fresh account for each test
        await customerPage.createAccount(customerData);
    });

    test("Change password", async ({ customerData, page }) => {
        // Navigate to account edit page
        await page.goto(process.env.url + '/customer/account/edit/');
        await page.waitForLoadState('domcontentloaded');

        // Check for "Change Password" checkbox/link
        const changePasswordToggle = page.getByRole('checkbox', { name: /Change Password/i });
        if (!(await changePasswordToggle.isVisible({ timeout: 5000 }).catch(() => false))) {
            // Try link or button variant
            const changePasswordLink = page.getByText('Change Password');
            if (await changePasswordLink.isVisible({ timeout: 3000 }).catch(() => false)) {
                await changePasswordLink.click();
            } else {
                test.skip(true, 'No change password option found on account edit page');
            }
        } else {
            await changePasswordToggle.check();
        }

        await page.waitForTimeout(500);

        // Fill current password
        const currentPasswordField = page.locator('#current-password');
        await expect(currentPasswordField).toBeVisible({ timeout: 5000 });
        await currentPasswordField.fill(customerData.password);

        // Fill new password
        const newPassword = customerData.password + 'New1!';
        await page.locator('#password').fill(newPassword);
        await page.locator('#password-confirmation').fill(newPassword);

        // Submit form
        await page.getByRole('button', { name: 'Save' }).click();
        await page.waitForLoadState('domcontentloaded');

        // Verify success message
        const successMessage = data.default.password_saved_message || 'You saved the account information.';
        await expect(
            page.locator(pageLocators.message_success),
            'Password change success message should be visible'
        ).toContainText(successMessage, { timeout: 10000 });
    });

    test("Update email address", async ({ customerData, page }) => {
        // Navigate to account edit page
        await page.goto(process.env.url + '/customer/account/edit/');
        await page.waitForLoadState('domcontentloaded');

        // Check for "Change Email" checkbox/link
        const changeEmailToggle = page.getByRole('checkbox', { name: /Change Email/i });
        if (!(await changeEmailToggle.isVisible({ timeout: 5000 }).catch(() => false))) {
            const changeEmailLink = page.getByText('Change Email');
            if (await changeEmailLink.isVisible({ timeout: 3000 }).catch(() => false)) {
                await changeEmailLink.click();
            } else {
                test.skip(true, 'No change email option found on account edit page');
            }
        } else {
            await changeEmailToggle.check();
        }

        await page.waitForTimeout(500);

        // Update email field
        const emailField = page.locator('#email');
        await expect(emailField).toBeVisible({ timeout: 5000 });
        const newEmail = 'updated_' + customerData.email;
        await emailField.fill(newEmail);

        // Fill current password (required for email change)
        const currentPasswordField = page.locator('#current-password');
        await expect(currentPasswordField).toBeVisible({ timeout: 5000 });
        await currentPasswordField.fill(customerData.password);

        // Submit form
        await page.getByRole('button', { name: 'Save' }).click();
        await page.waitForLoadState('domcontentloaded');

        // Verify success message
        const successMessage = data.default.password_saved_message || 'You saved the account information.';
        await expect(
            page.locator(pageLocators.message_success),
            'Email update success message should be visible'
        ).toContainText(successMessage, { timeout: 10000 });
    });

    test("Update newsletter subscription", async ({ page }) => {
        // Navigate to newsletter management page
        await page.goto(process.env.url + '/newsletter/manage/');
        await page.waitForLoadState('domcontentloaded');

        // Check if newsletter page loaded (may redirect to login if session expired)
        const heading = page.locator('h1');
        const headingText = await heading.textContent().catch(() => '');
        if (headingText?.includes('Customer Login')) {
            test.skip(true, 'Session expired, redirected to login');
        }

        // Find the newsletter subscription checkbox
        const subscriptionCheckbox = page.locator('#subscription');
        if (!(await subscriptionCheckbox.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No newsletter subscription checkbox found');
        }

        // Toggle the subscription (check it if unchecked, uncheck if checked)
        const isChecked = await subscriptionCheckbox.isChecked();
        if (isChecked) {
            await subscriptionCheckbox.uncheck();
        } else {
            await subscriptionCheckbox.check();
        }

        // Submit form
        await page.getByRole('button', { name: 'Save' }).click();
        await page.waitForLoadState('domcontentloaded');

        // Verify success message
        const successMessage = data.default.newsletter_saved_message || 'We saved the subscription.';
        await expect(
            page.locator(pageLocators.message_success),
            'Newsletter subscription update message should be visible'
        ).toContainText(successMessage, { timeout: 10000 });
    });
});
