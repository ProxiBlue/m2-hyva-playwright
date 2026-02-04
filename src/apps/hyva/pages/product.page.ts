import BasePage from "@common/pages/base.page";
import { Page, TestInfo, expect, test } from "@playwright/test";
import { ProductData } from "@hyva/interfaces/ProductData";
import { loadLocators } from "@utils/functions/file";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exists in APP path, and if not default to the base data
let data: ProductData = { default: {} };

// Load the locators dynamically based on the APP_NAME environment variable
const pageLocators = loadLocators('locators/page.locator', 'hyva');
const productLocators = loadLocators('locators/product.locator', 'hyva');
const cartLocators = loadLocators('locators/cart.locator', 'hyva');

export default class ProductPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo, public data: any, public locators: any) {
        super(page, workerInfo, data, locators);
    }

    /**
     * Helper method to trigger the compare functionality for a product
     * @param element The element handle for the compare button
     * @returns Promise<void>
     */
    async triggerCompareButton(element: any): Promise<void> {
        await this.page.evaluate((element) => {
            if (!element) {
                console.error('Compare button not found');
                return;
            }

            // Get the product ID from the passed element or its closest ancestor
            // First try to extract it from the click handler which is the most reliable on PDP pages
            let productId = null;
            const clickHandler = element.getAttribute('@click.prevent') || element.getAttribute('@click');
            if (clickHandler && clickHandler.includes('addToCompare')) {
                // Extract the product ID from the click handler
                // Example: addToCompare(1796) -> 1796
                const match = clickHandler.match(/addToCompare\((\d+)\)/);
                if (match && match[1]) {
                    productId = match[1];
                }
            }

            // If we couldn't extract from click handler, try other methods
            if (!productId) {
                productId = element.getAttribute('data-product-id') ||
                           element.closest('form')?.querySelector('input[name="product"]')?.value ||
                           element.closest('[data-product-id]')?.getAttribute('data-product-id');
            }

            if (!productId) {
                console.error('Product ID not found');
                return;
            }

            // Approach 2: Find the Alpine.js component by x-data attribute pattern
            // This is a fallback if the click handler approach doesn't work
            const xDataAttr = element.getAttribute('x-data');
            if (xDataAttr && (xDataAttr.includes('initCompare') || xDataAttr.includes('initCompareOnProductList') || xDataAttr.includes('initCompareOnProductView'))) {
                // Extract the function name from x-data attribute
                const functionName = xDataAttr.replace('()', '');

                // Try to call the function directly
                try {
                    const initFunction = window[functionName];
                    if (typeof initFunction === 'function') {
                        const instance = initFunction();
                        if (instance && typeof instance.addToCompare === 'function') {
                            // Use the product ID we extracted earlier
                            instance.addToCompare(parseInt(productId));
                            return;
                        }
                    }
                } catch (e) {
                    console.error('Error calling Alpine.js function:', e);
                }
            }

            // Fallback: Simple click as last resort
            element.click();
        }, element);
    }

    async verifyTitleAndImage() {
        await test.step(
            this.workerInfo.project.name + ": Verify product title and image",
            async () => {
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(productLocators.title);

                const title = await this.page.locator(productLocators.title).textContent();
                expect(title).toContain(this.data.default.name);
                const imgSrc = await this.page.locator(productLocators.product_gallery_image).first().getAttribute('src');
                expect(imgSrc).toContain('media/catalog/product');
            }
        );
    }

    async verifyPrice() {
        await test.step(
            this.workerInfo.project.name + ": Verify product price",
            async () => {
                await this.page.waitForSelector(productLocators.productItemPrice);

                const priceText: string = await this.page.locator(productLocators.productItemPrice).first().textContent() || '';
                const currencySymbol = process.env.currency_symbol || '$';
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
                await this.page.waitForSelector(productLocators.breadcrumbs_items);
                await this.page.waitForLoadState('domcontentloaded');
                const breadcrumbItems = await this.page.locator(productLocators.breadcrumbs_items).count();
                expect(breadcrumbItems).toBeGreaterThan(0);

                // Get the text of the last breadcrumb item and verify it contains the product name
                const lastBreadcrumbText = await this.page.locator(productLocators.breadcrumbs_items).nth(breadcrumbItems - 1).textContent();
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
                await this.page.evaluate((selector) => {
                    // Find the button element using the provided selector
                    const element = document.querySelector(selector);
                    if (!element) {
                        console.error('Wishlist button not found with selector: ' + selector);
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
                }, this.locators.wishlist_button);

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
                await this.page.evaluate((selectors) => {
                    // Find the button element
                    const element = document.querySelector(selectors.wishlist_button);
                    if (!element) {
                        console.error('Wishlist button not found');
                        return;
                    }

                    // Get the product ID from various possible sources
                    const productId = element.getAttribute('data-product-id') ||
                                     document.querySelector(selectors.product_id_input)?.value ||
                                     document.querySelector(selectors.product_sku_form)?.getAttribute('data-product-sku');

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
                }, productLocators);

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
                await this.page.locator(productLocators.product_qty_input_selector).press('ArrowUp');
                await this.page.waitForLoadState('domcontentloaded');
                const qtyValue = await this.page.locator(productLocators.product_qty_input_selector).inputValue();
                expect(qtyValue).toBe('2');

                // Add the item to the cart
                await this.addToCart('2');

                // Navigate to the cart page
                await this.page.goto(process.env.url + '/checkout/cart');
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
                await this.page.fill(productLocators.product_qty_input, qty);
                await this.page.locator(productLocators.product_add_to_cart_button).click();

                // Use a more robust approach for waiting for success message
                try {
                    await this.page.waitForSelector(pageLocators.message_success, { timeout: 10000 });
                } catch (error) {
                    // Check if page context is still valid before retrying
                    if (!this.page.isClosed()) {
                        await this.page.waitForTimeout(2000);
                        await this.page.waitForSelector(pageLocators.message_success, { timeout: 5000 });
                    } else {
                        throw new Error('Page context was closed during add to cart operation');
                    }
                }

                // Use a more robust approach for waiting after add to cart
                try {
                    await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
                } catch (error) {
                    // If waitForLoadState fails, wait a bit and continue
                    // This handles Firefox-specific timing issues
                    await this.page.waitForTimeout(1000);
                }

                expect(await this.page.locator(pageLocators.message_success).isVisible(), "Verify element is visible " + pageLocators.message_success).toBe(true);
                const productName = this.data.default.name;
                expect(await this.page.locator(pageLocators.message_success).textContent()).toContain(productName);
            });
    }

    /**
     * Add the current product to the compare list and verify it appears in the compare page
     */
    async addToCompare(): Promise<void> {
        await test.step(
            this.workerInfo.project.name + ": Add to compare ",
            async () => {
                // Get the product name for verification
                const productName = await this.page.locator(productLocators.title).textContent();

                // Find the add to compare button with a more specific selector
                // Use the product-info-main container to target only the button on the product page
                const addToCompareButton = this.page.getByRole('button', { name: 'Add to Compare', exact: true }).first();

                // Get the element handle for JavaScript evaluation
                const addToCompareElement = await addToCompareButton.elementHandle();

                // Use the helper method to trigger the compare functionality
                await this.triggerCompareButton(addToCompareElement);

                // Wait for the page to update
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');

                // Verify success message
                const successMessage = await this.page.locator(pageLocators.message_success);
                const successMessageText = await successMessage.textContent();
                expect(successMessageText).toContain(productName ? productName.trim() : "Product name not populated");

                // Close the success message
                await successMessage.getByLabel(pageLocators.messageClose).click({force: true});
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');

                // Verify the compare link shows "1"
                expect(await this.page.locator(productLocators.compareLink).textContent()).toContain("1");
                await expect(this.page.locator(productLocators.compareLink)).toBeVisible();

                // Click on the compare link to navigate to the compare page
                await this.page.locator(productLocators.compareLink).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');

                // Verify we're on the compare page
                await this.page.waitForSelector(pageLocators.comapre_page_title);
                expect(await this.page.locator(pageLocators.comapre_page_title).textContent()).toContain(this.data?.default?.compare_products_title || "Compare Products");

                // Verify the compare table is visible and contains the product
                await expect(this.page.locator(pageLocators.compare_table)).toBeVisible();
                const compareTableText = await this.page.locator(pageLocators.compare_table).textContent();
                expect(compareTableText).toContain(productName ? productName.trim() : "Product name not populated");
            });
    }



}
