import {describe, expect, test} from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

// Load the locators dynamically based on the APP_NAME environment variable
const locators = loadLocators('locators/customer.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');
describe("Customer Tests", () => {

    test.setTimeout(60000);

    test.beforeEach(async ({customerPage}, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await customerPage.navigateTo();
    });

    test("it can create and login to account", async ({customerPage, customerData, page}, testInfo) => {
        await page.waitForLoadState('domcontentloaded');
        await expect(page.getByRole('link', {name: locators.create_button})).toBeVisible();
        await page.getByRole('link', {name: locators.create_button}).click();
        await customerPage.fillCreateForm(customerData);
        await page.waitForLoadState('domcontentloaded');
        await page.getByRole('button', {name: locators.create_button}).click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForSelector(pageLocators.message_success);
        await customerPage.logout();
        await customerPage.login(customerData);
    });
});
