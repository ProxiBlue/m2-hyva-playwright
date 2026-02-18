import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface NavigationData {
    default: {
        category_url?: string;
        category_title?: string;
        subcategory_url?: string;
        subcategory_title?: string;
    };
}

const defaultData: NavigationData = {
    default: {
        category_url: "/women.html",
        category_title: "Women",
        subcategory_url: "/women/tops-women.html",
        subcategory_title: "Tops",
    }
};

let data = loadJsonData<NavigationData>('navigation.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Navigation test suite", () => {

    test.beforeEach(async ({}, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Navigate to a category page", async ({ page }) => {
        const baseUrl = process.env.url || '';
        const categoryUrl = baseUrl + (data.default.category_url || '').replace(/^\//, '');

        await page.goto(categoryUrl);
        await page.waitForLoadState('domcontentloaded');

        const expectedTitle = data.default.category_title || '';
        await expect(
            page.locator(pageLocators.pageTitle),
            'Category page title should be visible'
        ).toContainText(expectedTitle);
    });

    test("Navigate to a subcategory page", async ({ page }) => {
        const baseUrl = process.env.url || '';
        const subcategoryUrl = baseUrl + (data.default.subcategory_url || '').replace(/^\//, '');

        await page.goto(subcategoryUrl);
        await page.waitForLoadState('domcontentloaded');

        const expectedTitle = data.default.subcategory_title || '';
        await expect(
            page.locator(pageLocators.pageTitle),
            'Subcategory page title should be visible'
        ).toContainText(expectedTitle);
    });
});
