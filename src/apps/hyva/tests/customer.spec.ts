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

    test("Registration trims leading/trailing spaces from name fields", async ({customerPage, customerData, page}) => {
        const spacedFirst = "  " + customerData.firstName + "  ";
        const spacedLast = "  " + customerData.lastName + "  ";

        await page.waitForLoadState('domcontentloaded');
        await expect(page.getByRole('link', {name: locators.create_button})).toBeVisible();
        await page.getByRole('link', {name: locators.create_button}).click();
        await page.waitForLoadState('domcontentloaded');

        // Fill form with leading/trailing spaces on name fields
        await expect(page.locator(locators.create_firstname)).toBeVisible();
        await page.locator(locators.create_firstname).fill(spacedFirst);
        await page.locator(locators.create_lastname).fill(spacedLast);
        await page.locator(locators.create_email).fill(customerData.email);
        await page.locator(locators.create_password).fill(customerData.password);
        await page.locator(locators.create_password_confirm).fill(customerData.password);

        await page.getByRole('button', {name: locators.create_button}).click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForSelector(pageLocators.message_success, {timeout: 15000});

        // Navigate to account edit to verify saved values
        await page.goto(process.env.url + 'customer/account/edit/');
        await page.waitForLoadState('domcontentloaded');

        const savedFirstName = await page.locator(locators.create_firstname).inputValue();
        expect(savedFirstName, 'First name should not have leading spaces').not.toMatch(/^\s/);
        expect(savedFirstName, 'First name should not have trailing spaces').not.toMatch(/\s$/);
        expect(savedFirstName).toBe(customerData.firstName);

        const savedLastName = await page.locator(locators.create_lastname).inputValue();
        expect(savedLastName, 'Last name should not have leading spaces').not.toMatch(/^\s/);
        expect(savedLastName, 'Last name should not have trailing spaces').not.toMatch(/\s$/);
        expect(savedLastName).toBe(customerData.lastName);
    });
});
