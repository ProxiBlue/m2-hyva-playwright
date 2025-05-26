import ProductPage from "@hyva/pages/product.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/product.locator";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data: { default: { name?: string } } = { default: {} };
// Load data synchronously to ensure it's available when needed
const fs = require("fs");
try {
    let dataPath;
    if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/simple_product.data.json')) {
        dataPath = __dirname + '/../../' + process.env.APP_NAME + '/data/simple_product.data.json';
    } else {
        dataPath = __dirname + '/../data/simple_product.data.json';
    }
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(jsonData);
    // Ensure data has a default property
    if (!data.default) {
        //@ts-ignore
        data = { default: data };
    }
} catch (error) {
    // Error loading simple product data
}

export default class SimpleProductPage extends ProductPage {

    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    async getProductPrice() {
        const productPrice = await actions.getInnerText(this.page, locators.productItemPriceRegular, this.workerInfo);
        return productPrice;
    }

}
