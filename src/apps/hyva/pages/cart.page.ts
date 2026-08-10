import BasePage from "@common/pages/base.page";
import {Page, TestInfo, test} from "@playwright/test";
import { expect } from "../../../../playwright.config";
import { CartData } from "@hyva/interfaces/CartData";
import { parsePrice } from "@utils/functions/price";
import { loadJsonData, loadLocators } from "@utils/functions/file";

// Default cart data structure
const defaultData: CartData = {
    default: {
        url: "",
        header_title: "",
        page_title_text: "",
        subtotal_label: "",
        grandtotal_label: ""
    }
};

// Load the cart data using the utility function
let data = loadJsonData<CartData>('cart.data.json', 'hyva', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
}

// Load the locators dynamically based on the APP_NAME environment variable
const locators = loadLocators('locators/cart.locator', 'hyva');

export default class CartPage extends BasePage<CartData> {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    async checkQuantity(itemRowNum: number, expectedQuantity: number) {
        await test.step(
            this.workerInfo.project.name + ": Check Quantity of row " + itemRowNum + ' has expected qty of ' + expectedQuantity,
            async () => {
                const itemRow = this.locators.cart_table + '>>' + this.locators.cart_table_body + ">>nth=" + itemRowNum + '>>' + this.locators.cart_row_item_info
                await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
                const beforeSubTotal = await this.page.innerText(itemRow + '>>' + this.locators.cart_row_subtotal);
                const qtyInput = itemRow + '>>' + this.locators.cart_row_qty_input;
                const qtyValue = await this.page.$eval(qtyInput, (element: HTMLInputElement) => element.value);
                expect(qtyValue, "Check quantity value matches expected").toEqual(expectedQuantity.toString());
            });

    }

    async changeQuantity(itemRowNum: number, newQuantity: number) {
        await test.step(
            this.workerInfo.project.name + ": Change itemrow " + itemRowNum + " quantity to " + newQuantity,
            async () => {
                const itemRow = this.locators.cart_table + '>>' + this.locators.cart_table_body + ">>nth=" + itemRowNum + '>>' + this.locators.cart_row_item_info
                await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
                const qtyInput = itemRow + '>>' + this.locators.cart_row_qty_input;
                await this.page.fill(qtyInput, newQuantity.toString());
                // Hyvä's cart form uses @submit.prevent="postCart" -> hyva.postCart() which
                // POSTs via fetch to /checkout/cart/updatePost and replaces #maincontent.
                // There is NO navigation, so waitForURL won't fire. Wait on the POST
                // response together with the button click to ensure the update completed
                // before re-reading the DOM.
                const updateResponse = this.page.waitForResponse(
                    (response) => response.url().includes('/checkout/cart/updatePost') && response.request().method() === 'POST',
                    { timeout: 15000 },
                );
                await this.page.getByRole('button', { name: 'Update Shopping Cart' }).click();
                await updateResponse;
                // Once Hyvä replaces #maincontent, Alpine's initCartForm.init() re-parses
                // window.checkoutConfig from the fresh data attribute. Wait for the
                // shopping cart fieldset to be reattached and showing the new qty.
                await expect(
                    this.page.locator(qtyInput),
                    "Qty input reflects new quantity after update",
                ).toHaveValue(newQuantity.toString(), { timeout: 10000 });
                await this.checkQuantity(itemRowNum, newQuantity);
            })
    }

    async getLineItemsPrices() {

        let total = 0.00;
        const itemCount = await this.page.locator(this.locators.cart_row_item_info).count();
        for (let i = 0; i < itemCount; i++) {
            const priceText = await this.getItemSubTotal(i);
            total += parsePrice(priceText);
        }
        return total;

    }

    async deleteItem(itemRowNum: number) {
        await test.step(
            this.workerInfo.project.name + ": Delete Item ",
            async () => {
                const itemRow = this.locators.cart_table + '>>' + this.locators.cart_table_body + ">>nth=" + itemRowNum;
                await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
                const deleteButton = itemRow + '>>' + this.locators.cart_item_row_delete;
                await expect(this.page.locator(deleteButton), "Verify element exists " + deleteButton).toHaveCount(1);
                await this.page.locator(deleteButton).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                expect(await this.page.locator(this.locators.cart_empty).isVisible(), "Verify element is visible " + this.locators.cart_empty).toBe(true);
            })
    }

    async getItemSubTotal(itemRowNum: number) {
        await this.page.waitForLoadState('domcontentloaded')
        const itemRow = this.locators.cart_table + '>>' + this.locators.cart_table_body + ">>nth=" + itemRowNum;
        await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
        let subTotal = await this.page.innerText(itemRow + '>>' + this.locators.cart_row_subtotal);
        // mobiles (and seems safari) get the label string included, so strip it if it exists
        // I am sure there is s smarter regex way, but i am not feeling smart right now ;)
        const subtotalLabel = data.default.subtotal_label || "";
        subTotal = subTotal.replace(subtotalLabel + ': ', '');
        subTotal = subTotal.replace(subtotalLabel + ':', '');
        subTotal = subTotal.replace(subtotalLabel + ' ', '');
        subTotal = subTotal.replace(subtotalLabel, '');
        return subTotal;
    }

    async checkSubtotalMatches(total: string) {
        await test.step(
            this.workerInfo.project.name + ": Check subtotals match ",
            async () => {
                // The Hyvä cart summary renders totals via two different templates
                // depending on tax/cart_display/subtotal:
                //  - Magento_Checkout default (excl-only): x-text="hyva.formatPrice(segment.value)"
                //  - Magento_Tax variant (both/including):  x-text="hyva.formatPrice(totalsData.subtotal)"
                // Pulling the authoritative value from window.checkoutConfig.totalsData
                // avoids locator fragility across these paths and also makes the test
                // robust to any shipping/tax label injected by Hyvä totals children.
                const subtotalValue = await this.page.evaluate(() => {
                    const cfg = (window as any).checkoutConfig;
                    if (!cfg || !cfg.totalsData) return null;
                    const segs = cfg.totalsData.total_segments || [];
                    const subtotalSegment = segs.find((s: any) => s.code === 'subtotal');
                    if (subtotalSegment && typeof subtotalSegment.value !== 'undefined') {
                        return Number(subtotalSegment.value);
                    }
                    if (typeof cfg.totalsData.subtotal !== 'undefined') {
                        return Number(cfg.totalsData.subtotal);
                    }
                    return null;
                });

                expect(
                    subtotalValue,
                    "checkoutConfig.totalsData must expose a cart subtotal",
                ).not.toBeNull();
                expect(
                    Number(subtotalValue),
                    "Check subtotal matches expected total",
                ).toEqual(parsePrice(total));
            });
    }

    async checkShippingMatches(total: string, label: string) {
        await test.step(
            this.workerInfo.project.name + ": Check Shipping values matches ",
            async () => {
                await this.page.locator('#cart-totals').getByText(total).first().textContent().then((value) => {
                    expect(value, "Check shipping value is not null").not.toBe(null);
                    if (value) {
                        // mobiles (and seems safari) get the label string included, so strip it if it exists
                        // I am sure there is s smarter regex way, but i am not feeling smart right now ;)
                        value = value.replace(label + ': ', '');
                        value = value.replace(label + ':', '');
                        value = value.replace(label + ' ', '');
                        value = value.replace(label, '');
                        expect(parsePrice(value), "Check shipping price matches expected total").toEqual(parsePrice(total));
                    }
                });
            });
    }

    /**
     * This check can be imprved when the theme templates get a data-test-id done
     * @param total
     */
    async checkGrandTotalMatches(total: string) {
        await test.step(
            this.workerInfo.project.name + ": Check grand totals matches ",
            async () => {
                await this.page.locator('#cart-totals').getByText(total).nth(1).textContent().then((value) => {
                    // mobiles (and seems safari) get the label string included, so strip it if it exists
                    // ditto!
                    expect(value, "Check grand total value is not null").not.toBe(null);
                    if (value) {
                        const grandtotalLabel = data.default.grandtotal_label || '';
                        value = value.replace(grandtotalLabel + ': ', '');
                        value = value.replace(grandtotalLabel + ':', '');
                        value = value.replace(grandtotalLabel + ' ', '');
                        value = value.replace(grandtotalLabel, '');
                        expect(parsePrice(value), "Check grand total price matches expected total").toEqual(parsePrice(total));
                    }
                });
            })
    }

    async clearCart() {
        await test.step(
            this.workerInfo.project.name + ": Clear the cart ",
            async () => {
                await expect(this.page.locator(this.locators.cart_clear), "Verify element exists " + this.locators.cart_clear).toHaveCount(1);
                await this.page.locator(this.locators.cart_clear).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                // Wait for confirmation dialog
                const dialog = this.page.locator('dialog[role="alertdialog"]');
                await dialog.waitFor({ state: 'visible', timeout: 5000 });
                expect(await dialog.isVisible(), "Verify dialog is visible").toBe(true);
                // Click OK button
                await dialog.locator('.btn.btn-primary').click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
            });
    }

    async clearCartCancel() {
        await test.step(
            this.workerInfo.project.name + ": Cancel Clear cart ",
            async () => {
                await expect(this.page.locator(this.locators.cart_clear), "Verify element exists " + this.locators.cart_clear).toHaveCount(1);
                await this.page.locator(this.locators.cart_clear).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                // Wait for confirmation dialog
                const dialog = this.page.locator('dialog[role="alertdialog"]');
                await dialog.waitFor({ state: 'visible', timeout: 5000 });
                expect(await dialog.isVisible(), "Verify dialog is visible").toBe(true);
                // Click Cancel button (not btn-primary, just btn)
                await dialog.locator('.btn').nth(1).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
            });
    }

    async clickProceedToCheckout() {
        await this.page.locator(this.locators.checkout_button).click();
        await this.page.waitForLoadState("domcontentloaded");
        //await this.page.waitForSelector(this.locators.shipping_label);
        //expect(this.page.locator(this.locators.title)).toContainText(data.default.header_title);
    }

}
