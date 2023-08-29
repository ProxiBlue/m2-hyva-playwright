import { test, describe } from "../fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "../locators/home.locator";
import { expect } from "@playwright/test";
import * as searchSelectors from "../locators/search.locator";
import * as product from "../locators/product.locator";
import * as pageLocators from "../locators/page.locator";

describe("Home", () => {
    test("Verify home page", async ({ homePage }) => {
        await homePage.navigateTo();
        await homePage.verifyDomTitle();
        await homePage.verifyPageTitle()
    });

    test("Verify home page has products", async ({ homePage }) => {
        await homePage.navigateTo();
        await actions.verifyElementIsVisible(homePage.page, locators.product_slider, homePage.workerInfo);
        await expect.poll(async () => homePage.page.locator(locators.product_slider_item).count()).toBeGreaterThan(4);
    });

    test('Can perform search from homepage', async ({ homePage }) => {
        await homePage.navigateTo();
        await homePage.page.click(searchSelectors.headerSearchIcon);
        await homePage.page.waitForSelector(searchSelectors.headerSearchField);
        await homePage.page.fill(searchSelectors.headerSearchField, product.simpleProductName);
        await homePage.page.press(searchSelectors.headerSearchField, 'Enter');
        await homePage.page.waitForSelector(pageLocators.pageTitle);
        const mainHeadingText = await homePage.page.$eval(pageLocators.pageTitle, (el) => el.textContent);
        expect(mainHeadingText).toContain(product.simpleProductName);
        expect(homePage.page.locator(product.productGrid)).toBeVisible();
        expect(homePage.page.locator(product.productGrid).locator(product.productGridItem)).toHaveCount(10);
        expect(homePage.page.locator(product.productGrid)
            .locator(product.productGridItem).first()
            .locator(product.productGridItemInfo)
            .locator(product.productItemLink)
        ).toHaveText(product.simpleProductName);
    });
});
