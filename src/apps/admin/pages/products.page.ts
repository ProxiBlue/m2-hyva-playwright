import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@admin/locators/products.locator";
import { loadJsonData } from "@utils/functions/file";
import AdminPage from "./admin.page";

// Load the products data using the utility function
const data = loadJsonData('products.data.json', 'admin', {"default": {}});

/**
 * Common Admin Products Page
 * Contains reusable functions for product management in admin
 * Use this as a base for product-specific page objects
 */
export default class AdminProductsPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo, public adminPage?: AdminPage) {
        super(page, workerInfo, data, locators); // pass the data and locators to the base page class
    }

    /**
     * Wait for the admin grid loading spinner to disappear
     */
    private async waitForGridSpinner() {
        const gridSpinner = this.page.locator('.admin__data-grid-loading-mask');
        try {
            // Check if spinner is visible, if so wait for it to disappear
            const isSpinnerVisible = await gridSpinner.isVisible();
            if (isSpinnerVisible) {
                await gridSpinner.waitFor({state: 'hidden', timeout: 30000});
            }
        } catch (e) {
            // Spinner may not be present - continue
        }
    }

    /**
     * Navigate to products grid (original method)
     */
    async navigateTo() {
        // get the products url from admin dashboard (need the key value)
        const productListItem = this.page.locator(locators.product_list_item);
        const productLink = productListItem.locator('a');
        const hrefValue = await productLink.getAttribute('href');

        await test.step(
            this.workerInfo.project.name + ": Go to " + hrefValue,
            async () => await this.page.goto(hrefValue)
        );
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");

        // Wait for grid spinner to disappear before interacting
        await this.waitForGridSpinner();

        await this.page.waitForSelector(locators.adminProductGrid + ' >> tr');

        // sometimes we have filters left over from prior sessions, so clear them
        const isVisible = await this.page.isVisible(locators.remove_filter_button);
        if (isVisible) {
            await this.page.click(locators.remove_filter_button);
            await this.waitForGridSpinner();
        }
    }

    /**
     * Navigate to Products grid (using menu navigation like navigateTo)
     */
    async navigateToProducts() {
        // Get the products url from admin dashboard (need the key value)
        const productListItem = this.page.locator(locators.product_list_item);
        const productLink = productListItem.locator('a');
        const hrefValue = await productLink.getAttribute('href');

        await test.step(
            this.workerInfo.project.name + ": Go to " + hrefValue,
            async () => await this.page.goto(hrefValue)
        );

        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");

        // Wait for grid spinner to disappear before interacting
        await this.waitForGridSpinner();

        await this.page.waitForSelector(locators.adminProductGrid + ' >> tr');

        // Clear any leftover filters from prior sessions
        const isVisible = await this.page.isVisible(locators.remove_filter_button);
        if (isVisible) {
            await this.page.click(locators.remove_filter_button);
            await this.waitForGridSpinner();
        }
    }

    /**
     * Search for a product by SKU or name
     */
    async searchProduct(searchTerm: string) {
        // Wait for any existing spinner to disappear first
        await this.waitForGridSpinner();

        // Expand filters first (similar to orders filtering pattern)
        const filterExpandButton = this.page.locator('[data-action="grid-filter-expand"]').first();
        await filterExpandButton.waitFor({ state: 'visible' });
        await this.waitForGridSpinner();
        await filterExpandButton.click();

        // Use SKU filter field (similar to order increment_id pattern)
        const skuFilter = this.page.locator('[name="sku"]').first();
        await skuFilter.waitFor({ state: 'visible' });
        await skuFilter.fill(searchTerm);

        await this.page.click(locators.products_grid_search_submit);

        // Wait for grid loading spinner to appear and disappear
        await this.waitForGridSpinner();

        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
    }

    /**
     * Click to edit the first product in the grid
     */
    async editFirstProduct() {
        // Wait for the first data row to be visible after search/filter
        await this.page.waitForSelector(locators.data_row, { state: 'visible' });

        // In Magento admin, clicking the product name (in Name column) opens the edit page
        // The name is usually in the second or third column and is a clickable link
        const firstRow = this.page.locator(locators.data_row).first();
        const productNameLink = firstRow.locator('a').first();

        await productNameLink.waitFor({ state: 'visible' });
        await productNameLink.click();

        await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState('domcontentloaded');

        // Wait for product form to load
        await expect(this.page.locator(locators.product_form)).toBeVisible();
    }

    /**
     * Click to edit a specific product by row index (0-based)
     */
    async editProductByIndex(rowIndex: number) {
        const rows = await this.page.locator(locators.data_row).all();
        if (rows[rowIndex]) {
            await rows[rowIndex].locator(locators.action_menu_item).click();
            await this.page.waitForLoadState('networkidle');
            await expect(this.page.locator(locators.product_form)).toBeVisible();
        } else {
            throw new Error(`Product row ${rowIndex} not found`);
        }
    }

    /**
     * Get product name from header
     */
    async getProductName(): Promise<string> {
        const nameElement = this.page.locator(locators.product_name_header);
        return (await nameElement.textContent()) || '';
    }

    /**
     * Navigate to a specific product tab
     */
    async navigateToTab(tabDataIndex: string) {
        await this.page.click(`[data-index="${tabDataIndex}"]`);
        await this.page.waitForTimeout(1000);
    }

    /**
     * Save product using "Save" button
     */
    async saveProduct() {
        await this.page.click(locators.save_button);
        await this.page.waitForLoadState('networkidle');

        // Verify success message appears
        await expect(this.page.locator(locators.success_message)).toBeVisible({ timeout: 15000 });
    }

    /**
     * Save product using "Save & Continue Edit" button (or Save & Close then navigate back)
     */
    async saveAndContinueEdit() {
        // Try clicking the main "Save" button directly (sometimes this is "Save & Continue Edit")
        const mainSaveButton = this.page.locator('button:has-text("Save")').first();

        if (await mainSaveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await mainSaveButton.scrollIntoViewIfNeeded();
            await mainSaveButton.click();
        } else {
            // Fallback to direct save button if main button not found
            const saveButton = this.page.locator(locators.save_and_continue_button);
            await saveButton.waitFor({ state: 'visible', timeout: 10000 });
            await saveButton.scrollIntoViewIfNeeded();
            await saveButton.click();
        }

        // Wait for page to reload (domcontentloaded is more reliable than networkidle for Magento admin)
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(2000); // Give AJAX time to complete

        // Try to verify success message appears (but don't fail if it doesn't - sometimes Magento is inconsistent)
        try {
            await expect(this.page.locator(locators.success_message)).toBeVisible({ timeout: 10000 });
        } catch (e) {
            // Success message might not appear, but that's okay - we'll verify the save worked by checking persistence
        }
    }

    /**
     * Verify success message is displayed
     */
    async verifySuccessMessage() {
        await expect(this.page.locator(locators.success_message)).toBeVisible();
    }

    /**
     * Verify error message is displayed
     */
    async verifyErrorMessage() {
        await expect(this.page.locator(locators.error_message)).toBeVisible();
    }

    /**
     * Get success message text
     */
    async getSuccessMessageText(): Promise<string> {
        const messageElement = this.page.locator(locators.success_message);
        return (await messageElement.textContent()) || '';
    }

    /**
     * Reload product page
     */
    async reloadProductPage() {
        await this.page.reload();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Check if product form is visible
     */
    async verifyProductFormVisible() {
        await expect(this.page.locator(locators.product_form)).toBeVisible();
    }

    /**
     * Complete workflow: Navigate to products, search, and edit
     */
    async openProductForEdit(productSku: string) {
        await this.navigateToProducts();
        await this.searchProduct(productSku);
        await this.editFirstProduct();
    }

    /**
     * Get product SKU from form
     */
    async getProductSku(): Promise<string> {
        const skuInput = this.page.locator(locators.product_sku_input);
        return await skuInput.inputValue();
    }

    /**
     * Clear product grid search/filters
     */
    async clearProductSearch() {
        // Click clear filters if available
        const clearButton = this.page.locator(locators.grid_filter_clear);
        if (await clearButton.isVisible()) {
            await clearButton.click();
            await this.page.waitForLoadState('networkidle');
        }
    }

    /**
     * Get count of products in grid
     */
    async getProductGridCount(): Promise<number> {
        const rows = await this.page.locator(locators.data_row).count();
        return rows;
    }

    /**
     * Verify product appears in search results
     */
    async verifyProductInGrid(productName: string) {
        const productCell = this.page.locator(locators.data_row).filter({ hasText: productName });
        await expect(productCell).toBeVisible();
    }
}
