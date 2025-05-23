import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as locators from "@luma/locators/product.locator";
import * as pageLocators from "@luma/locators/page.locator";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data: { default: { name?: string } } = { default: {} };
const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/simple_product.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/simple_product.data.json', { assert: { type: "json" } }).then((dynamicData) => {
        // Ensure data has a default property
        if (!dynamicData.default) {
            data = { default: dynamicData };
        } else {
            data = dynamicData;
        }
    });
} else {
    import(__dirname + '/../data/simple_product.data.json', { assert: { type: "json" } }).then((dynamicData) => {
        // Ensure data has a default property
        if (!dynamicData.default) {
            data = { default: dynamicData };
        } else {
            data = dynamicData;
        }
    });
}

export default class SimpleProductPage extends BasePage {

    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    async verifyPageTitle() {
        const titleText = await actions.getInnerText(
            this.page,
            this.locators.title,
            this.workerInfo
        );
        const productName = data.default.name;
        await expect(titleText).toEqual(productName);
    }

    async verifyDomTitle() {
        const productName = data.default.name || "Default Product Name";
        await actions.verifyPageTitle(this.page, productName, this.workerInfo);
    }

    async addToCart(qty : string = '1'): Promise<void> {
        await test.step(
            this.workerInfo.project.name + ": Add product to cart ",
            async () => {
                await actions.fill(this.page, locators.product_qty_input, qty, this.workerInfo);
                await actions.clickElement(this.page, locators.product_add_to_cart_button, this.workerInfo);
                await this.page.waitForSelector('.message.success')
                await this.page.waitForLoadState('domcontentloaded');
                await actions.verifyElementIsVisible(this.page, pageLocators.message_success, this.workerInfo);
                const productName = data.default.name;
                expect(await this.page.locator(pageLocators.message_success).textContent()).toContain(productName);
            });
    }

    async getProductPrice() {
        await test.step(
            this.workerInfo.project.name + ": Get product price ",
            async () => {
                const productPrice = await actions.getInnerText(this.page, locators.productItemPriceRegular, this.workerInfo);
                return productPrice;
            });
    }

}
