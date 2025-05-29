import BasePage from "@common/pages/base.page";
import {Page, TestInfo, test} from "@playwright/test";
import { expect } from "../../../../playwright.config";
import * as cartLocators from "@hyva/locators/cart.locator";
import { CartData } from "@hyva/interfaces/CartData";
import { parsePrice } from "@utils/functions/price";

// dynamically load the test JSON data based on the APP_NAME env variable
// and if the file exists in APP path, and if not default to the base data
let data: CartData = {
    default: {
        url: "",
        header_title: "",
        page_title_text: "",
        subtotal_label: "",
        grandtotal_label: ""
    }
};
// Load data synchronously to ensure it's available when needed
const fs = require("fs");
try {
    let dataPath;
    if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/cart.data.json')) {
        dataPath = __dirname + '/../../' + process.env.APP_NAME + '/data/cart.data.json';
    } else {
        dataPath = __dirname + '/../data/cart.data.json';
    }
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    let parsedData = JSON.parse(jsonData);
    // Ensure data has a default property
    if (!parsedData.default) {
        data = { default: parsedData };
    } else {
        data = parsedData;
    }
} catch (error) {
    // Error loading cart data
}

export default class CartPage extends BasePage<CartData> {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, cartLocators);
    }

    async checkQuantity(itemRowNum: number, expectedQuantity: number) {
        await test.step(
            this.workerInfo.project.name + ": Check Quantity of row " + itemRowNum + ' has expected qty of ' + expectedQuantity,
            async () => {
                const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum + '>>' + cartLocators.cart_row_item_info
                await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
                const beforeSubTotal = await this.page.innerText(itemRow + '>>' + cartLocators.cart_row_subtotal);
                const qtyInput = itemRow + '>>' + cartLocators.cart_row_qty_input;
                const qtyValue = await this.page.$eval(qtyInput, (element: HTMLInputElement) => element.value);
                expect(qtyValue, "Check quantity value matches expected").toEqual(expectedQuantity.toString());
            });

    }

    async changeQuantity(itemRowNum: number, newQuantity: number) {
        await test.step(
            this.workerInfo.project.name + ": Change itemrow " + itemRowNum + " quantity to " + newQuantity,
            async () => {
                const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum + '>>' + cartLocators.cart_row_item_info
                await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
                const beforeSubTotal = await this.page.innerText(itemRow + '>>' + cartLocators.cart_row_subtotal);
                const qtyInput = itemRow + '>>' + cartLocators.cart_row_qty_input;
                await this.page.fill(qtyInput, newQuantity.toString());
                await this.page.locator('.action.update').click();
                await this.page.waitForURL("**/checkout/cart");
                await this.page.waitForLoadState('domcontentloaded');
                await this.checkQuantity(itemRowNum, newQuantity);
            })
    }

    async getLineItemsPrices() {

        let total = 0.00;
        const itemCount = await this.page.locator(cartLocators.cart_row_item_info).count();
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
                const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum;
                await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
                const deleteButton = itemRow + '>>' + cartLocators.cart_item_row_delete;
                await expect(this.page.locator(deleteButton), "Verify element exists " + deleteButton).toHaveCount(1);
                await this.page.locator(deleteButton).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                expect(await this.page.locator(cartLocators.cart_empty).isVisible(), "Verify element is visible " + cartLocators.cart_empty).toBe(true);
            })
    }

    async getItemSubTotal(itemRowNum: number) {
        await this.page.waitForLoadState('domcontentloaded')
        const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum;
        await expect(this.page.locator(itemRow), "Verify element exists " + itemRow).toHaveCount(1);
        let subTotal = await this.page.innerText(itemRow + '>>' + cartLocators.cart_row_subtotal);
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
                await this.page.locator(cartLocators.cart_subtotal).textContent().then((value) => {
                    // mobiles (and seems safari) get the label string included, so strip it if it exists
                    // i am sure there is s smarter regex way, but i am not feeling smart right now ;)
                    const subtotalLabel = data.default.subtotal_label || "";
                    if(value) {
                        value = value.replace(subtotalLabel + ': ', '');
                        value = value.replace(subtotalLabel + ':', '');
                        value = value.replace(subtotalLabel + ' ', '');
                        value = value.replace(subtotalLabel, '');
                        expect(parsePrice(value), "Check subtotal matches expected total").toEqual(parsePrice(total));
                    }
                });
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
                await expect(this.page.locator(cartLocators.cart_clear), "Verify element exists " + cartLocators.cart_clear).toHaveCount(1);
                await this.page.locator(cartLocators.cart_clear).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                expect(await this.page.locator("[aria-label='Are you sure?']").isVisible(), "Verify element is visible [aria-label='Are you sure?']").toBe(true);
                await this.page.locator("[aria-label='Are you sure?']>>.btn-primary").click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
            });
    }

    async clearCartCancel() {
        await test.step(
            this.workerInfo.project.name + ": Cancel Clear cart ",
            async () => {
                await expect(this.page.locator(cartLocators.cart_clear), "Verify element exists " + cartLocators.cart_clear).toHaveCount(1);
                await this.page.locator(cartLocators.cart_clear).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                expect(await this.page.locator("[aria-label='Are you sure?']").isVisible(), "Verify element is visible [aria-label='Are you sure?']").toBe(true);
                await this.page.locator("[aria-label='Are you sure?']>>.btn>>nth=0").click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
            });
    }

    async clickProceedToCheckout() {
        await this.page.locator(cartLocators.checkout_button).click();
        await this.page.waitForLoadState("domcontentloaded");
        //await this.page.waitForSelector(cartLocators.shipping_label);
        //expect(this.page.locator(cartLocators.title)).toContainText(data.default.header_title);
    }

}
