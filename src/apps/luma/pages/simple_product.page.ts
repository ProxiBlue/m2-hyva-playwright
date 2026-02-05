import BasePage from "@common/pages/base.page";
import { Page, TestInfo, expect, test } from "@playwright/test";
import { loadJsonData, loadLocators } from "@utils/functions/file";

// Define the interface for the simple product data structure
interface SimpleProductData {
    default: {
        url?: string;
        name?: string;
        sku?: string;
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

// Load locators dynamically
const locators = loadLocators('locators/product.locator', 'luma');
const pageLocators = loadLocators('locators/page.locator', 'luma');

export default class SimpleProductPage extends BasePage<SimpleProductData> {

    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    async verifyPageTitle() {
        const titleText = await this.page.innerText(this.locators.title);
        const productName = data.default.name;
        expect(titleText).toEqual(productName);
    }

    async verifyDomTitle() {
        const productName = data.default.name || "Default Product Name";
        await expect(this.page).toHaveTitle(productName);
    }

    async addToCart(qty: string = '1'): Promise<void> {
        await test.step(
            this.workerInfo.project.name + ": Add product to cart ",
            async () => {
                await this.page.fill(locators.product_qty_input, qty);
                await this.page.locator(locators.product_add_to_cart_button).click();
                await this.page.waitForSelector(pageLocators.message_success);
                await this.page.waitForLoadState('domcontentloaded');
                expect(await this.page.locator(pageLocators.message_success).isVisible()).toBe(true);
                const productName = data.default.name;
                const messageText = await this.page.locator(pageLocators.message_success).textContent();
                expect(messageText).toContain(productName);
            });
    }

    async getProductPrice() {
        return await this.page.innerText(locators.productItemPriceRegular);
    }
}
