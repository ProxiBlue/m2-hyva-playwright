import HomePage from "@hyva/pages/home.page";
import type { Page, TestInfo } from "@playwright/test";
import { test, expect } from "../fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "../locators/home.locator";
import * as pageLocators from "@hyva/locators/page.locator";
import * as searchSelectors from "@hyva/locators/search.locator";
import * as product from "@hyva/locators/product.locator";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {};
const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/home.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/home.data.json').then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import('../data/home.data.json').then((dynamicData) => {
        data = dynamicData;
    });
}
export default class PPSHomePage extends HomePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo); // pass the data and locators to teh base page class
    }

    async verifyHasCategoryList() {
        await actions.verifyElementExists(this.page, locators.category_grid, this.workerInfo);
    }

    async canSearchFromHomepage(isMobile: boolean) {
        if (isMobile) {
            await this.page.click(searchSelectors.headerSearchIcon);
            await this.page.waitForSelector(searchSelectors.headerSearchFieldMobile);
            await this.page.fill(searchSelectors.headerSearchFieldMobile, data.search_term, {force: true});
            await this.page.press(searchSelectors.headerSearchFieldMobile, 'Enter');
        } else {
            await this.page.waitForSelector(searchSelectors.headerSearchField);
            await this.page.fill(searchSelectors.headerSearchField, data.search_term);
            await this.page.press(searchSelectors.headerSearchField, 'Enter');
        }
        await this.page.waitForSelector(pageLocators.pageTitle);
        const mainHeadingText = await this.page.$eval(pageLocators.pageTitle, (el) => el.textContent);
        await expect(mainHeadingText).toContain(data.search_term);
        await actions.verifyElementIsVisible(this.page, product.productGrid, this.workerInfo);
        await expect.poll(async () => this.page.locator(product.productGridItem).count()).toBeGreaterThan(0);
    }

}
