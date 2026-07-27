import BasePage from "@common/pages/base.page";
import { Page, TestInfo, expect, test } from "@playwright/test";
import * as locators from "@admin/locators/customer.locator";
import * as adminLocators from "@admin/locators/admin.locator";
import { loadJsonData } from "@utils/functions/file";

const data = loadJsonData('customer.data.json', 'admin', { "default": {} });

export default class AdminCustomerPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    private async waitForGridSpinner() {
        const gridSpinner = this.page.locator('.admin__data-grid-loading-mask');
        try {
            const visible = await gridSpinner.isVisible();
            if (visible) {
                await gridSpinner.waitFor({ state: 'hidden', timeout: 30000 });
            }
        } catch (e) {
            // spinner may not be present
        }
    }

    async navigateTo() {
        const customersListItem = this.page.locator(locators.customers_list_item);
        const customersLink = customersListItem.locator('a');
        const hrefValue = await customersLink.getAttribute('href');
        await test.step(
            this.workerInfo.project.name + ": Go to " + hrefValue,
            async () => {
                await this.page.goto(hrefValue ?? '');
                await this.page.waitForLoadState('domcontentloaded');
                await this.waitForGridSpinner();
            }
        );
    }

    async openCustomerByEmail(email: string) {
        await test.step(
            this.workerInfo.project.name + ": Open customer by email " + email,
            async () => {
                await this.navigateTo();

                // Clear any leftover filters from prior sessions (ui_bookmark persists per admin user)
                const removeFilter = this.page.locator(locators.remove_filter_button).first();
                if (await removeFilter.isVisible().catch(() => false)) {
                    await removeFilter.click();
                    await this.waitForGridSpinner();
                }

                const searchInput = this.page.locator(adminLocators.admin_grid_search).first();
                await searchInput.waitFor({ state: 'visible', timeout: 15000 });
                await searchInput.fill(email);
                // Magento's data-grid keyword search fires on Enter; a button click alone
                // isn't always picked up by its JS handler.
                await searchInput.press('Enter');

                await this.waitForGridSpinner();
                await this.page.waitForLoadState('networkidle');

                const row = this.page.locator('.data-grid tbody tr').filter({ hasText: email }).first();
                await expect(row, `Customer row for ${email} must be visible`).toBeVisible({ timeout: 15000 });
                // Action column "Edit" link carries the URL with the secret key
                await row.locator('a[href*="customer/index/edit"]').first().click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForLoadState('networkidle');
            }
        );
    }

    async setCustomerGroup(groupId: number) {
        await test.step(
            this.workerInfo.project.name + ": Set customer group to " + groupId,
            async () => {
                // Default landing tab is "Customer View" (read-only). Open Account Information to edit the group.
                await this.page.getByRole('link', { name: 'Account Information' }).first().click();
                const groupSelect = this.page.locator(locators.customer_group_select).first();
                await groupSelect.waitFor({ state: 'visible', timeout: 15000 });
                await groupSelect.selectOption(String(groupId));

                const saveBtn = this.page.locator(locators.customer_save_button).first();
                await saveBtn.click();

                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForLoadState('networkidle');
                await expect(this.page.locator(locators.success_message).first(), 'Customer save success message').toBeVisible({ timeout: 30000 });
            }
        );
    }

    async setCustomerGroupByEmail(email: string, groupId: number) {
        await this.openCustomerByEmail(email);
        await this.setCustomerGroup(groupId);
    }
}
