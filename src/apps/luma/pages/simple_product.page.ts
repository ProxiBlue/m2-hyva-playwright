import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as locators from "@luma/locators/product.locator";
import * as pageLocators from "@luma/locators/page.locator";
import { loadJsonData } from "@utils/functions/file";

// Define the interface for the simple product data structure
interface SimpleProductData {
  default: {
    name?: string;
  };
}

// Default simple product data structure
const defaultData: SimpleProductData = { default: {} };

// Load the simple product data using the utility function
let data = loadJsonData<SimpleProductData>('simple_product.data.json', 'luma', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
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
