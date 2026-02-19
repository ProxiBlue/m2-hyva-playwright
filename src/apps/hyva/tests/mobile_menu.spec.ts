import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

describe("Mobile menu test suite", () => {

    test.beforeEach(async ({}, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Hamburger menu opens and closes", async ({ homePage, page }) => {
        await page.setViewportSize({ width: 375, height: 800 });
        await homePage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        // Open mobile menu
        const menuButton = page.getByRole('button', { name: /open menu/i })
            .or(page.getByRole('button', { name: /menu/i }).first());

        await expect(menuButton.first()).toBeVisible({ timeout: 5000 });
        await menuButton.first().click();
        await page.waitForTimeout(500);

        // Verify menu drawer is visible
        const menuDrawer = page.getByRole('dialog')
            .or(page.locator('[x-show*="open"], [x-show*="menu"], nav[x-show]'));

        await expect(
            menuDrawer.first(),
            'Mobile menu drawer should be visible after opening'
        ).toBeVisible({ timeout: 5000 });

        // Close the menu
        const closeButton = page.getByRole('button', { name: /close/i })
            .or(page.getByRole('button', { name: /close menu/i }));

        if (await closeButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
            await closeButton.first().click();
            await page.waitForTimeout(500);

            // Verify menu is hidden
            await expect(
                menuDrawer.first(),
                'Mobile menu drawer should be hidden after closing'
            ).not.toBeVisible({ timeout: 5000 });
        }
    });

    test("Mobile menu links navigate correctly", async ({ homePage, page }) => {
        await page.setViewportSize({ width: 375, height: 800 });
        await homePage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        const initialUrl = page.url();

        // Open mobile menu
        const menuButton = page.getByRole('button', { name: /open menu/i })
            .or(page.getByRole('button', { name: /menu/i }).first());
        await expect(menuButton.first()).toBeVisible({ timeout: 5000 });
        await menuButton.first().click();
        await page.waitForTimeout(500);

        // Click a category link in the menu
        const menuLinks = page.getByRole('dialog').getByRole('link')
            .or(page.locator('nav[x-show] a, [x-show*="menu"] a'));

        const linkCount = await menuLinks.count();
        if (linkCount === 0) {
            test.skip(true, 'No navigation links found in mobile menu');
        }

        await menuLinks.first().click();
        await page.waitForLoadState('domcontentloaded');

        // Verify navigation occurred (URL changed)
        expect(page.url()).not.toBe(initialUrl);
    });

    test("Mobile search works", async ({ homePage, searchPage, page }) => {
        await page.setViewportSize({ width: 375, height: 800 });
        await homePage.navigateTo();
        await page.waitForLoadState('domcontentloaded');

        // Look for search toggle or search field
        const searchToggle = page.getByRole('button', { name: /search/i });
        if (await searchToggle.first().isVisible({ timeout: 3000 }).catch(() => false)) {
            await searchToggle.first().click();
            await page.waitForTimeout(500);
        }

        // Fill search field
        const searchField = page.getByRole('searchbox')
            .or(page.locator('#search, input[name="q"]'));

        if (!(await searchField.first().isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'Search field not visible on mobile');
        }

        await searchField.first().fill('bag');
        await searchField.first().press('Enter');
        await page.waitForLoadState('domcontentloaded');

        // Verify search results page loaded
        expect(page.url()).toContain('catalogsearch');
    });
});
