import ProductPage from "@hyva/pages/product.page";
import { Page, TestInfo, expect, test } from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/product.locator";
import * as cartLocators from "@hyva/locators/cart.locator";
import * as configLocators from "@hyva/locators/configurable_product.locator";


// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exists in APP path, and if not default to the base data
let data: { default: { configurable_url?: string; name?: string } } = { default: {} };
// Load data synchronously to ensure it's available when needed
const fs = require("fs");
try {
    let dataPath;
    if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/configurable_product.data.json')) {
        dataPath = __dirname + '/../../' + process.env.APP_NAME + '/data/configurable_product.data.json';
    } else {
        dataPath = __dirname + '/../data/configurable_product.data.json';
    }
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(jsonData);
    // Ensure data has a default property
    if (!data.default) {
        // @ts-ignore
        data = { default: data };
    }
} catch (error) {
    // Error loading configurable product data
}

export default class ConfigurableProductPage extends ProductPage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to the base page class
    }

    /**
     * Helper method to remove price information from option text
     *
     * This is needed because on the product page, option values might include price adjustments
     * (e.g., "RT - Rate & Totalizer + $240.00"), but in the cart, only the option name is displayed
     * without the price (e.g., "RT - Rate & Totalizer").
     *
     * @param optionText The option text that might include price information
     * @returns The option text without price information
     */
    private removePriceFromOptionText(optionText: string): string {
        // Remove price patterns like "+ $X.XX" or "- $X.XX"
        // This regex matches:
        // \s* - any number of whitespace characters
        // [\+\-] - either a plus or minus sign
        // \s* - any number of whitespace characters
        // \$ - a dollar sign
        // \d+\.\d+ - one or more digits, followed by a decimal point, followed by one or more digits
        const cleanedText = optionText.replace(/\s*[\+\-]\s*\$\d+\.\d+/g, '').trim();

        // No need to log price information removal

        return cleanedText;
    }

    async navigateTo() {
        const url = data.default.configurable_url || '';
        await actions.navigateTo(this.page, process.env.URL + url, this.workerInfo);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async addToCartWithoutConfiguration() {
        await test.step(
            this.workerInfo.project.name + ": Add configurable product to cart without configuration",
            async () => {
                await this.page.locator(locators.product_add_to_cart_button).click();
                await this.page.waitForSelector(configLocators.invalid_element);
                const invalidElements = this.page.locator(configLocators.invalid_element);
                const count = await invalidElements.count();
                expect(count).toBeGreaterThan(0);
            }
        );
    }

    /**
     * Get attribute labels for all configurable attributes
     * @returns A map of attribute IDs to their labels
     */
    async getAttributeLabels(): Promise<{ [key: string]: string }> {
        const attributeLabels: { [key: string]: string } = {};

        // Find all super-attribute-select elements
        const selectElements = this.page.locator(configLocators.super_attribute_select);
        const count = await selectElements.count();

        // Loop through each select element and get its label
        for (let i = 0; i < count; i++) {
            const select = selectElements.nth(i);
            const attributeId = await select.getAttribute('id') || '';

            // Get the label for this attribute
            // The label is in a parent element with class 'label'
            const labelElement = select.locator('xpath=../../..//label[@for="' + attributeId + '"]');
            if (await labelElement.count() > 0) {
                const labelText = await labelElement.textContent() || '';
                // Store the attribute label
                attributeLabels[attributeId] = labelText.trim();
            }
        }

        return attributeLabels;
    }

    async selectProductAttributes() {
        await test.step(
            this.workerInfo.project.name + ": Select product attributes",
            async () => {
                // Find all super-attribute-select elements
                const selectElements = this.page.locator(configLocators.super_attribute_select);
                const count = await selectElements.count();

                // Store selected options for verification in cart
                const selectedOptions: { [key: string]: string } = {};

                // Get attribute labels for later verification
                const attributeLabels = await this.getAttributeLabels();
                this.attributeLabels = attributeLabels;

                // Loop through each select element and choose a random option
                for (let i = 0; i < count; i++) {
                    const select = selectElements.nth(i);
                    const attributeId = await select.getAttribute('id');

                    // Get all options except the first one (which is usually "Choose an Option...")
                    const options = select.locator('option:not(:first-child)');
                    const optionsCount = await options.count();

                    if (optionsCount > 0) {
                        // Choose a random option index
                        const randomIndex = Math.floor(Math.random() * optionsCount);
                        const option = options.nth(randomIndex);

                        // Get the option text and value for verification later
                        const optionText = await option.textContent() || '';
                        const optionValue = await option.getAttribute('value') || '';

                        // Remove price information from option text before storing
                        const cleanedOptionText = this.removePriceFromOptionText(optionText);

                        // Store the selected option without price information
                        selectedOptions[attributeId || ''] = cleanedOptionText;

                        // Select the option
                        await select.selectOption({ index: randomIndex + 1 }); // +1 because we're skipping the first option
                    }
                }

                // Store the selected options for later verification
                this.selectedOptions = selectedOptions;

            }
        );
    }

    async selectProductSwatch() {
        await test.step(
            this.workerInfo.project.name + ": Select product swatch",
            async () => {
                // Add a timeout for the entire operation
                const MAX_EXECUTION_TIME = 20000; // 20 seconds
                const startTime = Date.now();
                // Find all swatch attribute containers
                const swatchContainers = this.page.locator(configLocators.swatch_attribute_container);
                const containerCount = await swatchContainers.count();

                // Store selected options for verification in cart
                const selectedOptions: { [key: string]: string } = {};
                // Store attribute labels for later verification
                const attributeLabels: { [key: string]: string } = {};

                // Loop through each swatch attribute container
                for (let i = 0; i < containerCount; i++) {
                    // Check if we've exceeded the maximum execution time
                    if (Date.now() - startTime > MAX_EXECUTION_TIME) {
                        console.warn(`selectProductSwatch exceeded maximum execution time of ${MAX_EXECUTION_TIME}ms. Stopping after processing ${i} of ${containerCount} containers.`);
                        break;
                    }

                    const container = swatchContainers.nth(i);

                    // Get the attribute label from the container's class
                    let attributeLabel = '';
                    const containerClass = await container.getAttribute('class') || '';
                    const classMatch = containerClass.match(/swatch-attribute\s+[\w-]*\s+([\w-]+)/);
                    if (classMatch && classMatch[1]) {
                        attributeLabel = classMatch[1].charAt(0).toUpperCase() + classMatch[1].slice(1);
                    } else {
                        // If all else fails, use a generic label
                        attributeLabel = `Option ${i+1}`;
                        console.log(`Using generic attribute label: ${attributeLabel}`);
                    }

                    // Get all enabled and active swatch options (labels containing radio inputs)
                    const swatchOptions = container.locator(configLocators.swatch_option_label);
                    const optionsCount = await swatchOptions.count();

                    if (optionsCount > 0) {
                        // Choose a random option index
                        const randomIndex = Math.floor(Math.random() * optionsCount);
                        // Get the option label at the random index
                        const optionLabel = swatchOptions.nth(randomIndex);

                        // Get the input element inside the label
                        const option = optionLabel.locator('input[type="radio"]');

                        // Get the option text and ID
                        const optionText = await option.getAttribute('aria-label') || `Option ${randomIndex + 1}`;
                        const optionId = await option.getAttribute('id') || `option-${i}-${randomIndex}`;

                        // Store the selected option with attribute label as key for verification
                        selectedOptions[attributeLabel] = optionText;
                        // Store the attribute label with option ID as key
                        attributeLabels[optionId] = attributeLabel;

                        // Check if we've exceeded the maximum execution time before attempting to click
                        if (Date.now() - startTime > MAX_EXECUTION_TIME) {
                            console.warn(`selectProductSwatch exceeded maximum execution time of ${MAX_EXECUTION_TIME}ms before clicking option for ${attributeLabel}. Skipping click.`);
                            continue;
                        }

                        // Get the option ID to create a valid selector
                        const optionIdForSelector = await option.getAttribute('id');

                        if (optionIdForSelector) {
                            // Click the option using JavaScript with a valid ID selector
                            await this.page.evaluate((selector) => {
                                const element = document.querySelector(selector);
                                if (element) {
                                    element.dispatchEvent(new MouseEvent('click', {
                                        bubbles: true,
                                        cancelable: true,
                                        view: window
                                    }));
                                }
                            }, `#${optionIdForSelector}`);
                        } else {
                            // Fallback to direct click if we can't get the ID
                            try {
                                await optionLabel.click({ force: true, timeout: 5000 });
                            } catch (error: any) {
                                console.warn(`Failed to click swatch option: ${error.message}`);
                            }
                        }

                        // Wait a short time after clicking to allow the UI to update
                        await this.page.waitForTimeout(100);
                    }
                }

                // Store the selected options and attribute labels for later verification
                this.selectedOptions = selectedOptions;
                this.attributeLabels = attributeLabels;

                // Log a warning if we didn't select any options
                if (Object.keys(selectedOptions).length === 0) {
                    console.warn('No swatch options were selected. This might cause issues later in the test.');
                } else {
                    console.log(`Successfully selected ${Object.keys(selectedOptions).length} swatch options:`, selectedOptions);
                }
            }
        );
    }


    // Properties to store selected options and attribute labels
    private selectedOptions: { [key: string]: string } = {};
    private attributeLabels: { [key: string]: string } = {};

    /**
     * Get the selected options
     * @returns The selected options
     */
    getSelectedOptions() {
        return this.selectedOptions;
    }

    /**
     * Verify that the selected options appear in the cart
     */
    async verifyOptionsInCart() {
        await test.step(
            this.workerInfo.project.name + ": Verify selected options in cart",
            async () => {
                // Navigate to the cart page
                await this.page.goto(process.env.URL + '/checkout/cart');
                await this.page.waitForLoadState('domcontentloaded');

                // Get the item info element
                const itemInfo = this.page.locator(cartLocators.cart_row_item_info).first();

                // Check if the item is in the cart
                expect(await itemInfo.isVisible()).toBeTruthy();

                // Get all option labels and values from the cart
                const optionLabels = itemInfo.locator(cartLocators.cart_item_option_label);
                const optionValues = itemInfo.locator(cartLocators.cart_item_option_value);

                const labelsCount = await optionLabels.count();
                const valuesCount = await optionValues.count();

                // Ensure we have the same number of labels and values
                expect(labelsCount).toEqual(valuesCount);

                // Create a map of option labels to values from the cart
                const cartOptions: { [key: string]: string } = {};
                for (let i = 0; i < labelsCount; i++) {
                    const label = await optionLabels.nth(i).textContent() || '';
                    const value = await optionValues.nth(i).textContent() || '';

                    // Remove the colon from the label if present
                    const cleanLabel = label.replace(':', '').trim();
                    cartOptions[cleanLabel] = value.trim();
                }

                // No debug logging needed

                // Check if each selected option value is in the cart options
                for (const [attributeId, optionValue] of Object.entries(this.selectedOptions)) {
                    // Get the attribute label from the attribute ID (e.g., "attribute425" -> "Model Number")
                    const attributeLabel = this.attributeLabels[attributeId] || '';

                    // Clean up the attribute label (remove ":" and any extra spaces)
                    const cleanAttributeLabel = attributeLabel.replace(/:/g, '').trim();

                    // Check if this attribute label exists in the cart options
                    if (cleanAttributeLabel && cartOptions[cleanAttributeLabel]) {
                        // Get the cart option value for this attribute
                        const cartOptionValue = cartOptions[cleanAttributeLabel];

                        // Normalize both strings for comparison
                        // 1. Trim whitespace
                        // 2. Convert to lowercase
                        // 3. Replace multiple whitespace with a single space
                        // 4. Remove any non-alphanumeric characters except spaces
                        const normalizedCartValue = cartOptionValue.trim().toLowerCase()
                            .replace(/\s+/g, ' ')
                            .replace(/[^\w\s]/g, '');
                        const normalizedOptionValue = optionValue.trim().toLowerCase()
                            .replace(/\s+/g, ' ')
                            .replace(/[^\w\s]/g, '');

                        // No debug logging needed for string comparison

                        // First check for exact equality after normalization
                        let isMatch = normalizedCartValue === normalizedOptionValue;

                        // If not an exact match, check if one contains the other
                        if (!isMatch) {
                            isMatch = normalizedCartValue.includes(normalizedOptionValue) ||
                                     normalizedOptionValue.includes(normalizedCartValue);
                        }

                        // No debug logging needed for mismatches

                        expect(isMatch,
                            `Option value mismatch for attribute "${cleanAttributeLabel}": ` +
                            `Selected "${optionValue}" but found "${cartOptionValue}" in cart`
                        ).toBeTruthy();
                    } else {
                        // If the attribute label doesn't exist in the cart options, fall back to checking all values

                        // Check if any of the cart option values match this selected option
                        let foundInCart = false;

                        Object.values(cartOptions).forEach(cartValue => {
                            // Normalize both strings for comparison
                            // 1. Trim whitespace
                            // 2. Convert to lowercase
                            // 3. Replace multiple whitespace with a single space
                            // 4. Remove any non-alphanumeric characters except spaces
                            const normalizedCartValue = cartValue.trim().toLowerCase()
                                .replace(/\s+/g, ' ')
                                .replace(/[^\w\s]/g, '');
                            const normalizedOptionValue = optionValue.trim().toLowerCase()
                                .replace(/\s+/g, ' ')
                                .replace(/[^\w\s]/g, '');

                            // No debug info needed

                            // First check for exact equality after normalization
                            if (normalizedCartValue === normalizedOptionValue) {
                                foundInCart = true;
                                return;
                            }

                            // If not an exact match, check if one contains the other
                            if (normalizedCartValue.includes(normalizedOptionValue) ||
                                normalizedOptionValue.includes(normalizedCartValue)) {
                                foundInCart = true;
                                return;
                            }
                        });

                        // No debug logging needed for option value not found in cart

                        expect(foundInCart, `Option value "${optionValue}" not found in cart`).toBeTruthy();
                    }
                }
            }
        );
    }

}
