import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as locators from "@admin/locators/products.locator";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {"default": {}};
// Load data synchronously to ensure it's available when needed
const fs = require("fs");
try {
    let dataPath;
    if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/products.data.json')) {
        dataPath = __dirname + '/../../' + process.env.APP_NAME + '/data/products.data.json';
    } else {
        dataPath = __dirname + '/../data/products.data.json';
    }
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(jsonData);
} catch (error) {
    console.error(`Error loading products data: ${error}`);
}
export default class AdminProductsPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    async navigateTo() {
        // @ts-ignore
        // get the products url from admin dashboard (need the key value)
        const productListItem = this.page.locator(locators.product_list_item);
        const productLink = productListItem.locator('a');
        const hrefValue = await productLink.getAttribute('href');
        // @ts-ignore
        await actions.navigateTo(this.page, hrefValue, this.workerInfo);
        await this.page.waitForLoadState("networkidle")
        await this.page.waitForLoadState("domcontentloaded")
        await this.page.waitForSelector(locators.adminProductGrid + ' >> tr')
        // sometimes we have filters let over from prior sessions, so clear them
        const isVisible = await this.page.isVisible(locators.remove_filter_button);
        if (isVisible) {
            await this.page.click(locators.remove_filter_button);
        }
    }

}
