import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as locators from "@admin/locators/products.locator";
import { loadJsonData } from "@utils/functions/file";

// Load the products data using the utility function
const data = loadJsonData('products.data.json', 'admin', {"default": {}});
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
