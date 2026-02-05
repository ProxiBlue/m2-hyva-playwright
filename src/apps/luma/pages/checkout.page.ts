import CheckoutPage from "@checkout/pages/checkout.page";
import type { Page, TestInfo } from "@playwright/test";
import { expect } from "@luma/fixtures";
import * as locators from "@checkout/locators/checkout.locator";
import { loadLocators } from "@utils/functions/file";

// Load Luma-specific page locators
const pageLocators = loadLocators('locators/page.locator', 'luma');

export default class LumaCheckoutPage extends CheckoutPage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo);
    }

    async selectShippingMethod() {
        // Wait for shipping methods to load (Luma uses KnockoutJS which can be slow)
        await this.page.waitForTimeout(3000);
        // Try flat rate first, fall back to any available method
        const flatRate = this.page.getByLabel('Fixed');
        if (await flatRate.isVisible()) {
            await flatRate.check();
        } else {
            // Select first available shipping method
            const firstMethod = this.page.locator('input[name="ko_unique_1"]').first();
            if (await firstMethod.isVisible()) {
                await firstMethod.check();
            }
        }
        await this.page.locator(locators.shipping_next_button).click();
    }

    async testSuccessPage(): Promise<string> {
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
        await this.page.waitForSelector(pageLocators.pageTitle);
        const successPageHeading = this.data.default?.success_page_heading || this.data.success_page_heading || 'Thank you for your purchase!';
        await expect(this.page.locator(pageLocators.pageTitle)).toHaveText(successPageHeading);
        const orderId = await this.page.locator(locators.success_order_id).first().textContent();
        return orderId ?? "";
    }
}
