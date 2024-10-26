import {describe, expect, test} from "@luma/fixtures";
import * as locators from "@luma/locators/customer.locator";
import * as pageLocators from "@luma/locators/page.locator";
describe("Customer Tests", () => {

    test.setTimeout(60000);

    test.beforeEach(async ({customerPage}, testInfo) => {
        //@ts-ignore
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await customerPage.navigateTo();
    });

    test("it can create and login to account", async ({customerPage, customerData, page}, testInfo) => {
        await expect(page.locator('#maincontent').getByRole('link', {name: locators.create_button})).toBeVisible();
        await page.locator('#maincontent').getByRole('link', {name: locators.create_button}).click();
        await page.waitForLoadState('domcontentloaded');
        await customerPage.fillCreateForm(customerData);
        await page.getByRole('button', {name: locators.create_button}).click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForSelector(pageLocators.message_success);
        await customerPage.logout();
        await customerPage.login(customerData);
    });
});


