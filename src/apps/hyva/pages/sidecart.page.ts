import BasePage from "./base.page";
import type {Page, TestInfo} from "@playwright/test";
import {expect} from "@hyva/fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/sidecart.locator";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {};
const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/sidecart.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/sidecart.data.json').then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import('../data/sidecart.data.json').then((dynamicData) => {
        data = dynamicData;
    });
}

export default class SideCartPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    async open() {
        this.page.waitForLoadState('domcontentloaded')
        await actions.clickElement(this.page, locators.miniCartButton, this.workerInfo);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState('domcontentloaded');
    }

    async checkQtyIndication(qty: number) {
        await actions.verifyElementIsVisible(this.page, locators.miniCartQtyIndicator, this.workerInfo);
        await actions.getInnerText(this.page, locators.miniCartQtyIndicator, this.workerInfo).then (async (qtyValue) => {
            expect(qtyValue).toEqual(qty.toString());
        });
    }

    // async changeQuantity(itemRowNum: number, newQuantity: number) {
    //     const itemRow = locators.cart_table + '>>' + locators.cart_table_body + ">>nth=" + itemRowNum + '>>' + locators.cart_row_item_info
    //     await actions.verifyElementExists(this.page, itemRow, this.workerInfo);
    //     await actions.getInnerText(this.page, itemRow + '>>' + locators.cart_row_subtotal, this.workerInfo).then (async (beforeSubTotal) => {
    //         const qtyInput = itemRow + '>>' + locators.cart_row_qty_input;
    //         await actions.fill(this.page, qtyInput, '2', this.workerInfo);
    //         await this.page.waitForLoadState('domcontentloaded')
    //         await this.page.waitForLoadState('networkidle');
    //         let expectedUpdatedTotal = actions.parsePrice(beforeSubTotal) * newQuantity;
    //         await actions.clickElement(this.page, locators.update_cart_button, this.workerInfo).then(async () => {
    //             await expect(this.page.locator('#shopping-cart-table').getByText(expectedUpdatedTotal.toString())).toBeVisible({timeout: 5000});
    //         });
    //     });
    // }
    //
    // async deleteItem(itemRowNum: number) {
    //     const itemRow = locators.cart_table + '>>' + locators.cart_table_body + ">>nth=" + itemRowNum;
    //     await actions.verifyElementExists(this.page, itemRow, this.workerInfo);
    //     const deleteButton = itemRow + '>>' + locators.cart_item_row_delete;
    //     await actions.verifyElementExists(this.page, deleteButton, this.workerInfo);
    //     await actions.clickElement(this.page, deleteButton, this.workerInfo).then(async () => {
    //         await this.page.waitForLoadState('networkidle');
    //         await actions.verifyElementIsVisible(this.page, cartLocators.cart_empty, this.workerInfo);
    //     });
    // }

    async getItemPrice(itemRowNum: number) {
        this.page.waitForLoadState('domcontentloaded')
        const itemRow = locators.items + ">>nth=" + itemRowNum;
        const itemRowPrice = itemRow + '>>' + locators.price;
        await actions.verifyElementExists(this.page, itemRow, this.workerInfo);
        // scroll the item into view
        await this.page.locator(itemRowPrice).scrollIntoViewIfNeeded();
        let itemPrice = await this.page.locator(itemRowPrice).textContent();
        return itemPrice;
    }

    async getMiniCartSubtotal() {
        this.page.waitForLoadState('domcontentloaded')
        await actions.verifyElementExists(this.page, locators.subTotal, this.workerInfo);
        let subTotal = await this.page.locator(locators.subTotal).textContent();
        return subTotal;
    }

}
