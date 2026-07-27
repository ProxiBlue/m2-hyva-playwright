import {describe, test, expect} from "@admin/fixtures";
import * as locators from "@admin/locators/orders.locator";
import {shouldSkipTest} from "@utils/functions/test-skip";

// Virtual Terminal is a loki-branch-only feature (Uptactics/VirtualTerminal module).
// Unconditionally skipped on non-loki branches — remove `.skip` when working on loki.
describe("Admin - Sales Grid Virtual Terminal Column", () => {

    test.beforeEach(async ({adminPage, adminOrdersPage}, testInfo) => {
        test.skip(process.env.APP_NAME === 'hyva' || process.env.TEST_BASE === 'hyva',
            'Admin tests require admin access - skipped for hyva environment');

        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);

        await adminPage.navigateTo();
        await adminPage.login();
        await adminOrdersPage.navigateTo();
    });

    test.afterEach(async ({adminPage}) => {
        await adminPage.logout();
    });

    // @story: sales-grid-vt-column-filter
    test("filters the sales grid to Virtual Terminal = Yes", async ({adminOrdersPage}, testInfo) => {
        const page = adminOrdersPage.page;

        await test.step(
            testInfo.project.name + ": open grid filters and select Virtual Terminal = Yes",
            async () => {
                await page.click(locators.filter_button_expand);
                await page.locator(locators.filter_is_virtual_terminal).waitFor({state: 'visible'});
                await page.selectOption(locators.filter_is_virtual_terminal, '1');
                await page.click(locators.filter_apply);
                await page.waitForLoadState("networkidle");
            });

        // Filter chip confirms the column is wired into the grid's active filters,
        // proving the select filter round-trips through the data provider.
        const activeFilter = page.locator('.admin__current-filters-list').filter({hasText: 'Virtual Terminal'});
        await expect(activeFilter).toBeVisible();

        // Every visible row (if any) must show "Yes" in the Virtual Terminal column —
        // no VT orders are guaranteed to exist in this environment, so an empty grid
        // is an acceptable outcome; a false-positive "No" row is not.
        const gridRows = page.locator(locators.adminOrdersGrid + ' tbody tr');
        const rowCount = await gridRows.count();
        for (let i = 0; i < rowCount; i++) {
            await expect(gridRows.nth(i)).toContainText('Yes');
        }

        await page.click(locators.remove_filter_button);
    });
});
