import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface ContactData {
    default: {
        success_message?: string;
    };
}

const defaultData: ContactData = {
    default: {
        success_message: "Thanks for contacting us with your comments and questions. We'll respond to you very soon.",
    }
};

let data = loadJsonData<ContactData>('contact.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Contact form test suite", () => {

    test.setTimeout(120000);

    test.beforeEach(async ({}, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Submit contact form successfully", async ({ page }) => {
        await page.goto(process.env.url + 'contact/');
        await page.waitForLoadState('domcontentloaded');

        const timestamp = Date.now();

        await page.getByRole('textbox', { name: 'Name' }).fill('Test User ' + timestamp);
        await page.getByRole('textbox', { name: 'Email', exact: true }).fill('testuser' + timestamp + '@example.com');
        await page.getByRole('textbox', { name: 'Phone Number' }).fill('5551234567');
        // Label uses curly quote (U+2019) — use CSS selector instead of role-based
        await page.locator('#comment').fill('Automated test message ' + timestamp);

        await page.locator('button[type="submit"][title="Submit"]').click({ force: true });
        await page.waitForLoadState('domcontentloaded');

        const successMessage = data.default.success_message || '';
        await expect(
            page.locator(pageLocators.message_success),
            'Contact form success message should be visible'
        ).toContainText(successMessage, { timeout: 30000 });
    });

    test("Contact form validation prevents empty submission", async ({ page }) => {
        await page.goto(process.env.url + 'contact/');
        await page.waitForLoadState('domcontentloaded');

        await page.locator('button[type="submit"][title="Submit"]').click({ force: true });
        await page.waitForTimeout(1000);

        // Required fields should show validation errors — still on contact page
        const nameField = page.getByRole('textbox', { name: 'Name' });
        await expect(nameField).toBeVisible();

        // Verify no success message appeared
        const successMsg = page.locator(pageLocators.message_success);
        await expect(successMsg).not.toBeVisible({ timeout: 3000 });
    });
});
