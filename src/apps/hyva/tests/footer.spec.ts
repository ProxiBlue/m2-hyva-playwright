import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface FooterData {
    default: {
        newsletter_success_message?: string;
        newsletter_already_subscribed_message?: string;
    };
}

const defaultData: FooterData = {
    default: {
        newsletter_success_message: "Thank you for your subscription.",
        newsletter_already_subscribed_message: "This email address is already subscribed.",
    }
};

let data = loadJsonData<FooterData>('footer.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Footer test suite", () => {

    test.beforeEach(async ({ homePage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await homePage.navigateTo();
    });

    test("Footer is visible", async ({ page }) => {
        await expect(page.locator(pageLocators.footer)).toBeVisible();
    });

    test("Newsletter subscription from footer", async ({ page }) => {
        const footer = page.locator(pageLocators.footer);
        const submitButton = footer.getByRole('button', { name: 'Subscribe' });

        // Skip if footer has no newsletter form (e.g. replaced with feedback form)
        if (!(await submitButton.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No newsletter subscription form in footer');
        }

        const emailInput = footer.locator('#newsletter-subscribe, #newsletter');
        await expect(emailInput).toBeVisible();

        const uniqueEmail = `test.footer.${Date.now()}@example.com`;
        await emailInput.fill(uniqueEmail);
        await submitButton.click();

        await page.waitForLoadState('domcontentloaded');

        const successMessage = data.default.newsletter_success_message || 'Thank you for your subscription.';
        await expect(
            page.locator('.message.success'),
            'Newsletter subscription success message should be visible'
        ).toContainText(successMessage, { timeout: 10000 });
    });
});
