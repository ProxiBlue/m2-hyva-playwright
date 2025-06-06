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

    async navigateTo() {
        // get the orders url from admin dashboard (need the key value)
        const orderListItem = this.page.locator(locators.orders_list_item);
        const orderLink = orderListItem.locator('a');
        const hrefValue = await orderLink.getAttribute('href');

        await test.step(
            this.workerInfo.project.name + ": Go to " + hrefValue,
            async () => await this.page.goto(hrefValue)
        );
        await this.page.waitForLoadState("networkidle")
        await this.page.waitForLoadState("domcontentloaded")
        await this.page.waitForSelector(locators.adminOrdersGrid + ' >> tr')
        // sometimes we have filters let over from prior sessions, so clear them
        const isVisible = await this.page.isVisible(locators.remove_filter_button);
        if (isVisible) {
            await this.page.click(locators.remove_filter_button);
        }
    }

    async checkIfOrderExistsByIncrementId(incrementId: string) {
        await test.step(
            this.workerInfo.project.name + ": Check if order exists by increment id ",
            async () => {
                const isVisible = await this.page.isVisible(locators.remove_filter_button);
                if (isVisible) {
                    await this.page.click(locators.remove_filter_button);
                }
                await this.page.locator(locators.filter_button_expand).first().waitFor({state: 'visible'});
                await this.page.locator(locators.filter_button_expand).first().click();
                await this.page.locator(locators.filter_increment_id).first().waitFor({state: 'visible'});
                await this.page.locator(locators.filter_increment_id).first().fill(incrementId);
                await this.page.click(locators.filter_apply);
                await this.page.waitForLoadState("networkidle")
                await this.page.waitForLoadState("domcontentloaded")
                const rows = this.page.locator(".data-grid tbody tr");
                const rowCount = await rows.count();
                expect(rowCount).toBe(1);
                const idCell = rows.nth(0).locator("td:nth-child(2) .data-grid-cell-content");
                const idText = await idCell.textContent();
                expect(idText?.trim()).toBe(incrementId);
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
        await this.page.waitForLoadState("domcontentloaded")
        await this.page.getByRole('button', {name: locators.create_new_customer_button}).click();
        await test.step(
            this.workerInfo.project.name + ": Create new order and creating a new customer ",
            async () => {
                await this.page.waitForSelector(CustomerFormLocators.email);
                await this.page.fill(CustomerFormLocators.email, customerData.email);
                await this.page.fill(CustomerFormLocators.billing_firstname, customerData.firstName);
                await this.page.fill(CustomerFormLocators.billing_lastname, customerData.lastName);
                await this.page.fill(CustomerFormLocators.billing_street_address, customerData.street_one_line);
                await this.page.fill(CustomerFormLocators.billing_city, customerData.city);
                await this.page.locator(CustomerFormLocators.billing_zip).pressSequentially(customerData.zip);
                await this.page.fill(CustomerFormLocators.billing_phone, customerData.phone);
                await this.page.selectOption(CustomerFormLocators.billing_state, customerData.state);
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
        // fix issue with Purchase Order failing. Seems to focus first works
        await this.page.getByRole('group', {name: 'Order Totals'}).getByRole('button').focus();
        await this.page.getByRole('group', {name: 'Order Totals'}).getByRole('button').click();
        await this.page.waitForLoadState("domcontentloaded")
        await this.page.waitForLoadState("networkidle")
        await this.page.locator(locators.admin_success_message).waitFor({state: 'visible'});
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
