import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@admin/locators/orders.locator";
import {CustomerData} from '@common/interfaces/CustomerData';
import * as CustomerFormLocators from "../locators/orderCustomerForm.locator";
import { loadJsonData } from "@utils/functions/file";

// Load the orders data using the utility function
const data = loadJsonData('orders.data.json', 'admin', {"default": {}});
export default class AdminOrdersPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    /**
     * Wait for the admin grid loading spinner to disappear
     */
    private async waitForGridSpinner() {
        const gridSpinner = this.page.locator('.admin__data-grid-loading-mask');
        try {
            // Check if spinner is visible, if so wait for it to disappear
            const isSpinnerVisible = await gridSpinner.isVisible();
            if (isSpinnerVisible) {
                await gridSpinner.waitFor({state: 'hidden', timeout: 30000});
            }
        } catch (e) {
            // Spinner may not be present - continue
        }
    }

    async navigateTo() {
        // get the orders url from admin dashboard (need the key value)
        const orderListItem = this.page.locator(locators.orders_list_item);
        const orderLink = orderListItem.locator('a');
        const hrefValue = await orderLink.getAttribute('href');

        await test.step(
            this.workerInfo.project.name + ": Go to " + hrefValue,
            async () => await this.page.goto(hrefValue)
        );
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");

        // Wait for grid spinner to disappear before interacting
        await this.waitForGridSpinner();

        await this.page.waitForSelector(locators.adminOrdersGrid + ' >> tr');

        // sometimes we have filters left over from prior sessions, so clear them
        const isVisible = await this.page.isVisible(locators.remove_filter_button);
        if (isVisible) {
            await this.page.click(locators.remove_filter_button);
            await this.waitForGridSpinner();
        }
    }

    async checkIfOrderExistsByIncrementId(incrementId: string) {
        await test.step(
            this.workerInfo.project.name + ": Check if order exists by increment id ",
            async () => {
                // Wait for page to fully load
                await this.page.waitForLoadState("networkidle");
                await this.page.waitForTimeout(2000);

                // Wait for any existing spinner to disappear first
                await this.waitForGridSpinner();

                const isVisible = await this.page.isVisible(locators.remove_filter_button);
                if (isVisible) {
                    await this.page.click(locators.remove_filter_button, { force: true });
                    await this.waitForGridSpinner();
                    await this.page.waitForLoadState("networkidle");
                    await this.page.waitForTimeout(1000);
                }

                // Wait for filter button to be visible and clickable
                await this.page.locator(locators.filter_button_expand).first().waitFor({state: 'visible', timeout: 30000});
                await this.waitForGridSpinner();
                await this.page.waitForTimeout(500);

                // Use force click to bypass any overlay issues
                await this.page.locator(locators.filter_button_expand).first().click({ force: true });

                // Wait for filter panel to expand
                await this.page.waitForTimeout(1000);

                await this.page.locator(locators.filter_increment_id).first().waitFor({state: 'visible'});
                await this.page.locator(locators.filter_increment_id).first().fill(incrementId);

                // Click apply and wait for grid to update
                await this.page.click(locators.filter_apply);

                // Wait for grid loading spinner to appear and disappear
                await this.waitForGridSpinner();

                await this.page.waitForLoadState("networkidle");
                await this.page.waitForTimeout(1000); // Allow grid to fully update

                // Wait for grid to show filtered results with the specific order ID
                const firstRowIdCell = this.page.locator(".data-grid tbody tr").first().locator("td:nth-child(2) .data-grid-cell-content");
                await expect(firstRowIdCell).toHaveText(incrementId, {timeout: 15000});

                // Verify only one row matches - wait a bit more to ensure grid is stable
                await this.page.waitForTimeout(500);
                const rows = this.page.locator(".data-grid tbody tr");
                const rowCount = await rows.count();

                // If more than 1 row, the filter might not have applied correctly
                // This can happen if the order ID is a substring of other IDs
                expect(rowCount, `Expected 1 order with ID ${incrementId}, found ${rowCount}`).toBe(1);
            });
    }

    /**
     * Creates an order in admin and creates a new customer for that order.
     * note that faker will spew out random countries even when locale is set.
     * so country is not included below and should be handled in test for population to
     * desired value
     * @param customerData
     */
    async createNewOrderWithNewCustomer(customerData: CustomerData) {
        await this.page.locator(locators.create_new_order_button).waitFor({state: 'visible'});
        await this.page.click(locators.create_new_order_button);
        await this.page.waitForLoadState("domcontentloaded");
        await this.page.waitForLoadState("networkidle");

        await this.page.getByRole('button', {name: locators.create_new_customer_button}).click();
        await this.page.waitForLoadState("networkidle");

        await test.step(
            this.workerInfo.project.name + ": Create new order and creating a new customer ",
            async () => {
                // Wait for the form to be fully loaded
                await this.page.waitForSelector(CustomerFormLocators.email, { state: 'visible', timeout: 30000 });
                await this.page.waitForTimeout(1000); // Allow AJAX to complete

                // Fill email and verify it's filled
                await this.page.fill(CustomerFormLocators.email, customerData.email);
                await this.page.waitForTimeout(300);

                // Fill billing address fields
                await this.page.locator(CustomerFormLocators.billing_firstname).waitFor({ state: 'visible' });
                await this.page.fill(CustomerFormLocators.billing_firstname, customerData.firstName);
                await this.page.waitForTimeout(200);

                await this.page.fill(CustomerFormLocators.billing_lastname, customerData.lastName);
                await this.page.waitForTimeout(200);

                await this.page.fill(CustomerFormLocators.billing_street_address, customerData.street_one_line);
                await this.page.waitForTimeout(200);

                await this.page.fill(CustomerFormLocators.billing_city, customerData.city);
                await this.page.waitForTimeout(200);

                await this.page.locator(CustomerFormLocators.billing_zip).pressSequentially(customerData.zip);
                await this.page.waitForTimeout(200);

                await this.page.fill(CustomerFormLocators.billing_phone, customerData.phone);
                await this.page.waitForTimeout(200);

                // Select state and wait for AJAX (may trigger address validation)
                await this.page.selectOption(CustomerFormLocators.billing_state, customerData.state);
                await this.page.waitForTimeout(1000);
                await this.page.waitForLoadState("networkidle");
            });
    }

    /**
     * In admin order, add product and then find teh first simple product and add it to the order
     * This eliminates the need for a specific simple t be used, and bypasses need to configure complex product,
     * which will have own function to add and is more specific.
     *
     */
    async selectFirstSimpleProductToAddToOrder() {
        await test.step(
            this.workerInfo.project.name + ": Find and select first simple product to order ",
            async () => {
                await this.page.click(locators.order_add_products);
                await this.page.waitForSelector(locators.add_product_grid + ' tbody');
                const rows = await this.page.$$(locators.add_product_grid + ' tbody tr');
                expect(rows.length).toBeGreaterThan(0);
                for (const row of rows) {
                    const configureLink = await row.$('td:nth-child(2) a.action-configure');
                    if (configureLink) {
                        const isVisible = await configureLink.isVisible();
                        const isDisabled = await configureLink.isDisabled();
                        if (!isVisible || isDisabled) {
                            const checkbox = await row.$('td.col-select input[type="checkbox"]');
                            expect(checkbox).not.toBeNull();
                            // @ts-ignore
                            await checkbox.check();
                            await this.page.click(locators.add_product_to_order_button);
                            break;
                        }
                    }
                }
            });
    }

    /**
     * Select the first shipping method in order create, thus not needing a specifc shipping method,
     * if that is not the specific thing being tested.
     * Existence of shipping methods will have own specific tests
     */
    async selectFirstShippingMethodToAddToOrder() {
        await test.step(
            this.workerInfo.project.name + ": select first shipping method found ",
            async () => {
                //await this.page.locator(locators.order_get_shipping_methods).scrollIntoViewIfNeeded();
                await this.page.click(locators.order_get_shipping_methods);
                await this.page.check('input[name="order[shipping_method]"]');
            })

    }

    /**
     * Select teh first payment method in an order if payment is not what is being tested
     * Specific payment methods will have specific tests.
     */
    async selectFirstPaymentMethodToAddToOrder() {
        await test.step(
            this.workerInfo.project.name + ": Select first payment method found ",
            async () => {
                await this.page.locator('input[name="payment[method]"]').first().waitFor({state: 'visible'});
                await this.page.locator('input[name="payment[method]"]').first().check();
            });
    }

    async disableOrderEmailSend() {
        await test.step(
            this.workerInfo.project.name + ": Disable email sending ",
            async () => {
                const checkbox = await this.page.$(locators.send_email_confirmation);
                expect(checkbox).not.toBeNull();
                //@ts-ignore
                await this.page.evaluate(selector => {
                    const checkboxElement = document.querySelector(selector);
                    //@ts-ignore
                    if (checkboxElement && checkboxElement.checked) {
                        //@ts-ignore
                        checkboxElement.checked = false;
                        // Trigger change event if necessary
                        const event = new Event('change', {bubbles: true});
                        checkboxElement.dispatchEvent(event);
                    }
                }, locators.send_email_confirmation);
            });
    }

    async placeOrder() {
        // Wait for any AJAX spinners to complete before clicking
        await this.page.waitForTimeout(3000);

        // Find the Submit Order button
        const submitButton = this.page.locator('button:has-text("Submit Order")').first();
        await submitButton.waitFor({ state: 'visible', timeout: 30000 });

        // Scroll into view and focus first to ensure the button is ready
        await submitButton.scrollIntoViewIfNeeded();
        await submitButton.focus();
        await this.page.waitForTimeout(1000);

        // Get current URL before clicking
        const currentUrl = this.page.url();

        // Click the button with force to bypass any overlay issues
        await submitButton.click({ force: true });

        // Wait for URL to change (order creation redirects to order view page)
        try {
            await this.page.waitForURL((url) => url.href !== currentUrl, { timeout: 90000 });
        } catch (e) {
            // URL may not change if there's an error, continue to check for success message
        }

        // Wait for the page to fully load
        await this.page.waitForLoadState("domcontentloaded");
        await this.page.waitForLoadState("networkidle");

        // Wait for success message with extended timeout (order creation can be slow)
        await this.page.locator(locators.admin_success_message).waitFor({state: 'visible', timeout: 60000});
        await expect(this.page.locator(locators.admin_success_message)).toContainText(locators.order_success_message);
    }

    async selectPaymentMethodByText(paymentText: string) {
        await test.step(
            this.workerInfo.project.name + ": select payment method:  " + paymentText,
            async () => {
                await this.page.getByText(paymentText).first().waitFor({state: 'visible'});
                await this.page.getByText(paymentText).first().check();
            });
    }

}
