import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface DashboardData {
    default: {
        order_history_empty?: string;
    };
}

const defaultData: DashboardData = {
    default: {
        order_history_empty: "You have placed no orders.",
    }
};

let data = loadJsonData<DashboardData>('dashboard.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Customer dashboard test suite", () => {

    test.setTimeout(120000);

    test.beforeEach(async ({ customerPage, customerData }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);

        await customerPage.createAccount(customerData);
    });

    test("Dashboard renders after login", async ({ page }) => {
        await page.goto(process.env.url + 'customer/account/');
        await page.waitForLoadState('domcontentloaded');

        await expect(
            page.locator(pageLocators.pageTitle),
            'My Account page title should be visible'
        ).toBeVisible({ timeout: 10000 });

        // Verify dashboard content blocks (use heading locators to avoid matching hidden sidebar links on mobile)
        await expect(
            page.getByRole('heading', { name: /Account Information/i }),
            'Account Information heading should be visible'
        ).toBeVisible({ timeout: 10000 });

        await expect(
            page.getByRole('heading', { name: /Contact Information/i }),
            'Contact Information heading should be visible'
        ).toBeVisible({ timeout: 10000 });
    });

    test("Order history is empty for new account", async ({ page }) => {
        await page.goto(process.env.url + 'sales/order/history/');
        await page.waitForLoadState('domcontentloaded');

        const emptyMessage = data.default.order_history_empty || '';
        await expect(
            page.getByText(emptyMessage),
            'Empty order history message should be visible'
        ).toBeVisible({ timeout: 10000 });
    });

    test("Account information displays correctly", async ({ customerData, page }) => {
        await page.goto(process.env.url + 'customer/account/');
        await page.waitForLoadState('domcontentloaded');

        // Verify customer name is displayed
        const fullName = customerData.firstName + ' ' + customerData.lastName;
        await expect(
            page.getByText(fullName).first(),
            'Customer full name should be displayed on dashboard'
        ).toBeVisible({ timeout: 10000 });

        // Verify customer email is displayed
        await expect(
            page.getByText(customerData.email).first(),
            'Customer email should be displayed on dashboard'
        ).toBeVisible({ timeout: 10000 });
    });
});
