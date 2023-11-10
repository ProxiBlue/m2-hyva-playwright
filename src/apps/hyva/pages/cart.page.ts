import BasePage from "./base.page";
import type {Page, TestInfo} from "@playwright/test";
import {expect} from "@hyva/fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/cart.locator";

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
        super(page, workerInfo, data, locators);
    }

    async changeQuantity(itemRowNum: number, newQuantity: number) {
        const itemRow = locators.cart_table + '>>' + locators.cart_table_body + ">>nth=" + itemRowNum + '>>' + locators.cart_row_item_info
        const qtyInput = itemRow + '>>' + locators.cart_row_qty_input;
        const beforeSubTotal = await actions.getInnerText(this.page, itemRow + '>>' + locators.cart_row_subtotal, this.workerInfo);
        await actions.verifyElementExists(this.page, itemRow, this.workerInfo);
        await actions.fill(this.page, qtyInput, '2', this.workerInfo);
        let expectedUpdatedTotal = actions.parsePrice(beforeSubTotal) * newQuantity;
        await actions.clickElement(this.page, locators.update_cart_button, this.workerInfo);
        await this.page.waitForLoadState('networkidle');
        await expect(this.page.locator('#shopping-cart-table').getByText(expectedUpdatedTotal.toString())).toBeVisible({timeout:5000});
    }

    async deleteItem(itemRowNum: number) {
        const itemRow = locators.cart_table + '>>' + locators.cart_table_body + ">>nth=" + itemRowNum;
        const deleteButton = itemRow + '>>' + locators.cart_item_row_delete;
        await actions.verifyElementExists(this.page, itemRow, this.workerInfo);
        await actions.clickElement(this.page, deleteButton, this.workerInfo).then(async () => {
            await this.page.waitForLoadState('networkidle');
        });
    }

    async getItemSubTotal(itemRowNum: number) {
        const itemRow = locators.cart_table + '>>' + locators.cart_table_body + ">>nth=" + itemRowNum;
        let subTotal = await actions.getInnerText(this.page, itemRow + '>>' + locators.cart_row_subtotal, this.workerInfo);
        // mobiles (and seems safari) get the label string included, so strip it if it exists
        // i am sure there is s smarter regex way, but i am not feeling smart right now ;)
        subTotal = subTotal.replace(data.subtotal_label + ': ', '');
        subTotal = subTotal.replace(data.subtotal_label + ':', '');
        subTotal = subTotal.replace(data.subtotal_label + ' ', '');
        subTotal = subTotal.replace(data.subtotal_label, '');
        return subTotal;
    }

    /**
     * This check can be imprved when the theme templates get a data-test-id done
     * @TODO: Send a MR to Hyva to add test id's to the totals sections
     * @param total
     */
    async checkSubtotalMatches(total: string) {
        await this.page.locator('#cart-totals').getByText(total).first().innerText().then((value) => {
            // mobiles (and seems safari) get the label string included, so strip it if it exists
            // i am sure there is s smarter regex way, but i am not feeling smart right now ;)
            value = value.replace(data.subtotal_label + ': ', '');
            value = value.replace(data.subtotal_label + ':', '');
            value = value.replace(data.subtotal_label + ' ', '');
            value = value.replace(data.subtotal_label, '');
            expect(value).toEqual(total);
        });
    }

    async checkShippingMatches(total: string, label: string) {
        console.log('--------------------')
        console.log(total);
        console.log('--------------------')
        await this.page.locator('#cart-totals').getByText(total).first().innerText().then((value) => {
            // mobiles (and seems safari) get the label string included, so strip it if it exists
            // i am sure there is s smarter regex way, but i am not feeling smart right now ;)
            value = value.replace(label + ': ', '');
            value = value.replace(label + ':', '');
            value = value.replace(label + ' ', '');
            value = value.replace(label, '');
            expect(actions.parsePrice(value)).toEqual(total);
        });
    }

    /**
     * This check can be imprved when the theme templates get a data-test-id done
     * @TODO: Send a MR to Hyva to add test id's to the totals sections
     * @param total
     */
    async checkGrandTotalMatches(total: string) {
        await this.page.locator('#cart-totals').getByText(total).nth(1).innerText().then((value) => {
            // mobiles (and seems safari) get the label string included, so strip it if it exists
            // ditto!
            value = value.replace(data.grandtotal_label + ': ', '');
            value = value.replace(data.grandtotal_label + ':', '');
            value = value.replace(data.grandtotal_label + ' ', '');
            value = value.replace(data.grandtotal_label, '');
            expect(value).toEqual(total);
        });
    }

    async clearCart() {
        await actions.verifyElementExists(this.page, locators.cart_clear, this.workerInfo);
        await actions.clickElement(this.page, locators.cart_clear, this.workerInfo).then(async () => {
            await this.page.waitForLoadState('networkidle');
            await actions.verifyElementIsVisible(this.page, "[aria-label='Are you sure?']", this.workerInfo);
            await actions.clickElement(this.page, "[aria-label='Are you sure?']>>.btn-primary", this.workerInfo)
            await this.page.waitForLoadState('networkidle');
        });
    }

    async clearCartCancel() {
        await actions.verifyElementExists(this.page, locators.cart_clear, this.workerInfo);
        await actions.clickElement(this.page, locators.cart_clear, this.workerInfo).then(async () => {
            await this.page.waitForLoadState('networkidle');
            await actions.verifyElementIsVisible(this.page, "[aria-label='Are you sure?']", this.workerInfo);
            await actions.clickElement(this.page, "[aria-label='Are you sure?']>>.btn>>nth=0", this.workerInfo)
            await this.page.waitForLoadState('networkidle');
        });
    }

}
