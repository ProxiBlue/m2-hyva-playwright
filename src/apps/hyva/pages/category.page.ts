import BasePage from "@common/pages/base.page";
import {Page, test, TestInfo} from "@playwright/test";
import {expect} from "@hyva/fixtures";
import * as locators from "@hyva/locators/category.locator";
import * as productLocators from "@hyva/locators/product.locator";
import * as pageLocators from "@hyva/locators/page.locator";
import * as pageData from "@hyva/data/page.data.json";

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {};
const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/category.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/category.data.json', { assert: { type: "json" } }).then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import(__dirname + '/../data/category.data.json', { assert: { type: "json" } }).then((dynamicData) => {
        data = dynamicData;
    });
}

export default class CategoryPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    async checkFilter() {
        await test.step(
            this.workerInfo.project.name + ": Testing filters ",
            async () => {
                // @ts-ignore
                const filters = data.filters;
                let filter = '';
                let option = '';
                for (filter in filters) {
                    await this.checkFilterExists(filter);
                    for (option in filters[filter]) {
                        await this.checkFilterResults(filter, option, filters[filter][option]);
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
                //console.log('checking results:' + filter + ' : ' + option);
                const filterButton = await this.page.getByRole('button', {name: filter + ' filter'});
                const filterContainer = await this.page.locator('.filter-option', {has: filterButton});
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
        // @ts-ignore
        await this.page.selectOption(locators.toolbar_sorter, {label: data.sorter_price});
        await this.page.waitForSelector(locators.toolbar_amount);
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
                // @ts-ignore
                await this.page.selectOption(locators.toolbar_sorter, {label: data.sorter_price});
                await this.page.waitForSelector(locators.toolbar_amount);
                await this.page.getByRole('link', {name: locators.toolbar_sorter_action}).first().click();
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
        await test.step(
            this.workerInfo.project.name + ": Sort products ",
            async () => {
                // @ts-ignore
                await this.page.selectOption(locators.toolbar_sorter, {label: data.sorter_name});
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
                // @ts-ignore
                await this.page.selectOption(locators.toolbar_sorter, {label: data.sorter_name});
                await this.page.waitForSelector(locators.toolbar_amount);
                await this.page.getByRole('link', {name: locators.toolbar_sorter_action}).click();
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
                // @ts-ignore
                for (let limitId in data.limiter) {
                    // @ts-ignore
                    let limit = data.limiter[limitId]
                    await this.page.waitForSelector(pageLocators.footer);
                    await this.page.locator(locators.limiter).first().scrollIntoViewIfNeeded();
                    await this.page.selectOption(locators.limiter, {value: limit});
                    await this.page.waitForLoadState('domcontentloaded');
                    await this.page.waitForLoadState('networkidle');
                    await this.page.waitForTimeout(1000);
                    const totalProducts = await this.page.locator(locators.toolbar_amount).last().textContent();
                    // @ts-ignore
                    if (parseInt(totalProducts) < parseInt(limit)) {
                        // @ts-ignore
                        expect(await this.page.locator(locators.product_name).count()).toBe(parseInt(totalProducts));
                        await expect(await this.page.getByLabel(locators.pager).first()).not.toBeVisible();
                    } else {
                        expect(await this.page.locator(locators.product_name).count()).toBe(parseInt(limit));
                        await expect(await this.page.getByLabel(locators.pager).first()).toBeVisible();
                    }
                }
            });
    }

    async checkBreadcrumbs() {
        await test.step(
            this.workerInfo.project.name + ": Check breadcrumbs ",
            async () => {
                const breadcrumbs = await this.page.getByLabel(pageLocators.breadcrumbs).allTextContents();
                let crumb = '';
                // @ts-ignore
                for (crumb in data.breadcrumbs) {
                    expect(breadcrumbs).toContain(crumb);
                }
            });

    }

    async ListAndGrid() {
        await test.step(
            this.workerInfo.project.name + ": Product list view mode ",
            async () => {
                const currentVieMode = await this.page.locator(locators.product_grid).getAttribute('class');
                expect(currentVieMode).not.toBe(null)
                // @ts-ignore
                if (currentVieMode.includes(data.default.grid_mode, 0)) {
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
                const FirstAddToCompare = await firstProductInfo.getByLabel(productLocators.addToCompare);
                const LastAddToCompare = await lastProductInfo.getByLabel(productLocators.addToCompare);
                await FirstAddToCompare.click({force: true});
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                //await this.page.waitForSelector(pageLocators.message_success);
                const successMessage1 = await this.page.locator(pageLocators.message_success);
                // @ts-ignore
                expect(await successMessage1.textContent()).toContain(firstProductName.trim());
                await successMessage1.getByLabel(pageLocators.messageClose).click({force: true});
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                expect(await this.page.locator(productLocators.compareLink).textContent()).toContain("1");
                await expect(this.page.locator(productLocators.compareLink)).toBeVisible();
                await LastAddToCompare.click({force: true});
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(pageLocators.message_success);
                const successMessage2 = await this.page.locator(pageLocators.message_success);
                // @ts-ignore
                expect(await successMessage2.textContent()).toContain(lastProductName.trim());
                await successMessage2.getByLabel(pageLocators.messageClose).click();
                expect(await this.page.locator(productLocators.compareLink).textContent()).toContain("2");
                await expect(this.page.locator(productLocators.compareLink)).toBeVisible();
                await this.page.locator(productLocators.compareLink).click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForSelector(pageLocators.comapre_page_title);
                expect(await this.page.locator(pageLocators.comapre_page_title).textContent()).toContain(pageData.compare_products_title);
                await expect(this.page.locator(pageLocators.compare_table)).toBeVisible();
                // @ts-ignore
                expect(await this.page.locator(pageLocators.compare_table).textContent()).toContain(firstProductName.trim());
                // @ts-ignore
                expect(await this.page.locator(pageLocators.compare_table).textContent()).toContain(lastProductName.trim());
            });
    }
}
