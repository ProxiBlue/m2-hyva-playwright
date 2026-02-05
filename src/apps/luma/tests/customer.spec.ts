import { describe, expect, test } from "@luma/fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

// Load locators dynamically
const locators = loadLocators('locators/customer.locator', 'luma');
const pageLocators = loadLocators('locators/page.locator', 'luma');

describe("Customer Tests", () => {

    test.setTimeout(60000);

    test.beforeEach(async ({ customerPage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await customerPage.navigateTo();
    });

    test("it can create and login to account", async ({ customerPage, customerData, page }) => {
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#maincontent').getByRole('link', { name: locators.create_button })).toBeVisible();
        await page.locator('#maincontent').getByRole('link', { name: locators.create_button }).click();
        await page.waitForLoadState('domcontentloaded');
        await customerPage.fillCreateForm(customerData);
        await page.getByRole('button', { name: locators.create_button }).click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForSelector(pageLocators.message_success);
        await customerPage.logout();
        await customerPage.login(customerData);
    });

});
