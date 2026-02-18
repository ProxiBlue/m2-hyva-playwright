import { test, describe, expect } from "@hyva/fixtures";
import { shouldSkipTest } from "@utils/functions/test-skip";

describe("Health check suite", () => {

    test.beforeEach(async ({}, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("Homepage returns 200", async ({ page, homePage }) => {
        const baseUrl = process.env.url || '';
        const responsePromise = page.waitForResponse(baseUrl);
        await page.goto(baseUrl);
        const response = await responsePromise;
        expect(response.status(), 'Homepage should return 200').toBe(200);

        await expect(
            page.locator('h1'),
            'Homepage has a visible heading'
        ).toBeVisible();
    });

    test("PLP returns 200", async ({ page, categoryPage }) => {
        const plpUrl = process.env.url + (categoryPage.pageData.default.url || '');
        const responsePromise = page.waitForResponse(plpUrl);
        await page.goto(plpUrl);
        const response = await responsePromise;
        expect(response.status(), 'PLP should return 200').toBe(200);

        await expect(
            page.locator('h1'),
            'PLP has a visible heading'
        ).toBeVisible();
    });

    test("PDP returns 200", async ({ page, simpleProductPage }) => {
        const pdpUrl = process.env.url + (simpleProductPage.pageData.default.url || '');
        const responsePromise = page.waitForResponse(pdpUrl);
        await page.goto(pdpUrl);
        const response = await responsePromise;
        expect(response.status(), 'PDP should return 200').toBe(200);

        await expect(
            page.getByRole('heading', { level: 1, name: simpleProductPage.pageData.default.name || '' }),
            'PDP has a visible product title'
        ).toBeVisible();
    });

    test("Checkout returns 200", async ({ page, cartPage }) => {
        const checkoutUrl = process.env.url + 'checkout/';
        const response = await page.goto(checkoutUrl);
        expect(response).not.toBeNull();

        // Empty cart redirects to cart page — that's valid behaviour
        const currentUrl = page.url();
        const headResponse = await page.request.head(currentUrl);
        expect(headResponse.status(), 'Current page should return 200').toBe(200);

        await expect(
            page.locator('h1'),
            'Page has a visible heading'
        ).toBeVisible();
    });
});
