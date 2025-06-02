import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import { CustomerData } from '@common/interfaces/CustomerData';
import { loadJsonData, loadLocators } from "@utils/functions/file";

// Define the interface for the customer page data structure
interface CustomerPageData {
  default: {
    url?: string;
    header_title?: string;
    page_title_text?: string;
    create_an_account_title?: string;
    register_success_message?: string;
    my_account_title?: string;
    logged_out?: string;
  };
}

// Default customer page data structure
const defaultData: CustomerPageData = {
  default: {
    url: "",
    header_title: "",
    page_title_text: "",
    create_an_account_title: "",
    register_success_message: "",
    my_account_title: "",
    logged_out: ""
  }
};

// Load the customer data using the utility function
let data = loadJsonData<CustomerPageData>('customer.data.json', 'hyva', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
}

// Load the locators dynamically based on the APP_NAME environment variable
const locators = loadLocators('locators/customer.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');

export default class CustomerPage extends BasePage<CustomerPageData> {
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
                await this.page.getByRole('link', {name: locators.logout_link}).click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForTimeout(6000);
                //await expect(this.page.locator(pageLocators.pageTitle)).toContainText(data.default.logged_out);
            });
    }

}
