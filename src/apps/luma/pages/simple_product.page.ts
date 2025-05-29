import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
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
        const titleText = await test.step(
            this.workerInfo.project.name + ": Get innertext from " + this.locators.title,
            async () => await this.page.innerText(this.locators.title)
        );
        const productName = data.default.name;
        await expect(titleText).toEqual(productName);
    }

    async verifyDomTitle() {
        const productName = data.default.name || "Default Product Name";
        await test.step(
            this.workerInfo.project.name + ": Verify page title is '" + productName + "'",
            async () => await expect(this.page).toHaveTitle(productName)
        );
    }

    async addToCart(qty : string = '1'): Promise<void> {
        await test.step(
            this.workerInfo.project.name + ": Add product to cart ",
            async () => {
                await test.step(
                    this.workerInfo.project.name + ": Enter text: " + qty,
                    async () => await this.page.fill(locators.product_qty_input, qty)
                );
                await test.step(
                    this.workerInfo.project.name + ": Click element " + locators.product_add_to_cart_button,
                    async () => await this.page.locator(locators.product_add_to_cart_button).click()
                );
                await this.page.waitForSelector('.message.success')
                await this.page.waitForLoadState('domcontentloaded');
                await test.step(
                    this.workerInfo.project.name + ": Verify element is visible " + pageLocators.message_success,
                    async () => expect(await this.page.locator(pageLocators.message_success).isVisible()).toBe(true)
                );
                const productName = data.default.name;
                expect(await this.page.locator(pageLocators.message_success).textContent()).toContain(productName);
            });
    }

    async getProductPrice() {
        return await test.step(
            this.workerInfo.project.name + ": Get product price ",
            async () => {
                const productPrice = await test.step(
                    this.workerInfo.project.name + ": Get innertext from " + locators.productItemPriceRegular,
                    async () => await this.page.innerText(locators.productItemPriceRegular)
                );
                return productPrice;
            });
    }

}
