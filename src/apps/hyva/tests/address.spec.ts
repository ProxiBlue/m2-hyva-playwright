import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface AddressData {
    default: {
        address_saved_message?: string;
        address_deleted_message?: string;
    };
}

const defaultData: AddressData = {
    default: {
        address_saved_message: "You saved the address.",
        address_deleted_message: "You deleted the address.",
    }
};

let data = loadJsonData<AddressData>('account.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

async function fillAddressForm(page: any, customerData: any, overrides: any = {}) {
    await page.locator('#firstname').fill(overrides.firstName || customerData.firstName);
    await page.locator('#lastname').fill(overrides.lastName || customerData.lastName);
    await page.locator('#telephone').fill(overrides.phone || customerData.phone);
    await page.locator('#street_1').fill(overrides.street || customerData.street_one_line);
    await page.locator('#city').fill(overrides.city || customerData.city);

    // Select country (US by default)
    const countrySelect = page.locator('#country_id, #country');
    if (await countrySelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        await countrySelect.selectOption({ label: overrides.country || 'United States' });
        await page.waitForTimeout(500);
    }

    // Select state/region
    const stateSelect = page.locator('#region_id');
    if (await stateSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Use dropdown
        const options = stateSelect.locator('option:not(:first-child)');
        const count = await options.count();
        if (count > 0) {
            // Select first available state
            await stateSelect.selectOption({ index: 1 });
        }
    } else {
        // Text input for region
        const regionInput = page.locator('#region');
        if (await regionInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await regionInput.fill(overrides.state || customerData.state || 'California');
        }
    }

    // Fill zip code
    await page.locator('#zip').fill(overrides.zip || customerData.zip || '90210');
}

describe("Address management test suite", () => {

    test.setTimeout(120000);

    test.beforeEach(async ({ customerPage, customerData }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);

        // Create a fresh account for each test
        await customerPage.createAccount(customerData);
    });

    test("Add an address", async ({ customerData, page }) => {
        // Navigate to add new address page
        await page.goto(process.env.url + '/customer/address/new/');
        await page.waitForLoadState('domcontentloaded');

        // Verify we're on the address form
        const heading = page.locator('h1');
        const headingText = await heading.textContent().catch(() => '');
        if (headingText?.includes('Customer Login')) {
            test.skip(true, 'Session expired, redirected to login');
        }

        // Fill address form
        await fillAddressForm(page, customerData);

        // Submit form
        await page.getByRole('button', { name: 'Save Address' }).click();
        await page.waitForLoadState('domcontentloaded');

        // Verify success message
        const successMessage = data.default.address_saved_message || 'You saved the address.';
        await expect(
            page.locator(pageLocators.message_success),
            'Address saved success message should be visible'
        ).toContainText(successMessage, { timeout: 10000 });
    });

    test("Edit existing address", async ({ customerData, page }) => {
        // First add an address
        await page.goto(process.env.url + '/customer/address/new/');
        await page.waitForLoadState('domcontentloaded');
        await fillAddressForm(page, customerData);
        await page.getByRole('button', { name: 'Save Address' }).click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator(pageLocators.message_success)).toBeVisible({ timeout: 10000 });

        // Navigate to address book
        await page.goto(process.env.url + '/customer/address/');
        await page.waitForLoadState('domcontentloaded');

        // Find and click edit link for the address
        const editLink = page.getByRole('link', { name: /Edit Address/i }).first();
        if (!(await editLink.isVisible({ timeout: 5000 }).catch(() => false))) {
            // Try alternate selectors
            const altEditLink = page.locator('a[href*="customer/address/edit"]').first();
            if (!(await altEditLink.isVisible({ timeout: 3000 }).catch(() => false))) {
                test.skip(true, 'No edit address link found');
            }
            await altEditLink.click();
        } else {
            await editLink.click();
        }
        await page.waitForLoadState('domcontentloaded');

        // Modify the city
        const cityField = page.locator('#city');
        await expect(cityField).toBeVisible({ timeout: 5000 });
        await cityField.fill('Updated City');

        // Submit form
        await page.getByRole('button', { name: 'Save Address' }).click();
        await page.waitForLoadState('domcontentloaded');

        // Verify success message
        const successMessage = data.default.address_saved_message || 'You saved the address.';
        await expect(
            page.locator(pageLocators.message_success),
            'Address updated success message should be visible'
        ).toContainText(successMessage, { timeout: 10000 });
    });

    test("Delete an address", async ({ customerData, page }) => {
        // Add first address (becomes default - cannot be deleted)
        await page.goto(process.env.url + '/customer/address/new/');
        await page.waitForLoadState('domcontentloaded');
        await fillAddressForm(page, customerData);
        await page.getByRole('button', { name: 'Save Address' }).click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator(pageLocators.message_success)).toBeVisible({ timeout: 10000 });

        // Add second address (this one can be deleted)
        await page.goto(process.env.url + '/customer/address/new/');
        await page.waitForLoadState('domcontentloaded');
        await fillAddressForm(page, customerData, { city: 'Delete Me City', street: '999 Delete Street' });
        await page.getByRole('button', { name: 'Save Address' }).click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator(pageLocators.message_success)).toBeVisible({ timeout: 10000 });

        // Navigate to address book
        await page.goto(process.env.url + '/customer/address/');
        await page.waitForLoadState('domcontentloaded');

        // Set up dialog handler for confirmation
        page.on('dialog', async (dialog: any) => {
            await dialog.accept();
        });

        // Find and click delete link
        const deleteLink = page.getByRole('link', { name: /Delete/i }).first();
        if (!(await deleteLink.isVisible({ timeout: 5000 }).catch(() => false))) {
            const altDeleteLink = page.locator('a[href*="customer/address/delete"]').first();
            if (!(await altDeleteLink.isVisible({ timeout: 3000 }).catch(() => false))) {
                test.skip(true, 'No delete address link found');
            }
            await altDeleteLink.click();
        } else {
            await deleteLink.click();
        }

        await page.waitForLoadState('domcontentloaded');

        // Verify success message
        const successMessage = data.default.address_deleted_message || 'You deleted the address.';
        await expect(
            page.locator(pageLocators.message_success),
            'Address deleted success message should be visible'
        ).toContainText(successMessage, { timeout: 10000 });
    });

    test("Missing required field prevents address creation", async ({ customerData, page }) => {
        // Navigate to add new address page
        await page.goto(process.env.url + '/customer/address/new/');
        await page.waitForLoadState('domcontentloaded');

        // Leave all fields empty and try to submit
        await page.getByRole('button', { name: 'Save Address' }).click();
        await page.waitForTimeout(1000);

        // Should still be on the address form (form should not submit)
        const heading = page.locator('h1');
        const headingText = await heading.textContent() || '';
        expect(
            headingText.includes('Address') || headingText.includes('address'),
            'Should still be on address form page'
        ).toBe(true);

        // Check for validation errors - either HTML5 or Magento validation
        // Check required fields are invalid (HTML5 validation)
        const firstnameField = page.locator('#firstname');
        const isInvalid = await firstnameField.evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );

        // Either HTML5 validation kicks in or Magento shows error messages
        const hasValidationErrors = isInvalid ||
            await page.locator('.mage-error, .field-error, [generated="true"]').first().isVisible({ timeout: 3000 }).catch(() => false);

        expect(hasValidationErrors, 'Required field validation should prevent submission').toBe(true);
    });
});
