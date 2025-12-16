import {describe, test, expect} from "@admin/fixtures";
import * as locators from "@admin/locators/products.locator";
import { shouldSkipTest } from "@utils/functions/test-skip";

describe("Admin - Products", () => {

    test.beforeEach(async ({adminPage, adminProductsPage}, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await adminPage.navigateTo();
        await adminPage.login();
        await adminProductsPage.navigateTo();
    });

    test.afterEach(async ({adminPage}, testInfo) => {
        await adminPage.logout();
    });

    test("has products listed in grid", async ({adminProductsPage}, testInfo) => {
        const gridRows = adminProductsPage.page.locator(locators.adminProductGridRows);
        expect(await gridRows.count()).toBeGreaterThan(0);
    });

    test("can make edit to product and save correctly (admin save errors checking)", async ({adminProductsPage}, testInfo) => {
        test.setTimeout(600000);
        const gridRows = adminProductsPage.page.locator(locators.adminProductGridRows);
        const firstRow = await adminProductsPage.page.locator(locators.adminProductGridRows + ' >> tbody >> tr').first();
        await firstRow.click();
        await adminProductsPage.page.waitForLoadState("networkidle")
        await adminProductsPage.page.waitForLoadState("domcontentloaded")
        const priceField = adminProductsPage.page.locator(locators.productPriceField).first();
        const originalPrice = await priceField.inputValue();
        expect(originalPrice).not.toBeNull();
        await priceField.fill("99.99");
        const saveButton = adminProductsPage.page.locator('[data-ui-id="save-button"]');
        await saveButton.click();
        await adminProductsPage.page.waitForLoadState("networkidle")
        await adminProductsPage.page.waitForLoadState("domcontentloaded")
        const newPrice = await priceField.inputValue();
        expect(newPrice).toBe("99.99");
        await priceField.fill(originalPrice);
        await saveButton.click();
        await adminProductsPage.page.waitForLoadState("networkidle")
        await adminProductsPage.page.waitForLoadState("domcontentloaded");
        const restoredPrice = await priceField.inputValue();
        expect(restoredPrice).toBe(originalPrice);



    });
});
