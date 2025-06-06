import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@luma/locators/customer.locator";
import * as pageLocators from "@luma/locators/page.locator";
import { CustomerData } from '@common/interfaces/CustomerData';
import { loadJsonData } from "@utils/functions/file";

// Define the interface for the customer data structure
interface LumaCustomerData {
  default: {
    my_account_title?: string;
  };
}

// Default customer data structure
const defaultData: LumaCustomerData = { default: {} };

// Load the customer data using the utility function
let data = loadJsonData<LumaCustomerData>('customer.data.json', 'luma', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
}

export default class CustomerPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    async fillCreateForm(customerData: CustomerData) {
        await expect(this.page.locator(locators.create_firstname)).toBeVisible();
        await expect(this.page.locator(locators.create_lastname)).toBeVisible();
        await expect(this.page.locator(locators.create_email)).toBeVisible();
        await expect(this.page.locator(locators.create_password)).toBeVisible();
        await expect(this.page.locator(locators.create_password_confirm)).toBeVisible();
        await this.page.locator(locators.create_firstname).fill(customerData.firstName);
        await this.page.locator(locators.create_lastname).fill(customerData.lastName);
        await this.page.locator(locators.create_email).fill(customerData.email);
        await this.page.locator(locators.create_password).fill(customerData.password);
        await this.page.locator(locators.create_password_confirm).fill(customerData.password);
    }

    async login(customerData : CustomerData) {
        await test.step(
            this.workerInfo.project.name + ": Customer Login ",
            async () => {
                await this.navigateTo();
                await expect(this.page.getByRole('button', {name: locators.login_button})).toBeVisible();
                await expect(this.page.locator(locators.login_email_field)).toBeVisible();
                await expect(this.page.locator(locators.login_password_field)).toBeVisible();
                await this.page.locator(locators.login_email_field).fill(customerData.email);
                await this.page.locator(locators.login_password_field).fill(customerData.password);
                await this.page.getByRole('button', {name: locators.login_button}).click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForLoadState('networkidle');
                await expect(this.page.locator(pageLocators.pageTitle)).toBeVisible();
                const myAccountTitle = data.default.my_account_title || '';
                await expect(this.page.locator(pageLocators.pageTitle)).toContainText(myAccountTitle);
            });
    }


    async logout() {
        await test.step(
            this.workerInfo.project.name + ": Customer Logout ",
            async () => {
                await this.page.waitForTimeout(2000);
                await this.page.locator('.customer-welcome .action.switch').first().click();
                await this.page.getByRole('link', {name: locators.logout_link}).click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForTimeout(6000);
            });
    }

}
