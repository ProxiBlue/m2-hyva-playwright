import { Page, TestInfo, expect } from "@playwright/test";
import AdminProductsPage from "./products.page";
import * as locators from "../locators/product.custom_options.locator";

/**
 * Admin Product Custom Options Page
 * Specialized page object for managing custom options with qty limits
 * Composes with AdminProductsPage for common product management functions
 */
export default class AdminProductCustomOptionsPage {
    // Compose with AdminProductsPage for common product functions
    public productsPage: AdminProductsPage;

    constructor(
        public page: Page,
        public workerInfo: TestInfo,
        adminProductsPage: AdminProductsPage
    ) {
        this.productsPage = adminProductsPage;
    }

    /**
     * Navigate to Custom Options tab
     */
    async navigateToCustomOptionsTab() {
        // Wait for the custom options tab to be visible
        const customOptionsTab = this.page.locator(locators.custom_options_tab);
        await customOptionsTab.waitFor({ state: 'visible' });
        await customOptionsTab.click();

        await this.page.waitForTimeout(1500);

        // Wait for "Add Option" button which indicates the tab content loaded
        await this.page.waitForSelector(locators.add_option_button, { state: 'visible', timeout: 10000 });
    }

    /**
     * Add a new custom option
     */
    async addCustomOption() {
        await this.page.click(locators.add_option_button);
        // Wait longer for Magento UI components to fully initialize
        await this.page.waitForTimeout(3000);
    }

    /**
     * Select option type (field, area, file, drop_down, radio, checkbox, multiple, date, date_time, time)
     */
    async selectOptionType(optionType: string) {
        // Wait a bit for the option to be added to DOM
        await this.page.waitForTimeout(3000);

        // Magento uses a custom UI component for the dropdown, not a standard select
        // Find the visible dropdown button/trigger for "Option Type"
        const optionTypeButton = this.page.locator('text=-- Please select --').last();

        await optionTypeButton.waitFor({ state: 'visible', timeout: 10000 });

        // Click to open the dropdown menu
        await optionTypeButton.click();
        await this.page.waitForTimeout(500);

        // Map option type to display text
        const optionTypeMap: Record<string, string> = {
            'field': 'Field',
            'area': 'Area',
            'file': 'File',
            'drop_down': 'Drop-down',
            'radio': 'Radio Buttons',
            'checkbox': 'Checkbox',
            'multiple': 'Multiple Select',
            'date': 'Date',
            'date_time': 'Date & Time',
            'time': 'Time'
        };

        const displayText = optionTypeMap[optionType] || optionType;

        // Click on the option from the dropdown menu
        const optionItem = this.page.locator(`text="${displayText}"`).last();
        await optionItem.waitFor({ state: 'visible', timeout: 5000 });
        await optionItem.click();

        await this.page.waitForTimeout(500);
    }

    /**
     * Fill option title
     */
    async fillOptionTitle(title: string, optionIndex: number = 0) {
        // If optionIndex is provided (backwards compatibility), use old behavior
        // Otherwise, default to filling the LAST option's title (most common use case)
        if (optionIndex !== 0) {
            const titleInputs = await this.page.locator(locators.option_title_input).all();
            if (titleInputs[optionIndex]) {
                await titleInputs[optionIndex].fill(title);
            }
            return;
        }

        // New behavior: scope to last custom option container
        const optionContainers = await this.page.locator(locators.custom_options_container).all();

        if (optionContainers.length === 0) {
            return;
        }

        const lastOptionContainer = optionContainers[optionContainers.length - 1];
        const titleInput = lastOptionContainer.locator(locators.option_title_input).first();

        await titleInput.scrollIntoViewIfNeeded();
        await titleInput.fill(title);
    }

    /**
     * Set option qty limit
     */
    async setOptionQtyLimit(qtyLimit: string, optionIndex: number = 0) {
        const qtyLimitInputs = await this.page.locator(locators.option_qty_limit_input).all();
        await qtyLimitInputs[optionIndex].scrollIntoViewIfNeeded();
        await qtyLimitInputs[optionIndex].fill(qtyLimit);
    }

    /**
     * Verify qty limit field is visible for an option
     */
    async verifyQtyLimitFieldVisible(optionIndex: number = 0) {
        const qtyLimitContainers = await this.page.locator(locators.option_qty_limit_container).all();

        // Scroll the field into view first
        await qtyLimitContainers[optionIndex].scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        await expect(qtyLimitContainers[optionIndex]).toBeVisible();
    }

    /**
     * Verify qty limit field label text
     */
    async verifyQtyLimitLabel(expectedText: string) {
        const label = await this.page.locator(locators.option_qty_limit_label).first();
        await expect(label).toContainText(expectedText);
    }

    /**
     * Add an option value (for dropdown, radio, checkbox, multiple)
     */
    async addOptionValue() {
        // Find the LAST custom option container (the one we're currently working with)
        const optionContainers = await this.page.locator(locators.custom_options_container).all();

        if (optionContainers.length === 0) {
            return;
        }

        const lastOptionContainer = optionContainers[optionContainers.length - 1];

        // Try to find "Add Value" button by text within the last option container
        const addValueButton = lastOptionContainer.locator('button:has-text("Add Value")').first();
        const buttonByTextExists = await addValueButton.count();

        if (buttonByTextExists === 0) {
            // Fallback: try finding any button within a values container
            const fallbackButton = lastOptionContainer.locator('[data-index="values"] button').first();
            const fallbackExists = await fallbackButton.count();

            if (fallbackExists > 0) {
                await fallbackButton.scrollIntoViewIfNeeded();
                await fallbackButton.click();
                await this.page.waitForTimeout(1500);
                return;
            }

            return;
        }

        await addValueButton.scrollIntoViewIfNeeded();
        await addValueButton.click();
        await this.page.waitForTimeout(1500); // Wait for Magento UI to create the value row
    }

    /**
     * Fill option value title
     */
    async fillOptionValueTitle(title: string, valueIndex: number = 0) {
        // Wait for Magento UI components to initialize
        await this.page.waitForTimeout(2000);

        // Find the LAST custom option container (the one we're currently working with)
        const optionContainers = await this.page.locator(locators.custom_options_container).all();

        if (optionContainers.length === 0) {
            return;
        }

        const lastOptionContainer = optionContainers[optionContainers.length - 1];

        // Within the last option container, find the values container
        const valuesContainer = lastOptionContainer.locator(locators.option_values_container).first();

        // Find all title inputs within this specific values container
        const titleInputs = await valuesContainer.locator('input[name*="[title]"]').all();

        if (titleInputs.length === 0 || !titleInputs[valueIndex]) {
            return;
        }

        await titleInputs[valueIndex].scrollIntoViewIfNeeded();
        await titleInputs[valueIndex].fill(title);
        await this.page.waitForTimeout(300);
    }

    /**
     * Set option value qty limit
     */
    async setOptionValueQtyLimit(qtyLimit: string, valueIndex: number = 0) {
        // Scope to the last custom option container
        const optionContainers = await this.page.locator(locators.custom_options_container).all();

        if (optionContainers.length === 0) return;

        const lastOptionContainer = optionContainers[optionContainers.length - 1];
        const valueQtyLimitInputs = await lastOptionContainer.locator(locators.value_qty_limit_input).all();

        if (valueQtyLimitInputs[valueIndex]) {
            await valueQtyLimitInputs[valueIndex].scrollIntoViewIfNeeded();
            await valueQtyLimitInputs[valueIndex].fill(qtyLimit);
        }
    }

    /**
     * Verify option value qty limit field is visible
     */
    async verifyValueQtyLimitFieldVisible(valueIndex: number = 0) {
        const valueQtyLimitContainer = this.page.locator(locators.value_qty_limit_container).nth(valueIndex);
        await expect(valueQtyLimitContainer).toBeVisible();
    }

    /**
     * Get option qty limit value
     */
    async getOptionQtyLimitValue(optionIndex: number = 0): Promise<string> {
        const qtyLimitInputs = await this.page.locator(locators.option_qty_limit_input).all();
        return await qtyLimitInputs[optionIndex].inputValue();
    }

    /**
     * Get option value qty limit value
     */
    async getOptionValueQtyLimitValue(valueIndex: number = 0): Promise<string> {
        // Scope to the last custom option container
        const optionContainers = await this.page.locator(locators.custom_options_container).all();

        if (optionContainers.length === 0) {
            return '';
        }

        const lastOptionContainer = optionContainers[optionContainers.length - 1];
        const valueQtyLimitInputs = await lastOptionContainer.locator(locators.value_qty_limit_input).all();

        if (!valueQtyLimitInputs[valueIndex]) {
            return '';
        }

        return await valueQtyLimitInputs[valueIndex].inputValue();
    }

    /**
     * Count custom options on product
     */
    async getCustomOptionsCount(): Promise<number> {
        return await this.page.locator(locators.custom_options_container).count();
    }

    /**
     * Delete a custom option by index
     */
    async deleteCustomOption(optionIndex: number) {
        // Get initial count for verification
        const initialCount = await this.getCustomOptionsCount();

        // Get all custom option containers
        const optionContainers = await this.page.locator('[data-index="container_option"]').all();

        if (!optionContainers[optionIndex]) {
            console.log(`Option container not found for index ${optionIndex}`);
            return;
        }

        // The trash icon is on the right side of the collapsible header
        // Try direct SVG/icon click or parent button
        const selectors = [
            // SVG trash icon or its parent
            'svg[class*="trash"]',
            'svg[class*="delete"]',
            'svg[class*="remove"]',
            // Action classes
            '.action-remove',
            '.action-delete',
            // Any clickable in the title with trash/delete
            '[class*="title"] [class*="trash"]',
            '[class*="title"] [class*="delete"]',
            '[class*="title"] [class*="remove"]',
            // Last button in header (usually delete)
            '[data-index="header"] button:last-of-type',
            // Magento UI component patterns
            'button[data-index="button_remove"]'
        ];

        // Try JavaScript-based deletion as last resort
        const deleted = await this.page.evaluate((index) => {
            const containers = document.querySelectorAll('[data-index="container_option"]');
            if (!containers[index]) return false;

            // Find delete button - try multiple approaches
            let deleteBtn = containers[index].querySelector('[data-index="button_remove"]');
            if (!deleteBtn) {
                deleteBtn = containers[index].querySelector('.action-remove, .action-delete');
            }
            if (!deleteBtn) {
                // Look for trash icon's parent button
                const trashIcon = containers[index].querySelector('svg, [class*="icon"]');
                if (trashIcon) {
                    deleteBtn = trashIcon.closest('button');
                }
            }

            if (deleteBtn) {
                deleteBtn.click();
                return true;
            }
            return false;
        }, optionIndex);

        if (!deleted) {
            console.log(`Could not find or click delete button for option ${optionIndex} via JavaScript`);
            return;
        }

        console.log(`Clicked delete button for option ${optionIndex} via JavaScript`);
        await this.page.waitForTimeout(500);

        // Handle confirmation modal if it appears
        const confirmButton = this.page.locator('.modal-footer button.action-primary, .modal-footer button.action-accept, button.action-accept');
        const isModalVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);

        if (isModalVisible) {
            await confirmButton.click();
            await this.page.waitForTimeout(1000);
        }

        // Wait for the option count to decrease
        try {
            await this.page.waitForFunction(
                (expected) => {
                    const containers = document.querySelectorAll('[data-index="container_option"]');
                    return containers.length < expected;
                },
                initialCount,
                { timeout: 5000 }
            );
        } catch (e) {
            console.log(`Warning: Option count did not decrease after delete. Initial: ${initialCount}, Current: ${await this.getCustomOptionsCount()}`);
        }
    }

    /**
     * Expand/collapse custom option panel
     */
    async toggleOptionPanel(optionIndex: number) {
        const panels = await this.page.locator('[data-index="container_option"] .admin__collapsible-title').all();
        if (panels[optionIndex]) {
            await panels[optionIndex].click();
            await this.page.waitForTimeout(300);
        }
    }

    /**
     * Set option as required
     */
    async setOptionRequired(optionIndex: number, required: boolean = true) {
        const checkboxes = await this.page.locator(locators.option_is_required_checkbox).all();
        if (checkboxes[optionIndex]) {
            const isChecked = await checkboxes[optionIndex].isChecked();
            if ((required && !isChecked) || (!required && isChecked)) {
                await checkboxes[optionIndex].click();
            }
        }
    }

    /**
     * Complete workflow: Add custom option with qty limit to a product
     * Uses common product functions for navigation
     */
    async addCustomOptionWithQtyLimit(
        productSku: string,
        optionTitle: string,
        optionType: string,
        qtyLimit: string
    ) {
        // Use common product page functions
        await this.productsPage.navigateToProducts();
        await this.productsPage.searchProduct(productSku);
        await this.productsPage.editFirstProduct();

        // Custom options specific
        await this.navigateToCustomOptionsTab();
        await this.addCustomOption();
        await this.selectOptionType(optionType);
        await this.fillOptionTitle(optionTitle);
        await this.setOptionQtyLimit(qtyLimit);

        // Use common save function
        await this.productsPage.saveAndContinueEdit();
    }

    /**
     * Complete workflow: Add dropdown/radio/checkbox option with value qty limits
     */
    async addOptionWithValueQtyLimits(
        productSku: string,
        optionTitle: string,
        optionType: string,
        values: Array<{ title: string; qty_limit: string }>
    ) {
        await this.productsPage.openProductForEdit(productSku);
        await this.navigateToCustomOptionsTab();

        await this.addCustomOption();
        await this.selectOptionType(optionType);
        await this.fillOptionTitle(optionTitle);

        for (let i = 0; i < values.length; i++) {
            await this.addOptionValue();
            await this.fillOptionValueTitle(values[i].title, i);

            if (values[i].qty_limit) {
                await this.setOptionValueQtyLimit(values[i].qty_limit, i);
            }
        }

        await this.productsPage.saveAndContinueEdit();
    }

    /**
     * Set up a dropdown custom option where ALL values have qty limits.
     * This deletes any existing custom options first to ensure clean state.
     * @param title The title for the dropdown option
     * @param values Array of values with title and qty_limit
     * @param required Whether the option should be required
     */
    async setupDropdownWithAllLimitedValues(
        title: string,
        values: Array<{ title: string; qty_limit: string }>,
        required: boolean = true
    ) {
        // Delete all existing custom options
        const existingCount = await this.getCustomOptionsCount();
        for (let i = existingCount - 1; i >= 0; i--) {
            await this.deleteCustomOption(i);
            await this.page.waitForTimeout(300);
        }

        // Add new dropdown option
        await this.addCustomOption();
        await this.selectOptionType('drop_down');
        await this.fillOptionTitle(title, 0);

        // Set required if specified
        if (required) {
            const requireCheckbox = this.page.locator('[data-index="is_require"] input[type="checkbox"]').first();
            await requireCheckbox.check();
        }

        // Add all values with their qty limits
        for (let i = 0; i < values.length; i++) {
            await this.addOptionValue();
            await this.fillOptionValueTitle(values[i].title, i);
            if (values[i].qty_limit) {
                await this.setOptionValueQtyLimit(values[i].qty_limit, i);
            }
        }

        // Save and continue editing to persist changes
        await this.productsPage.saveAndContinueEdit();

        // Wait for save to complete and verify
        await this.page.waitForTimeout(2000);

        // Re-navigate to custom options tab to verify save
        await this.navigateToCustomOptionsTab();
        const savedCount = await this.getCustomOptionsCount();

        if (savedCount !== 1) {
            throw new Error(`Expected 1 custom option after save, but found ${savedCount}`);
        }
    }
}
