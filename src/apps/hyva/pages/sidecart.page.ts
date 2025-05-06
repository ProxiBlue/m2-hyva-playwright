import BasePage from "@common/pages/base.page";
import {Page, test, TestInfo} from "@playwright/test";
import {expect} from "@hyva/fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/sidecart.locator";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {};
const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/sidecart.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/sidecart.data.json', {assert: {type: "json"}}).then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import(__dirname + '/../data/sidecart.data.json', {assert: {type: "json"}}).then((dynamicData) => {
        data = dynamicData;
    });
}

export default class SideCartPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    async open() {
        await test.step(
            this.workerInfo.project.name + ": Open Sidecart ",
            async () => {
                this.page.waitForLoadState('domcontentloaded')
                await actions.clickElement(this.page, locators.miniCartButton, this.workerInfo);
                await this.page.waitForTimeout(500);
                await this.page.waitForLoadState('domcontentloaded');
                const sideCartTitle = this.page.locator(locators.title);
                await expect(sideCartTitle).toBeVisible();
            });
    }

    async checkQtyIndication(qty: number) {
        await test.step(
            this.workerInfo.project.name + ": Check side cart qty ",
            async () => {
                // browse to homepage
                this.page.reload();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(locators.miniCartQtyIndicator);
                await actions.verifyElementIsVisible(this.page, locators.miniCartQtyIndicator, this.workerInfo);
                await actions.getInnerText(this.page, locators.miniCartQtyIndicator, this.workerInfo).then(async (qtyValue) => {
                    expect(qtyValue).toEqual(qty.toString());
                });
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

    async deleteAll() {
        await test.step(
            this.workerInfo.project.name + ": Delete all items from side carts ",
            async () => {
                await this.page.waitForLoadState('domcontentloaded')
                const cartItems = await this.page.$$(locators.items);
                for (let i = 0; i < cartItems.length; i++) {
                    const deleteButton = await cartItems[i].$(locators.item_delete_button);
                    // @ts-ignore
                    await deleteButton.click();
                }
                const sideCart = this.page.locator(locators.side_cart);
                // @ts-ignore
                await expect(sideCart).toContainText(data.default.cart_is_empty);
                const remainingItems = await this.page.$$(locators.items);
                expect(remainingItems.length).toBe(0);
            });

    }

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
