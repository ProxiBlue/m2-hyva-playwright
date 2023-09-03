import BasePage from "./base.page";
import type { Page, TestInfo } from "@playwright/test";
import { test, expect } from "../fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "../locators/home.locator";

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
export default class HomePage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    async navigateTo() {
        await actions.navigateTo(this.page, process.env.URL, this.workerInfo);
        const url = this.page.url();

        await test.step(
            this.workerInfo.project.name +
            ": Check if URL contains " +
            data.urlContains,
            async () => expect(url).toContain(data.urlContains)
        );
    }

    async verifyHasCategoryList() {
        await actions.verifyElementExists(this.page, locators.category_grid, this.workerInfo);
    }

}
