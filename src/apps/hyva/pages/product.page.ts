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

                const priceText: string = await this.page.locator(locators.productItemPrice).first().textContent() || '';
                const currencySymbol = this.data.default.currency_symbol || '$';
                expect(priceText).toContain(currencySymbol);

                const priceRegexp = new RegExp(currencySymbol.replace('$', '\\$') + '\\d+\\.\\d{2}');
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
                // Get the wishlist button element
                const wishlistButton = this.page.locator(this.locators.wishlist_button);

                // Use JavaScript evaluation with multiple approaches to trigger the wishlist functionality
                await this.page.evaluate(() => {
                    // Find the button element
                    const element = document.querySelector('.product-info-main [aria-label="Add to Wish List"]');
                    if (!element) {
                        console.error('Wishlist button not found');
                        return;
                    }

                    // Get the product ID from various possible sources
                    const productId = element.getAttribute('data-product-id') ||
                                     document.querySelector('input[name="product"]')?.value ||
                                     document.querySelector('form[data-product-sku]')?.getAttribute('data-product-sku');

                    if (!productId) {
                        console.error('Product ID not found');
                        return;
                    }

                    // Try multiple approaches to trigger the wishlist functionality

                    // Approach 1: Find the Alpine.js component by x-data attribute pattern
                    const xDataAttr = element.getAttribute('x-data');
                    if (xDataAttr && xDataAttr.includes('initWishlist_')) {
                        // Extract the function name from x-data attribute
                        const functionName = xDataAttr.replace('()', '');

                        // Try to call the function directly
                        try {
                            const initFunction = window[functionName];
                            if (typeof initFunction === 'function') {
                                const instance = initFunction();
                                if (instance && typeof instance.addToWishlist === 'function') {
                                    instance.addToWishlist(parseInt(productId));
                                    return;
                                }
                            }
                        } catch (e) {
                            console.error('Error calling Alpine.js function:', e);
                        }
                    }

                    // Approach 2: Try to access Alpine.js data directly
                    if (typeof Alpine !== 'undefined') {
                        try {
                            const alpineInstance = Alpine.$data(element);
                            if (alpineInstance && typeof alpineInstance.addToWishlist === 'function') {
                                alpineInstance.addToWishlist(parseInt(productId));
                                return;
                            }
                        } catch (e) {
                            console.error('Error accessing Alpine.js data:', e);
                        }
                    }

                    // Approach 3: Try to extract and call the function from the click handler
                    const clickHandler = element.getAttribute('@click.prevent') || element.getAttribute('@click');
                    if (clickHandler && clickHandler.includes('addToWishlist')) {
                        try {
                            // Extract the function call from the click handler
                            const functionCall = clickHandler.trim();
                            // Execute the function call directly
                            eval(functionCall);
                            return;
                        } catch (e) {
                            console.error('Error executing click handler function:', e);
                        }
                    }

                    // Approach 4: Fallback to direct click with various event types
                    try {
                        // Try multiple event types to ensure the click is registered
                        ['click', 'mousedown', 'mouseup'].forEach(eventType => {
                            element.dispatchEvent(new MouseEvent(eventType, {
                                bubbles: true,
                                cancelable: true,
                                view: window
                            }));
                        });

                        // Also try to trigger the Alpine.js @click.prevent handler directly
                        if (typeof Alpine !== 'undefined') {
                            Alpine.deferMutations();
                            element.click();
                            Alpine.flushMutations();
                        }
                    } catch (e) {
                        console.error('Error dispatching click event:', e);
                    }
                });

                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(pageLocators.message_error, { timeout: 7000 });
                const errorMessage = await this.page.locator(pageLocators.message_error).textContent();
                expect(errorMessage).toContain(this.data.default.wishlist_error);
            }
        );
    }

    async addToWishlistLoggedIn() {
        await test.step(
            this.workerInfo.project.name + ": Add to wishlist logged in",
            async () => {
                // Use JavaScript evaluation with multiple approaches to trigger the wishlist functionality
                await this.page.evaluate(() => {
                    // Find the button element
                    const element = document.querySelector('.product-info-main [aria-label="Add to Wish List"]');
                    if (!element) {
                        console.error('Wishlist button not found');
                        return;
                    }

                    // Get the product ID from various possible sources
                    const productId = element.getAttribute('data-product-id') ||
                                     document.querySelector('input[name="product"]')?.value ||
                                     document.querySelector('form[data-product-sku]')?.getAttribute('data-product-sku');

                    if (!productId) {
                        console.error('Product ID not found');
                        return;
                    }

                    // Try multiple approaches to trigger the wishlist functionality

                    // Approach 1: Find the Alpine.js component by x-data attribute pattern
                    const xDataAttr = element.getAttribute('x-data');
                    if (xDataAttr && xDataAttr.includes('initWishlist_')) {
                        // Extract the function name from x-data attribute
                        const functionName = xDataAttr.replace('()', '');

                        // Try to call the function directly
                        try {
                            const initFunction = window[functionName];
                            if (typeof initFunction === 'function') {
                                const instance = initFunction();
                                if (instance && typeof instance.addToWishlist === 'function') {
                                    instance.addToWishlist(parseInt(productId));
                                    return;
                                }
                            }
                        } catch (e) {
                            console.error('Error calling Alpine.js function:', e);
                        }
                    }

                    // Approach 2: Try to access Alpine.js data directly
                    if (typeof Alpine !== 'undefined') {
                        try {
                            const alpineInstance = Alpine.$data(element);
                            if (alpineInstance && typeof alpineInstance.addToWishlist === 'function') {
                                alpineInstance.addToWishlist(parseInt(productId));
                                return;
                            }
                        } catch (e) {
                            console.error('Error accessing Alpine.js data:', e);
                        }
                    }

                    // Approach 3: Try to extract and call the function from the click handler
                    const clickHandler = element.getAttribute('@click.prevent') || element.getAttribute('@click');
                    if (clickHandler && clickHandler.includes('addToWishlist')) {
                        try {
                            // Extract the function call from the click handler
                            const functionCall = clickHandler.trim();
                            // Execute the function call directly
                            eval(functionCall);
                            return;
                        } catch (e) {
                            console.error('Error executing click handler function:', e);
                        }
                    }

                    // Approach 4: Fallback to direct click with various event types
                    try {
                        // Try multiple event types to ensure the click is registered
                        ['click', 'mousedown', 'mouseup'].forEach(eventType => {
                            element.dispatchEvent(new MouseEvent(eventType, {
                                bubbles: true,
                                cancelable: true,
                                view: window
                            }));
                        });

                        // Also try to trigger the Alpine.js @click.prevent handler directly
                        if (typeof Alpine !== 'undefined') {
                            Alpine.deferMutations();
                            element.click();
                            Alpine.flushMutations();
                        }
                    } catch (e) {
                        console.error('Error dispatching click event:', e);
                    }
                });

                // Wait for success message
                await this.page.waitForSelector(pageLocators.message_success, { timeout: 7000 });
                const successMessage = await this.page.locator(pageLocators.message_success).textContent();
                expect(successMessage).toContain(this.data.default.wishlist_success);
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
