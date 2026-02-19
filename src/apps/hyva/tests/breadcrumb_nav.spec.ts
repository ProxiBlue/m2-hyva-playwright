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
        category_url: "/gear/bags.html",
        category_title: "Bags",
        subcategory_url: "/gear.html",
        subcategory_title: "Gear",
    }
};

let data = loadJsonData<NavigationData>('navigation.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Breadcrumb navigation test suite", () => {

    test.beforeEach(async ({}, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Category breadcrumb navigates to parent", async ({ page }) => {
        const baseUrl = process.env.url || '';
        // Navigate to a subcategory that has parent breadcrumbs (e.g. Gear > Bags)
        const categoryUrl = baseUrl + (data.default.category_url || '').replace(/^\//, '');

        await page.goto(categoryUrl);
        await page.waitForLoadState('domcontentloaded');

        const breadcrumbLinks = page.locator('.breadcrumbs li a');
        const linkCount = await breadcrumbLinks.count();

        if (linkCount < 2) {
            test.skip(true, 'Not enough breadcrumb links on this category page');
        }

        // Click the parent category breadcrumb (second link — first is Home)
        const parentLink = breadcrumbLinks.nth(1);
        await parentLink.click();
        await page.waitForLoadState('domcontentloaded');

        // Verify we landed on a category page with a title
        await expect(
            page.locator(pageLocators.pageTitle),
            'Parent category page title should be visible after breadcrumb click'
        ).toBeVisible({ timeout: 10000 });
    });

    test("Category breadcrumb navigates to home", async ({ page }) => {
        const baseUrl = process.env.url || '';
        const categoryUrl = baseUrl + (data.default.category_url || '').replace(/^\//, '');

        await page.goto(categoryUrl);
        await page.waitForLoadState('domcontentloaded');

        // Click the "Home" breadcrumb link (first link)
        const homeBreadcrumb = page.locator('.breadcrumbs li a').first();
        const homeText = await homeBreadcrumb.textContent();

        if (!homeText?.toLowerCase().includes('home')) {
            test.skip(true, 'First breadcrumb is not a Home link');
        }

        await homeBreadcrumb.click();
        await page.waitForLoadState('domcontentloaded');

        // Verify we landed on the homepage
        const currentUrl = page.url();
        const urlPath = new URL(currentUrl).pathname;
        expect(urlPath === '/' || urlPath === '' || urlPath === '/index.php').toBeTruthy();
    });
});
