import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as cartLocators from "@luma/locators/cart.locator";
import { loadJsonData } from "@utils/functions/file";
import { parsePrice } from "@utils/functions/price";

// Define the interface for the cart data structure
interface CartData {
  default: {
    subtotal_label?: string;
    grandtotal_label?: string;
  };
}

// Default cart data structure
const defaultData: CartData = { default: {} };

// Load the cart data using the utility function
const data = loadJsonData<CartData>('cart.data.json', 'luma', defaultData);

export default class CartPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, cartLocators);
    }

    async checkQuantity(itemRowNum: number, expectedQuantity: number) {
        await test.step(
            this.workerInfo.project.name + ": Check Quantity of row " + itemRowNum + ' has expected qty of ' + expectedQuantity,
            async () => {
                const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum + '>>' + cartLocators.cart_row_item_info
                await test.step(
                    this.workerInfo.project.name + ": Verify element exists " + itemRow,
                    async () => await expect(this.page.locator(itemRow)).toHaveCount(1)
                );
                await test.step(
                    this.workerInfo.project.name + ": Get innertext from " + (itemRow + '>>' + cartLocators.cart_row_subtotal),
                    async () => {
                        const beforeSubTotal = await this.page.innerText(itemRow + '>>' + cartLocators.cart_row_subtotal);
                        const qtyInput = itemRow + '>>' + cartLocators.cart_row_qty_input;
                        const qtyValue = await test.step(
                            this.workerInfo.project.name + ": Get value from " + qtyInput,
                            async () => await this.page.$eval(qtyInput, (element: HTMLInputElement) => element.value)
                        );
                        expect(qtyValue).toEqual(expectedQuantity.toString());
                    }
                );
            });

    }

    async changeQuantity(itemRowNum: number, newQuantity: number) {
        await test.step(
            this.workerInfo.project.name + ": Change itemrow " + itemRowNum + " quantity to " + newQuantity,
            async () => {
                const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum + '>>' + cartLocators.cart_row_item_info
                await test.step(
                    this.workerInfo.project.name + ": Verify element exists " + itemRow,
                    async () => await expect(this.page.locator(itemRow)).toHaveCount(1)
                );
                await test.step(
                    this.workerInfo.project.name + ": Get innertext from " + (itemRow + '>>' + cartLocators.cart_row_subtotal),
                    async () => {
                        const beforeSubTotal = await this.page.innerText(itemRow + '>>' + cartLocators.cart_row_subtotal);
                        const qtyInput = itemRow + '>>' + cartLocators.cart_row_qty_input;
                        await test.step(
                            this.workerInfo.project.name + ": Enter text: 2",
                            async () => await this.page.fill(qtyInput, '2')
                        );
                        await this.page.getByRole('button', { name: 'Update Shopping Cart' }).click();
                        await this.page.waitForURL("**/checkout/cart");
                        await this.page.waitForLoadState('domcontentloaded');
                        await this.checkQuantity(itemRowNum, newQuantity);
                    }
                );
            })
    }

    async getLineItemsPrices() {
        let total = 0.00;
        const itemCount = await this.page.locator(cartLocators.cart_row_item_info).count();
        for (let i = 0; i < itemCount; i++) {
            const priceText = await this.getItemSubTotal(i);
            //@ts-ignore
            total += priceText;
        }
        return total;
    }

    async deleteItem(itemRowNum: number) {
        await test.step(
            this.workerInfo.project.name + ": Delete Item ",
            async () => {
                const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum;
                await test.step(
                    this.workerInfo.project.name + ": Verify element exists " + itemRow,
                    async () => await expect(this.page.locator(itemRow)).toHaveCount(1)
                );
                const deleteButton = itemRow + '>>' + cartLocators.cart_item_row_delete;
                await test.step(
                    this.workerInfo.project.name + ": Verify element exists " + deleteButton,
                    async () => await expect(this.page.locator(deleteButton)).toHaveCount(1)
                );
                await test.step(
                    this.workerInfo.project.name + ": Click element " + deleteButton,
                    async () => {
                        await this.page.locator(deleteButton).click();
                        await this.page.waitForLoadState('networkidle');
                        await this.page.waitForLoadState('domcontentloaded');
                        await test.step(
                            this.workerInfo.project.name + ": Verify element is visible " + cartLocators.cart_empty,
                            async () => expect(await this.page.locator(cartLocators.cart_empty).isVisible()).toBe(true)
                        );
                    }
                );
            })
    }

    async getItemSubTotal(itemRowNum: number) {
        await this.page.waitForLoadState('domcontentloaded')
        const itemRow = cartLocators.cart_table + '>>' + cartLocators.cart_table_body + ">>nth=" + itemRowNum;
        await test.step(
            this.workerInfo.project.name + ": Verify element exists " + itemRow,
            async () => await expect(this.page.locator(itemRow)).toHaveCount(1)
        );
        let subTotal = await test.step(
            this.workerInfo.project.name + ": Get innertext from " + (itemRow + '>>' + cartLocators.cart_row_subtotal),
            async () => await this.page.innerText(itemRow + '>>' + cartLocators.cart_row_subtotal)
        );
        expect(subTotal).not.toBeNull();
        return parsePrice(subTotal);
    }

    async checkSubtotalMatches(total: string) {
        await test.step(
            this.workerInfo.project.name + ": Check subtotals match ",
            async () => {
                await this.page.locator(cartLocators.cart_subtotal).textContent().then((value) => {
                    // mobiles (and seems safari) get the label string included, so strip it if it exists
                    // i am sure there is s smarter regex way, but i am not feeling smart right now ;)
                    // @ts-ignore
                    value = value.replace(data.default.subtotal_label + ': ', '');
                    // @ts-ignore
                    value = value.replace(data.default.subtotal_label + ':', '');
                    // @ts-ignore
                    value = value.replace(data.default.subtotal_label + ' ', '');
                    // @ts-ignore
                    value = value.replace(data.default.subtotal_label, '');
                    expect(parsePrice(value)).toEqual(parsePrice(total));
                });
            });
    }

    async checkShippingMatches(total: string, label: string) {
        await test.step(
            this.workerInfo.project.name + ": Check Shipping values matches ",
            async () => {
                await this.page.locator('#cart-totals').getByText(total).first().textContent().then((value) => {
                    expect(value).not.toBe(null);
                    if (value) {
                        // mobiles (and seems safari) get the label string included, so strip it if it exists
                        // I am sure there is s smarter regex way, but i am not feeling smart right now ;)
                        value = value.replace(label + ': ', '');
                        value = value.replace(label + ':', '');
                        value = value.replace(label + ' ', '');
                        value = value.replace(label, '');
                        expect(parsePrice(value)).toEqual(parsePrice(total));
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
                    expect(value).not.toBe(null);
                    if (value) {
                        // @ts-ignore
                        value = value.replace(data.default.grandtotal_label + ': ', '');
                        // @ts-ignore
                        value = value.replace(data.default.grandtotal_label + ':', '');
                        // @ts-ignore
                        value = value.replace(data.default.grandtotal_label + ' ', '');
                        // @ts-ignore
                        value = value.replace(data.default.grandtotal_label, '');
                        expect(parsePrice(value)).toEqual(parsePrice(total));
                    }
                });
            })
    }

    async clearCart() {
        await test.step(
            this.workerInfo.project.name + ": Clear the cart ",
            async () => {
                await test.step(
                    this.workerInfo.project.name + ": Verify element exists " + cartLocators.cart_clear,
                    async () => await expect(this.page.locator(cartLocators.cart_clear)).toHaveCount(1)
                );
                await test.step(
                    this.workerInfo.project.name + ": Click element " + cartLocators.cart_clear,
                    async () => {
                        await this.page.locator(cartLocators.cart_clear).click();
                        await this.page.waitForLoadState('networkidle');
                        await this.page.waitForLoadState('domcontentloaded');
                        await test.step(
                            this.workerInfo.project.name + ": Verify element is visible [aria-label='Are you sure?']",
                            async () => expect(await this.page.locator("[aria-label='Are you sure?']").isVisible()).toBe(true)
                        );
                        await test.step(
                            this.workerInfo.project.name + ": Click element [aria-label='Are you sure?']>>.btn-primary",
                            async () => await this.page.locator("[aria-label='Are you sure?']>>.btn-primary").click()
                        );
                        await this.page.waitForLoadState('networkidle');
                        await this.page.waitForLoadState('domcontentloaded');
                    }
                );
            });
    }

    async clearCartCancel() {
        await test.step(
            this.workerInfo.project.name + ": Cancel Clear cart ",
            async () => {
                await test.step(
                    this.workerInfo.project.name + ": Verify element exists " + cartLocators.cart_clear,
                    async () => await expect(this.page.locator(cartLocators.cart_clear)).toHaveCount(1)
                );
                await test.step(
                    this.workerInfo.project.name + ": Click element " + cartLocators.cart_clear,
                    async () => {
                        await this.page.locator(cartLocators.cart_clear).click();
                        await this.page.waitForLoadState('networkidle');
                        await this.page.waitForLoadState('domcontentloaded');
                        await test.step(
                            this.workerInfo.project.name + ": Verify element is visible [aria-label='Are you sure?']",
                            async () => expect(await this.page.locator("[aria-label='Are you sure?']").isVisible()).toBe(true)
                        );
                        await test.step(
                            this.workerInfo.project.name + ": Click element [aria-label='Are you sure?']>>.btn>>nth=0",
                            async () => await this.page.locator("[aria-label='Are you sure?']>>.btn>>nth=0").click()
                        );
                        await this.page.waitForLoadState('networkidle');
                        await this.page.waitForLoadState('domcontentloaded');
                    }
                );
            });
    }

    async clickProceedToCheckout() {
        await test.step(
            this.workerInfo.project.name + ": Proceed to checkout ",
            async () => {
                await this.page.locator(cartLocators.checkout_button).click();
                await this.page.waitForLoadState("domcontentloaded");
            });
    }

}
