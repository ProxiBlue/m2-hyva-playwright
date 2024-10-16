import BasePage from "./base.page";
import type {Page, TestInfo} from "@playwright/test";
import {expect} from "@hyva/fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/admin.locator";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {};
const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/admin.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/admin.data.json').then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import('../data/admin.data.json').then((dynamicData) => {
        data = dynamicData;
    });
}
export default class AdminPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    async navigateTo() {
        await actions.navigateTo(this.page, process.env.URL + data.url, this.workerInfo);
        const url = this.page.url();
    }

    async login() {
        await this.page.fill(locators.username, process.env.admin_user);
        await this.page.fill(locators.password, process.env.admin_password);
        await this.page.getByRole('button', { name: 'Sign in' }).click()
        await this.page.waitForSelector(locators.title)
        await actions.verifyElementIsVisible(this.page, locators.title, this.workerInfo);
        expect(await this.page.locator(locators.title).textContent()).toContain(data["page_title_text"]);
    }

    async logout() {
        await this.page.locator(".admin__action-dropdown-wrap").first().click();
        await this.page.locator(locators.logout_option).click({force: true});
        await this.page.waitForSelector(locators.username)
    }

}
