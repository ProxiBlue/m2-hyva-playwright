import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@hyva/locators/category.locator";
import * as productLocators from "@hyva/locators/product.locator";
import * as pageLocators from "@hyva/locators/page.locator";
import * as pageDataImport from "@hyva/data/page.data.json";
import { PageData } from "@hyva/interfaces/PageData";
import { CategoryData } from "@hyva/interfaces/CategoryData";
import { loadJsonData } from "@utils/functions/file";

const pageData = pageDataImport as unknown as PageData;

// Default category data structure
const defaultData: CategoryData = {
  default: {
    url: "",
    header_title: "",
    page_title_text: "",
    filter_heading: "",
    sorter_price: "",
    sorter_position: "",
    sorter_name: "",
    ascending: "",
    filters: {},
    limiter: [],
    breadcrumbs: [],
    grid_mode: "",
    list_mode: ""
  }
};

// Load the category data using the utility function
let data = loadJsonData<CategoryData>('category.data.json', 'hyva', defaultData);

// Ensure data has a default property
if (data && !data.default) {
  data = { default: data as any };
}

export default class CategoryPage extends BasePage<CategoryData> {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    /**
     * Helper method to trigger the compare functionality for a product
     * @param element The element handle for the compare button
     * @returns Promise<void>
     */
    async triggerCompareButton(element: any): Promise<void> {
        await this.page.evaluate((element) => {
            if (!element) {
                console.error('Compare button not found');
                return;
            }

            // Get the product ID from the passed element or its closest ancestor
            const productId = element.getAttribute('data-product-id') ||
                             element.closest('form')?.querySelector('input[name="product"]')?.value ||
                             element.closest('[data-product-id]')?.getAttribute('data-product-id');

            if (!productId) {
                console.error('Product ID not found');
                return;
            }

            // Approach 1: Extract and call the function from the click handler
            // This is the most direct and reliable approach
            const clickHandler = element.getAttribute('@click.prevent') || element.getAttribute('@click');
            if (clickHandler && clickHandler.includes('addToCompare')) {
                try {
                    // Extract the function call from the click handler
                    const functionCall = clickHandler.trim();
                    // Execute the function call directly
                    eval(functionCall);
                    return;
                } catch (e) {
                    console.error('Error executing click handler function:', e);
                }
            }

            // Approach 2: Find the Alpine.js component by x-data attribute pattern
            // This is a fallback if the click handler approach doesn't work
            const xDataAttr = element.getAttribute('x-data');
            if (xDataAttr && (xDataAttr.includes('initCompare') || xDataAttr.includes('initCompareOnProductList') || xDataAttr.includes('initCompareOnProductView'))) {
                // Extract the function name from x-data attribute
                const functionName = xDataAttr.replace('()', '');

                // Try to call the function directly
                try {
                    const initFunction = window[functionName];
                    if (typeof initFunction === 'function') {
                        const instance = initFunction();
                        if (instance && typeof instance.addToCompare === 'function') {
                            instance.addToCompare(parseInt(productId));
                            return;
                        }
                    }
                } catch (e) {
                    console.error('Error calling Alpine.js function:', e);
                }
            }

            // Fallback: Simple click as last resort
            element.click();
        }, element);
    }

    async checkFilter() {
        await test.step(
            this.workerInfo.project.name + ": Testing filters ",
            async () => {
                const filters = data.default.filters;
                let filter = '';
                let option = '';
                for (filter in filters) {
                    await this.checkFilterExists(filter);
                    for (option in (filters?.[filter] ?? {})) {
                        await this.checkFilterResults(filter, option, filters?.[filter]?.[option] ?? 0);
                    }
                }
            });
    }

    async checkFilterExists(filter: string) {
        await test.step(
            this.workerInfo.project.name + ": Check filter exists ",
            async () => {
                await expect(await this.page.getByRole('button', {name: filter + ' filter'})).toBeVisible();
            });
    }

    async checkFilterResults(filter: string, option: string, count: number) {
        await test.step(
            this.workerInfo.project.name + ": Check filter results ",
            async () => {
                const filterButton = await this.page.getByRole('button', {name: filter + ' filter'});
                const filterContainer = await this.page.locator('.filter-option', {has: filterButton});
                await filterButton.scrollIntoViewIfNeeded();
                await filterButton.click();
                await this.page.waitForLoadState('domcontentloaded');
                await expect(await filterContainer.getByRole('link', {name: option})).toBeVisible();
                const filterOption = await filterContainer.getByLabel(option);
                const attrClass = await filterOption.getAttribute('class')
                const elementClasses: string[] = attrClass ? attrClass.split(' ') : []
                const isSwatch = elementClasses.includes('swatch-option');
                let filterText = '';
                if (isSwatch) {
                    let filterText = option
                } else {
                    let filterText = await filterOption.allTextContents();
                }
                await filterOption.click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(locators.active_filtering_content)
                expect(await this.page.textContent(locators.active_filtering_content)).toContain(filterText);
                await expect(filterButton).not.toBeVisible();
                const countLocator = this.page.locator(locators.toolbar_amount).last();
                expect(await countLocator.textContent()).toContain(count.toString());
                await this.page.getByRole('link', {name: 'Remove active ' + filter + ' filter: ' + filterText}).click();
                await expect(filterButton).toBeVisible();
            });
    }

    async sortProductsByPriceLowToHigh() {
        await test.step(
            this.workerInfo.project.name + ": Sort products ",
            async () => {
                await this.sortProductsByPriceHighToLow(); // ensure we flip first, else this test is not valid
                await this.page.selectOption(locators.toolbar_sorter, {label: data.default.sorter_price});
                await this.page.waitForSelector(locators.toolbar_amount);
                await this.page.locator(locators.toolbar_sorter_action).first().click();
                const productPrices = await this.page.locator(locators.product_price).allTextContents();
                const productPricesSorted = productPrices.sort((a, b) => {
                    return parseFloat(a) - parseFloat(b);
                });
                expect(productPrices).toEqual(productPricesSorted);
            });
    }

    async sortProductsByPriceHighToLow() {
        await test.step(
            this.workerInfo.project.name + ": Sort products ",
            async () => {
                await this.page.selectOption(locators.toolbar_sorter, {label: data.default.sorter_price});
                await this.page.waitForSelector(locators.toolbar_amount);
                await this.page.locator(locators.toolbar_sorter_action).first().click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(locators.toolbar_amount);
                const productPrices = await this.page.locator(locators.product_price).allTextContents();
                const productPricesSorted = productPrices.sort((a, b) => {
                    return parseFloat(b) - parseFloat(a);
                });
                await expect(productPrices).toEqual(productPricesSorted);
            });
    }

    async sortProductsByNameAscending() {
        await this.sortProductsByNameDescending();
        await test.step(
            this.workerInfo.project.name + ": Sort products ",
            async () => {
                await this.page.selectOption(locators.toolbar_sorter, {label: data.default.sorter_name});
                await this.page.waitForSelector(locators.toolbar_amount);
                const products = await this.page.locator(locators.product_name).allTextContents();
                const productsSorted = products.sort();
                await expect(products).toEqual(productsSorted);
            });
    }

    async sortProductsByNameDescending() {
        await test.step(
            this.workerInfo.project.name + ": Sort products ",
            async () => {
                await this.page.selectOption(locators.toolbar_sorter, {label: data.default.sorter_name});
                await this.page.waitForSelector(locators.toolbar_amount);
                await this.page.locator(locators.toolbar_sorter_action).first().click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(locators.toolbar_amount);
                const products = await this.page.locator(locators.product_name).allTextContents();
                const productsSorted = products.sort((a, b) => {
                    if (a < b) {
                        return -1;
                    }
                    if (a > b) {
                        return 1;
                    }
                    return 0
                });
                await expect(products).toEqual(productsSorted);
            });
    }

    async limitProducts() {
        await test.step(
            this.workerInfo.project.name + ": Limit products ",
            async () => {
                for (let limitId in data.default.limiter) {
                    let limit = data.default.limiter[limitId as keyof typeof data.default.limiter];
                    await this.page.waitForSelector(pageLocators.footer);
                    await this.page.locator(locators.limiter).first().scrollIntoViewIfNeeded();
                    await this.page.selectOption(locators.limiter, {value: String(limit)});
                    await this.page.waitForLoadState('domcontentloaded');
                    await this.page.waitForLoadState('networkidle');
                    await this.page.waitForTimeout(1000);
                    const totalProducts = await this.page.locator(locators.toolbar_amount).last().textContent();
                    if (totalProducts && parseInt(totalProducts as string) < parseInt(String(limit))) {
                        expect(await this.page.locator(locators.product_name).count()).toBe(parseInt(totalProducts || "0"));
                        await expect(await this.page.getByLabel(locators.pager).first()).not.toBeVisible();
                    } else {
                        expect(await this.page.locator(locators.product_name).count()).toBe(parseInt(String(limit)));
                        await expect(await this.page.getByLabel(locators.pager).first()).toBeVisible();
                    }
                }
            });
    }

    async checkBreadcrumbs() {
        await test.step(
            `${this.workerInfo.project.name}: Check breadcrumbs`,
            async () => {
                const breadcrumbs = (await this.page.getByLabel(pageLocators.breadcrumbs).allTextContents()) ?? [];
                const expectedBreadcrumbs = data.default.breadcrumbs ?? [];
                this.assertBreadcrumbExists(breadcrumbs, expectedBreadcrumbs);
            }
        );
    }
    private assertBreadcrumbExists(actualBreadcrumbs: string[], expectedBreadcrumbs: string[]): void {
        for (const expectedBreadcrumb of expectedBreadcrumbs) {
            const isBreadcrumbFound = actualBreadcrumbs.some(breadcrumb => breadcrumb.includes(expectedBreadcrumb));
            expect(isBreadcrumbFound).toBeTruthy();
        }
    }



    async ListAndGrid() {
        await test.step(
            this.workerInfo.project.name + ": Product list view mode ",
            async () => {
                const currentVieMode = (await this.page.locator(locators.product_grid).getAttribute('class')) ?? '';
                expect(currentVieMode).not.toBe('');
                const expectedMode = data.default.grid_mode ?? 'mode-grid';
                if (currentVieMode.includes(expectedMode)) {
                    await this.page.getByLabel(locators.products_list_button).click();
                    await this.page.waitForLoadState('domcontentloaded');
                    await this.page.waitForSelector(locators.list_mode);
                } else {
                    await this.page.getByLabel(locators.products_grid_button).click();
                    await this.page.waitForLoadState('domcontentloaded');
                    await this.page.waitForSelector(locators.grid_mode);
                }
            });
    }

    async checkPager() {
        await test.step(
            this.workerInfo.project.name + ": Check pager ",
            async () => {
                await this.page.selectOption(locators.limiter, {label: '12'});
                await this.page.waitForSelector(locators.toolbar_amount);
                await expect(this.page.getByLabel(locators.pager).first()).toBeVisible();
                expect(await this.page.locator(locators.toolbar_amount).first().textContent()).toBe("1");
                expect(await this.page.locator(locators.toolbar_amount + '>>nth=1').textContent()).toBe("12");
                await this.page.getByRole('link', {name: 'Next'}).first().click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1000);
                await this.page.waitForSelector(locators.toolbar_amount);
                expect(await this.page.locator(locators.toolbar_amount).first().textContent()).toBe("13");
                expect(await this.page.locator(locators.toolbar_amount + ' >>nth=1').textContent()).toBe("24");
                await this.page.getByRole('link', {name: 'Previous'}).first().click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1000);
                expect(await this.page.locator(locators.toolbar_amount).first().textContent()).toBe("1");
                expect(await this.page.locator(locators.toolbar_amount + '>>nth=1').textContent()).toBe("12");
                await this.page.getByRole('link', {name: 'Page 3'}).first().click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForTimeout(1000);
                expect(await this.page.locator(locators.toolbar_amount).first().textContent()).toBe("25");
            });
    }

    async addToCompare() {
        await test.step(
            this.workerInfo.project.name + ": Add to compare ",
            async () => {
                const firstProduct = await this.page.locator(productLocators.productGridItem).first();
                const lastProduct = await this.page.locator(productLocators.productGridItem).last();
                const firstProductInfo = await firstProduct.locator(productLocators.productGridItemInfo);
                const firstProductName = await firstProductInfo.locator(productLocators.productItemName).first().textContent();
                const lastProductInfo = await lastProduct.locator(productLocators.productGridItemInfo);
                const lastProductName = await lastProductInfo.locator(productLocators.productItemName).first().textContent();
                const FirstAddToCompare = await firstProductInfo.locator(productLocators.addToCompare);
                const LastAddToCompare = await lastProductInfo.locator(productLocators.addToCompare);

                // Get the first product element for JavaScript evaluation
                const firstProductElement = await FirstAddToCompare.elementHandle();

                // Use the helper method to trigger the compare functionality for first product
                await this.triggerCompareButton(firstProductElement);

                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                //await this.page.waitForSelector(pageLocators.message_success);
                const successMessage1 = await this.page.locator(pageLocators.message_success);
                const successMessage1Text = await successMessage1.textContent();
                expect(successMessage1Text).toContain(firstProductName ? firstProductName.trim() : "firstProductName not populated");
                await successMessage1.getByLabel(pageLocators.messageClose).click({force: true});
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                expect(await this.page.locator(productLocators.compareLink).textContent()).toContain("1");
                await expect(this.page.locator(productLocators.compareLink)).toBeVisible();

                // Get the last product element for JavaScript evaluation
                const lastProductElement = await LastAddToCompare.elementHandle();

                // Use the helper method to trigger the compare functionality for last product
                lastProductElement?.scrollIntoViewIfNeeded()
                await this.triggerCompareButton(lastProductElement);

                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(pageLocators.message_success);
                const successMessage2 = this.page.locator(pageLocators.message_success);
                const successMessage2Text = await successMessage2.textContent();
                expect(successMessage2Text).toContain(lastProductName ? lastProductName.trim() : "lastProductName not populated");
                await successMessage2.getByLabel(pageLocators.messageClose).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.reload();
                expect(await this.page.locator(productLocators.compareLink).textContent()).toContain("2");
                await expect(this.page.locator(productLocators.compareLink)).toBeVisible();
                await this.page.locator(productLocators.compareLink).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(pageLocators.comapre_page_title);
                expect(await this.page.locator(pageLocators.comapre_page_title).textContent()).toContain(pageData?.default?.compare_products_title || "Compare Products");
                await expect(this.page.locator(pageLocators.compare_table)).toBeVisible();
                const compareTableText = await this.page.locator(pageLocators.compare_table).textContent();
                expect(compareTableText).toContain(firstProductName ? firstProductName.trim() : "firstProductName not populated");
                expect(compareTableText).toContain(lastProductName ? lastProductName.trim() : "lastProductName not populated");
            });
    }
}
