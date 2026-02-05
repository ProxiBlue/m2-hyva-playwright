import BasePage from "@common/pages/base.page";
import { Page, TestInfo, test } from "@playwright/test";
import { expect } from "../../../../playwright.config";
import { parsePrice } from "@utils/functions/price";
import { loadJsonData, loadLocators } from "@utils/functions/file";

// Define the interface for the cart data structure
interface CartData {
    default: {
        url?: string;
        header_title?: string;
        page_title_text?: string;
        subtotal_label?: string;
        grandtotal_label?: string;
    };
}

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
let data = loadJsonData<CartData>('cart.data.json', 'luma', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
}

// Load the locators dynamically based on the APP_NAME environment variable
const locators = loadLocators('locators/cart.locator', 'luma');

export default class CartPage extends BasePage<CartData> {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    async checkQuantity(itemRowNum: number, expectedQuantity: number) {
        await test.step(
            this.workerInfo.project.name + ": Check Quantity of row " + itemRowNum + ' has expected qty of ' + expectedQuantity,
            async () => {
                const itemRow = this.locators.cart_table + '>>' + this.locators.cart_table_body + ">>nth=" + itemRowNum + '>>' + this.locators.cart_row_item_info;
                await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
                const qtyInput = itemRow + '>>' + this.locators.cart_row_qty_input;
                const qtyValue = await this.page.$eval(qtyInput, (element: HTMLInputElement) => element.value);
                expect(qtyValue, "Check quantity value matches expected").toEqual(expectedQuantity.toString());
            });
    }

    async changeQuantity(itemRowNum: number, newQuantity: number) {
        await test.step(
            this.workerInfo.project.name + ": Change itemrow " + itemRowNum + " quantity to " + newQuantity,
            async () => {
                const itemRow = this.locators.cart_table + '>>' + this.locators.cart_table_body + ">>nth=" + itemRowNum + '>>' + this.locators.cart_row_item_info;
                await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
                const qtyInput = itemRow + '>>' + this.locators.cart_row_qty_input;
                await this.page.fill(qtyInput, newQuantity.toString());
                await this.page.getByRole('button', { name: 'Update Shopping Cart' }).click();
                await this.page.waitForURL("**/checkout/cart");
                await this.page.waitForLoadState('domcontentloaded');
                await this.checkQuantity(itemRowNum, newQuantity);
            });
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
                expect(await this.page.locator(this.locators.cart_empty).isVisible(), "Verify cart is empty").toBe(true);
            });
    }

    async getItemSubTotal(itemRowNum: number) {
        await this.page.waitForLoadState('domcontentloaded');
        const itemRow = this.locators.cart_table + '>>' + this.locators.cart_table_body + ">>nth=" + itemRowNum;
        await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
        let subTotal = await this.page.innerText(itemRow + '>>' + this.locators.cart_row_subtotal);
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
                const value = await this.page.locator(this.locators.cart_subtotal).textContent();
                expect(value, "Check subtotal value is not null").not.toBe(null);
                if (value) {
                    expect(parsePrice(value), "Check subtotal matches expected total").toEqual(parsePrice(total));
                }
            });
    }

    async checkShippingMatches(total: string) {
        await test.step(
            this.workerInfo.project.name + ": Check Shipping values matches ",
            async () => {
                const value = await this.page.locator(this.locators.cart_shipping).textContent();
                expect(value, "Check shipping value is not null").not.toBe(null);
                if (value) {
                    expect(parsePrice(value), "Check shipping price matches expected total").toEqual(parsePrice(total));
                }
            });
    }

    async checkGrandTotalMatches(total: string) {
        await test.step(
            this.workerInfo.project.name + ": Check grand totals matches ",
            async () => {
                const value = await this.page.locator(this.locators.cart_grandtotal).textContent();
                expect(value, "Check grand total value is not null").not.toBe(null);
                if (value) {
                    expect(parsePrice(value), "Check grand total price matches expected total").toEqual(parsePrice(total));
                }
            });
    }

    async clearCart() {
        await test.step(
            this.workerInfo.project.name + ": Clear the cart ",
            async () => {
                await expect(this.page.locator(this.locators.cart_clear), "Verify clear cart button exists").toHaveCount(1);
                await this.page.locator(this.locators.cart_clear).click();
                // Luma uses a confirm dialog
                this.page.on('dialog', async dialog => {
                    await dialog.accept();
                });
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
            });
    }

    async clickProceedToCheckout() {
        await this.page.locator(this.locators.checkout_button).click();
        await this.page.waitForLoadState("domcontentloaded");
    }
}
