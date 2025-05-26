import BasePage from "@common/pages/base.page";
import { Page, TestInfo, expect, test } from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/product.locator";
import * as pageLocators from "@hyva/locators/page.locator";
import * as productLocators from "@hyva/locators/product.locator";
import * as cartLocators from "@hyva/locators/cart.locator";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exists in APP path, and if not default to the base data
let data: { default: {
    url?: string;
    name?: string; } } = { default: {} };

export default class ProductPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo, public data: any, public locators: any) {
        super(page, workerInfo, data, locators);
    }

    async verifyTitleAndImage() {
        await test.step(
            this.workerInfo.project.name + ": Verify product title and image",
            async () => {
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(locators.title);

                const title = await this.page.locator(locators.title).textContent();
                expect(title).toContain(this.data.default.name);
                const imgSrc = await this.page.locator(locators.product_gallery_image).first().getAttribute('src');
                expect(imgSrc).toContain('media/catalog/product');
            }
        );
    }

    async verifyPrice() {
        await test.step(
            this.workerInfo.project.name + ": Verify product price",
            async () => {
                await this.page.waitForSelector(locators.productItemPrice);

                const priceText: string = await this.page.locator(locators.productItemPrice).textContent() || '';
                expect(priceText).toContain('$');

                const priceRegexp = /\$\d+\.\d{2}/;
                expect(priceRegexp.test(priceText)).toBeTruthy();
            }
        );
    }

    async verifyBreadcrumbs() {
        await test.step(
            this.workerInfo.project.name + ": Verify breadcrumbs",
            async () => {
                await this.page.waitForSelector(locators.breadcrumbs_items);
                await this.page.waitForLoadState('domcontentloaded');
                const breadcrumbItems = await this.page.locator(locators.breadcrumbs_items).count();
                expect(breadcrumbItems).toBeGreaterThan(0);

                // Get the text of the last breadcrumb item and verify it contains the product name
                const lastBreadcrumbText = await this.page.locator(locators.breadcrumbs_items).nth(breadcrumbItems - 1).textContent();
                expect(lastBreadcrumbText).toContain(this.data.default.name);
            }
        );
    }

    async addToWishlistNotLoggedIn() {
        await test.step(
            this.workerInfo.project.name + ": Add to wishlist when not logged in",
            async () => {
                await this.page.locator(this.locators.wishlist_button).click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(pageLocators.message_error, { timeout: 7000 });
                const errorMessage = await this.page.locator(pageLocators.message_error).textContent();
                expect(errorMessage).toContain('You must login or register to save items for later');
            }
        );
    }

    async addToWishlistLoggedIn() {
        await test.step(
            this.workerInfo.project.name + ": Add to wishlist logged in",
            async () => {
                await this.page.click(productLocators.wishlist_button);
                // Wait for success message
                await this.page.waitForSelector(pageLocators.message_success, { timeout: 7000 });
                const successMessage = await this.page.locator(pageLocators.message_success).textContent();
                expect(successMessage).toContain('has been added to your Wish List');
            }
        );
    }

    async incrementProductQuantity() {
        await test.step(
            this.workerInfo.project.name + ": Increment product quantity",
            async () => {
                await this.page.locator(locators.product_qty_input_selector).press('ArrowUp');
                await this.page.waitForLoadState('domcontentloaded');
                const qtyValue = await this.page.locator(locators.product_qty_input_selector).inputValue();
                expect(qtyValue).toBe('2');

                // Add the item to the cart
                await this.addToCart('2');

                // Navigate to the cart page
                await this.page.goto(process.env.URL + '/checkout/cart');
                await this.page.waitForLoadState('domcontentloaded');

                // Verify the cart quantity is also 2
                const cartItemRow = 0; // First item in the cart
                const cartQtyInput = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + cartItemRow + '>>' + cartLocators.cart_row_item_info + '>>' + cartLocators.cart_row_qty_input;
                const cartQtyValue = await this.page.locator(cartQtyInput).inputValue();
                expect(cartQtyValue).toBe('2');
            }
        );
    }

    async addToCart(qty: string = '1'): Promise<void> {
        await test.step(
            this.workerInfo.project.name + ": Add product to cart ",
            async () => {
                await actions.fill(this.page, locators.product_qty_input, qty, this.workerInfo);
                await actions.clickElement(this.page, locators.product_add_to_cart_button, this.workerInfo);
                await this.page.waitForSelector(pageLocators.message_success)
                await this.page.waitForLoadState('domcontentloaded');
                await actions.verifyElementIsVisible(this.page, pageLocators.message_success, this.workerInfo);
                const productName = this.data.default.name;
                expect(await this.page.locator(pageLocators.message_success).textContent()).toContain(productName);
            });
    }



}
