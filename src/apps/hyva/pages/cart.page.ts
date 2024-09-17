import BasePage from "./base.page";
import type {Page, TestInfo} from "@playwright/test";
import {expect} from "@hyva/fixtures";
import * as actions from "@utils/base/web/actions";
import * as cartLocators from "@hyva/locators/cart.locator";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {};
const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/cart.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/cart.data.json').then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import('../data/cart.data.json').then((dynamicData) => {
        data = dynamicData;
    });
}

export default class CartPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, cartLocators);
    }

    async checkQuantity(itemRowNum: number, expectedQuantity: number) {
        const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum + '>>' + cartLocators.cart_row_item_info
        await actions.verifyElementExists(this.page, itemRow, this.workerInfo);
        await actions.getInnerText(this.page, itemRow + '>>' + cartLocators.cart_row_subtotal, this.workerInfo).then (async (beforeSubTotal) => {
            const qtyInput = itemRow + '>>' + cartLocators.cart_row_qty_input;
            const qtyValue = await actions.getElementValue(this.page, qtyInput, this.workerInfo);
            expect(qtyValue).toEqual(expectedQuantity.toString());
        });

    }
    async changeQuantity(itemRowNum: number, newQuantity: number) {
        const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum + '>>' + cartLocators.cart_row_item_info
        await actions.verifyElementExists(this.page, itemRow, this.workerInfo);
        await actions.getInnerText(this.page, itemRow + '>>' + cartLocators.cart_row_subtotal, this.workerInfo).then (async (beforeSubTotal) => {
            const qtyInput = itemRow + '>>' + cartLocators.cart_row_qty_input;
            await actions.fill(this.page, qtyInput, '2', this.workerInfo);
            await this.page.locator('.action.update').click();
            await this.page.waitForURL("**/checkout/cart");
            await this.page.waitForLoadState('domcontentloaded');
            await this.checkQuantity(itemRowNum, newQuantity);
        });
    }

    async getLineItemsPrices() {
        let total= 0.00 ;
        const itemCount = await this.page.locator(cartLocators.cart_row_item_info).count();
        for (let i = 0; i < itemCount; i++) {
            const priceText = await this.getItemSubTotal(i);
            total += parseFloat(priceText.replace(/[^0-9.-]+/g,""));
        }
        return total;
    }

    async deleteItem(itemRowNum: number) {
        const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum;
        await actions.verifyElementExists(this.page, itemRow, this.workerInfo);
        const deleteButton = itemRow + '>>' + cartLocators.cart_item_row_delete;
        await actions.verifyElementExists(this.page, deleteButton, this.workerInfo);
        await actions.clickElement(this.page, deleteButton, this.workerInfo).then(async () => {
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForLoadState('domcontentloaded');
            await actions.verifyElementIsVisible(this.page, cartLocators.cart_empty, this.workerInfo);
        });
    }

    async getItemSubTotal(itemRowNum: number) {
        this.page.waitForLoadState('domcontentloaded')
        const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum;
        await actions.verifyElementExists(this.page, itemRow, this.workerInfo);
        let subTotal = await actions.getInnerText(this.page, itemRow + '>>' + cartLocators.cart_row_subtotal, this.workerInfo);
        // mobiles (and seems safari) get the label string included, so strip it if it exists
        // i am sure there is s smarter regex way, but i am not feeling smart right now ;)
        subTotal = subTotal.replace(data.subtotal_label + ': ', '');
        subTotal = subTotal.replace(data.subtotal_label + ':', '');
        subTotal = subTotal.replace(data.subtotal_label + ' ', '');
        subTotal = subTotal.replace(data.subtotal_label, '');
        return subTotal;
    }

    async checkSubtotalMatches(total: string) {
        await this.page.locator(cartLocators.cart_subtotal).textContent().then((value) => {
            // mobiles (and seems safari) get the label string included, so strip it if it exists
            // i am sure there is s smarter regex way, but i am not feeling smart right now ;)
            value = value.replace(data.subtotal_label + ': ', '');
            value = value.replace(data.subtotal_label + ':', '');
            value = value.replace(data.subtotal_label + ' ', '');
            value = value.replace(data.subtotal_label, '');
            expect(value.replace(/[^0-9.-]+/g,"")).toEqual(total.replace(/[^0-9.-]+/g,""));
        });
    }

    async checkShippingMatches(total: string, label: string) {
        await this.page.locator('#cart-totals').getByText(total).first().textContent().then((value) => {
            // mobiles (and seems safari) get the label string included, so strip it if it exists
            // i am sure there is s smarter regex way, but i am not feeling smart right now ;)
            value = value.replace(label + ': ', '');
            value = value.replace(label + ':', '');
            value = value.replace(label + ' ', '');
            value = value.replace(label, '');
            expect(actions.parsePrice(value.replace(/[^0-9.-]+/g,""))).toEqual(total.replace(/[^0-9.-]+/g,""));
        });
    }

    /**
     * This check can be imprved when the theme templates get a data-test-id done
     * @TODO: Send a MR to Hyva to add test id's to the totals sections
     * @param total
     */
    async checkGrandTotalMatches(total: string) {
        await this.page.locator('#cart-totals').getByText(total).nth(1).textContent().then((value) => {
            // mobiles (and seems safari) get the label string included, so strip it if it exists
            // ditto!
            value = value.replace(data.grandtotal_label + ': ', '');
            value = value.replace(data.grandtotal_label + ':', '');
            value = value.replace(data.grandtotal_label + ' ', '');
            value = value.replace(data.grandtotal_label, '');
            expect(value.replace(/[^0-9.-]+/g,"")).toEqual(total.replace(/[^0-9.-]+/g,""));
        });
    }

    async clearCart() {
        await actions.verifyElementExists(this.page, cartLocators.cart_clear, this.workerInfo);
        await actions.clickElement(this.page, cartLocators.cart_clear, this.workerInfo).then(async () => {
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForLoadState('domcontentloaded');
            await actions.verifyElementIsVisible(this.page, "[aria-label='Are you sure?']", this.workerInfo);
            await actions.clickElement(this.page, "[aria-label='Are you sure?']>>.btn-primary", this.workerInfo)
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForLoadState('domcontentloaded');
        });
    }

    async clearCartCancel() {
        await actions.verifyElementExists(this.page, cartLocators.cart_clear, this.workerInfo);
        await actions.clickElement(this.page, cartLocators.cart_clear, this.workerInfo).then(async () => {
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForLoadState('domcontentloaded');
            await actions.verifyElementIsVisible(this.page, "[aria-label='Are you sure?']", this.workerInfo);
            await actions.clickElement(this.page, "[aria-label='Are you sure?']>>.btn>>nth=0", this.workerInfo)
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForLoadState('domcontentloaded');
        });
    }

}
