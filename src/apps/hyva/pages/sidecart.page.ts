import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@hyva/locators/sidecart.locator";
import { loadJsonData } from "@utils/functions/file";

// Define the interface for the sidecart data structure
interface SidecartData {
  default: {
    cart_is_empty?: string;
  };
}

// Default sidecart data structure
const defaultData: SidecartData = { default: {} };

// Load the sidecart data using the utility function
let data = loadJsonData<SidecartData>('sidecart.data.json', 'hyva', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
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
                await test.step(
                    this.workerInfo.project.name + ": Click element " + locators.miniCartButton,
                    async () => await this.page.locator(locators.miniCartButton).click()
                );
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
                await test.step(
                    this.workerInfo.project.name + ": Verify element is visible " + locators.miniCartQtyIndicator,
                    async () => expect(await this.page.locator(locators.miniCartQtyIndicator).isVisible()).toBe(true)
                );
                const qtyValue = await test.step(
                    this.workerInfo.project.name + ": Get innertext from " + locators.miniCartQtyIndicator,
                    async () => await this.page.innerText(locators.miniCartQtyIndicator)
                );
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
        await test.step(
            this.workerInfo.project.name + ": Verify element exists " + itemRow,
            async () => await expect(this.page.locator(itemRow)).toHaveCount(1)
        );
        // scroll the item into view
        await this.page.locator(itemRowPrice).scrollIntoViewIfNeeded();
        let itemPrice = await this.page.locator(itemRowPrice).textContent();
        return itemPrice;
    }

    async getMiniCartSubtotal() {
        this.page.waitForLoadState('domcontentloaded')
        await test.step(
            this.workerInfo.project.name + ": Verify element exists " + locators.subTotal,
            async () => await expect(this.page.locator(locators.subTotal)).toHaveCount(1)
        );
        let subTotal = await this.page.locator(locators.subTotal).textContent();
        return subTotal;
    }

}
