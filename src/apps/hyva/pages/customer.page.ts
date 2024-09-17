import BasePage from "./base.page";
import type {Page, TestInfo} from "@playwright/test";
import {expect} from "@hyva/fixtures";
import * as locators from "@hyva/locators/customer.locator";
import * as pageLocators from "@hyva/locators/page.locator";


// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {};

const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/customer.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/customer.data.json').then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import('../data/customer.data.json').then((dynamicData) => {
        data = dynamicData;
    });
}

export default class CustomerPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    async createAccount(firstName:string, lastName: string, email: string, password: string) {
        await this.navigateTo();
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.getByRole('link', { name: locators.create_button })).toBeVisible();
        await this.page.getByRole('link', { name: locators.create_button }).click();
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.locator(locators.create_firstname)).toBeVisible();
        await expect(this.page.locator(locators.create_lastname)).toBeVisible();
        await expect(this.page.locator(locators.create_email)).toBeVisible();
        await expect(this.page.locator(locators.create_password)).toBeVisible();
        await expect(this.page.locator(locators.create_password_confirm)).toBeVisible();
        await this.page.locator(locators.create_firstname).fill(firstName);
        await this.page.locator(locators.create_lastname).fill(lastName);
        await this.page.locator(locators.create_email).fill(email);
        await this.page.locator(locators.create_password).fill(password);
        await this.page.locator(locators.create_password_confirm).fill(password);
        await this.page.getByRole('button', { name: locators.create_button }).click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForSelector(pageLocators.message_success);
    }

    async login(firstName:string, lastName: string, email: string, password: string ) {
        await this.navigateTo();
        await expect(this.page.getByRole('button', { name: locators.login_button })).toBeVisible();
        await expect(this.page.locator(locators.login_email_field)).toBeVisible();
        await expect(this.page.locator(locators.login_password_field)).toBeVisible();
        await this.page.locator(locators.login_email_field).fill(email);
        await this.page.locator(locators.login_password_field).fill(password);
        await this.page.getByRole('button', { name: locators.login_button }).click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
        await expect(this.page.locator(pageLocators.pageTitle)).toBeVisible();
        await expect(this.page.locator(pageLocators.pageTitle)).toContainText(data.my_account_title);
    }


    async logout() {
        await this.page.waitForTimeout(2000);
        await this.page.getByRole('link', { name: locators.logout_link }).click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(6000);
        //await expect(this.page.locator(pageLocators.pageTitle)).toContainText(data.logged_out);
    }

}
