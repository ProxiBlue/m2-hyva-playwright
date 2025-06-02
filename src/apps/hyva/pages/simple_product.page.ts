import ProductPage from "@hyva/pages/product.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import { SimpleProductData } from "@hyva/interfaces/SimpleProductData";
import { loadJsonData, loadLocators } from "@utils/functions/file";

// Default simple product data structure
const defaultData: SimpleProductData = { default: {} };

// Load the simple product data using the utility function
let data = loadJsonData<SimpleProductData>('simple_product.data.json', 'hyva', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    //@ts-ignore
    data = { default: data };
}

// Load the locators dynamically based on the APP_NAME environment variable
const locators = loadLocators('locators/product.locator', 'hyva');

export default class SimpleProductPage extends ProductPage {

    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    async getProductPrice() {
        const productPrice = await test.step(
            this.workerInfo.project.name + ": Get innertext from " + locators.productItemPriceRegular,
            async () => await this.page.innerText(locators.productItemPriceRegular)
        );
        return productPrice;
    }

}
