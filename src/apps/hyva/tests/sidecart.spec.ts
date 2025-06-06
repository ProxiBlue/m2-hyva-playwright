import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

// Load the locators dynamically based on the APP_NAME environment variable
const locators = loadLocators('locators/sidecart.locator', 'hyva');
const productLocators = loadLocators('locators/product.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');

describe("Side cart check", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test('it can open the sidecart', async ({ sideCartPage }) => {
        await sideCartPage.open();
    });

    test('it can delete item from sidecart', async ({ sideCartPage }) => {
        await sideCartPage.open();
        await sideCartPage.deleteAll();
    });

    test('it can navigate to the product when clicking the edit icon', async ({ sideCartPage, page }) => {
        await sideCartPage.open();
        const cartItems = await page.$$(locators.items);
        for (let i = 0; i < cartItems.length; i++) {
            const lineItemNameElement = await cartItems[i].$(locators.line_item_name)
            expect(lineItemNameElement).not.toBeNull()
            // @ts-ignore
            const lineItemName = await lineItemNameElement.textContent();
            await page.waitForTimeout(500);
            const editButton = await cartItems[i].$(locators.item_edit_button);
            expect(editButton).not.toBeNull();
            // @ts-ignore
            await editButton.click();
            await page.waitForLoadState("networkidle");
            await page.waitForLoadState("domcontentloaded");
            await expect(page.getByRole('heading', { name: lineItemName, exact: true }).locator('span')).toBeVisible();
            await page.locator(productLocators.product_qty_input).fill('2');
            await page.waitForLoadState("domcontentloaded");
            await page.locator(productLocators.product_add_to_cart_button).click();
            await page.waitForLoadState("domcontentloaded");
            await page.waitForSelector('.message.success')
            await page.waitForLoadState('domcontentloaded');
            expect(await page.locator(pageLocators.message_success).isVisible()).toBe(true)
            expect(await page.locator(pageLocators.message_success).textContent()).toContain(sideCartPage.pageData.default.product_was_updated);
        }
    });

    test('it can navigate to the cart with a link in the slider', async ({ sideCartPage, page, cartPage }) => {
        await sideCartPage.open();
        await page.waitForSelector('text='+sideCartPage.pageData.default.view_and_edit_cart_link, { state: 'visible' });
        await page.click('text='+sideCartPage.pageData.default.view_and_edit_cart_link);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForSelector('text='+cartPage.pageData.default.page_title_text, { state: 'visible' });
    })

    test('it can navigate to checkout with a button in the slider', async ({ sideCartPage, page }) => {
        await sideCartPage.open();
        await page.waitForSelector('text='+sideCartPage.pageData.default.checkout_link, { state: 'visible' });
        await page.click('text='+sideCartPage.pageData.default.checkout_link);
        await page.waitForLoadState("domcontentloaded");
    })


});
