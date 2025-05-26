import { test, describe, expect } from "@hyva/fixtures";
import * as customerLocators from "@hyva/locators/customer.locator";
import * as pageLocators from "@hyva/locators/page.locator";
import * as productLocators from "@hyva/locators/product.locator";
import * as locators from "@hyva/locators/customer.locator";

describe("Configurable products test suite", () => {
    test.beforeEach(async ({ configurableProductPage }, testInfo) => {
        // @ts-ignore
        test.skip(process.env.skipBaseTests.includes(testInfo.title), testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await configurableProductPage.navigateTo();
    });

    test("Can see a title and image for the product", async ({ configurableProductPage }, testInfo) => {
        await configurableProductPage.verifyTitleAndImage();
    });

    test("Can see a price for the product", async ({ configurableProductPage }, testInfo) => {
        await configurableProductPage.verifyPrice();
    });

    test("Can see breadcrumbs", async ({ configurableProductPage }, testInfo) => {
        await configurableProductPage.verifyBreadcrumbs();
    });

    test("Can increment the product quantity on the pdp", async ({ configurableProductPage }, testInfo) => {
        await configurableProductPage.incrementProductQuantity();
    });

    test("Can't add a configurable product to the cart when no configuration is selected", async ({ configurableProductPage }, testInfo) => {
        await configurableProductPage.addToCartWithoutConfiguration();
    });

    test("Can select product attributes", async ({ configurableProductPage }, testInfo) => {
        await configurableProductPage.selectProductAttributes();
    });

    test("Can add configurable product to cart and verify options in cart", async ({ configurableProductPage }, testInfo) => {
        // Select random options for the configurable product and add to cart
        await configurableProductPage.selectProductAttributes();

        // Verify the selected options appear in the cart
        await configurableProductPage.verifyOptionsInCart();
    });

    test("Can't add a product to a wishlist when the user in not logged in", async ({ configurableProductPage }, testInfo) => {
        await configurableProductPage.addToWishlistNotLoggedIn();
    });

    test("Can add a product to a wishlist when the user is logged in", async ({ configurableProductPage, customerPage, customerData, page }, testInfo) => {
        // First login the user
        await customerPage.navigateTo();
        await customerPage.page.waitForLoadState('domcontentloaded');
        await expect(page.getByRole('link', {name: locators.create_button})).toBeVisible();
        await customerPage.page.getByRole('link', {name: locators.create_button}).click();
        await customerPage.fillCreateForm(customerData);
        await customerPage.page.waitForLoadState('domcontentloaded');
        await customerPage.page.getByRole('button', {name: locators.create_button}).click();
        await customerPage.page.waitForLoadState('domcontentloaded');
        await customerPage.page.waitForSelector(pageLocators.message_success);

        // Navigate back to the configurable product page
        await configurableProductPage.navigateTo();

        // Select product attributes
        await configurableProductPage.selectProductAttributes();
        await configurableProductPage.page.waitForLoadState('domcontentloaded');
        await configurableProductPage.addToWishlistLoggedIn()

        // Logout after test
        await customerPage.logout();
    });
});
