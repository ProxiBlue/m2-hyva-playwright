import {test, describe, expect} from "@hyva/fixtures";
import { loadLocators } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

// Load the locators dynamically based on the APP_NAME environment variable
const pageLocators = loadLocators('locators/page.locator', 'hyva');
const locators = loadLocators('locators/customer.locator', 'hyva');

describe("Simple Product test suite", () => {
    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
    });

    test("Can see a title and image for the product", async ({ simpleProductPage }, testInfo) => {
        await simpleProductPage.verifyTitleAndImage();
    });

    test("Can see a price for the product", async ({ simpleProductPage }, testInfo) => {
        await simpleProductPage.verifyPrice();
    });

    test("Confirm breadcrumbs", async ({ simpleProductPage }, testInfo) => {
        await simpleProductPage.verifyBreadcrumbs();
    });

    test.skip("Can not add a product to a wishlist when the user in not logged in", async ({ simpleProductPage }, testInfo) => {
        await simpleProductPage.addToWishlistNotLoggedIn();
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

        await configurableProductPage.addToWishlistLoggedIn();

        // Logout after test
        await customerPage.logout();
    });

    test("Can increment the product quantity on the pdp", async ({ simpleProductPage }, testInfo) => {
        await simpleProductPage.incrementProductQuantity();
    });

    test("Can add simple product to compare and verify on compare page", async ({ simpleProductPage }, testInfo) => {
        // Add the product to compare
        await simpleProductPage.addToCompare();
    });
});
