import CheckoutPage from "@checkout/pages/checkout.page";
import type {Page, TestInfo} from "@playwright/test";
import {expect} from "@luma/fixtures";
import * as locators from "@checkout/locators/checkout.locator";
import * as pageLocators from "@luma/locators/page.locator"

export default class LumaCheckoutPage extends CheckoutPage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo ); // pass the data and locators to teh base page class
    }

    async selectShippingMethod() {
        // shipperHQ must be disabled by setting flatrate enabled, setting it as fallback and setting timeout to 0
        await this.page.waitForTimeout(5000);
        await this.page.getByLabel('Fixed').check()
        await this.page.locator(locators.shipping_next_button).click();
    }


    async testSuccessPage() : Promise<string> {
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
        await this.page.waitForSelector(pageLocators.pageTitle);
        // Handle both data structures: with and without 'default' property
        const successPageHeading = this.data.default?.success_page_heading || this.data.success_page_heading;
        expect(this.page.locator(pageLocators.pageTitle)).toHaveText(successPageHeading);
        const orderId = await this.page.locator(locators.success_order_id).first().textContent();
        //@ts-ignore
        return orderId;
    }

}
