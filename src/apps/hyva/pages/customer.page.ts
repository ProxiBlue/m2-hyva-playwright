import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@hyva/locators/customer.locator";
import * as pageLocators from "@hyva/locators/page.locator";
import { CustomerData } from '@common/interfaces/CustomerData';

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {};

const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/customer.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/customer.data.json', { assert: { type: "json" } }).then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import(__dirname + '/../data/customer.data.json', { assert: { type: "json" } }).then((dynamicData) => {
        data = dynamicData;
    });
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
                // @ts-ignore
                await expect(this.page.locator(pageLocators.pageTitle)).toContainText(data.default.my_account_title);
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
