import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');
const contactLocators = loadLocators('locators/contact.locator', 'hyva');

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

        await page.locator(contactLocators.nameField).fill('Test User ' + timestamp);
        await page.locator(contactLocators.emailField).fill('testuser' + timestamp + '@example.com');

        await page.locator(contactLocators.telephoneField).fill('5551234567');

        // Fill Subject field if present (some themes include it)
        const subjectField = page.locator(contactLocators.subjectField);
        if (await subjectField.count() > 0) {
            await subjectField.fill('Test inquiry ' + timestamp);
        }

        await page.locator(contactLocators.commentField).fill('Automated test message ' + timestamp);
        await page.locator(contactLocators.submitButton).click({ force: true });
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

        await page.locator(contactLocators.submitButton).click({ force: true });
        await page.waitForTimeout(1000);

        // Required fields should show validation errors — still on contact page
        const nameField = page.locator(contactLocators.nameField);
        await expect(nameField).toBeVisible();

        // Verify no success message appeared
        const successMsg = page.locator(pageLocators.message_success);
        await expect(successMsg).not.toBeVisible({ timeout: 3000 });
    });
});
