import { test, expect } from '@common/fixtures';
import { createCustomerDataWithCustomLocale, createCustomerDataWithExtendedLocale } from './custom-locale-example';

/**
 * Example test that demonstrates how to use custom locale data
 *
 * This test creates a customer with custom locale data and logs the generated data
 * to the console for demonstration purposes.
 *
 * To run this test:
 * ddev exec "cd tests/m2-hyva-playwright/src/app/pps && APP_NAME=pps TEST_BASE=pps npx playwright test examples/custom-locale-test.spec.ts"
 */
test.describe('Custom Locale Examples', () => {

  test('Create customer with custom locale', async ({ page }) => {
    // Generate customer data using the custom locale
    const customerData = await createCustomerDataWithCustomLocale();

    // Log the generated data to the console
    console.log('Customer data with custom locale:');
    console.log(JSON.stringify(customerData, null, 2));

    // Verify that the city follows one of the custom patterns
    const cityPatterns = [
      /ville$/,           // Matches names ending with "ville"
      / City$/,           // Matches names ending with " City"
      /^New /             // Matches names starting with "New "
    ];

    // Check if the city matches at least one of the patterns
    const cityMatchesPattern = cityPatterns.some(pattern => pattern.test(customerData.city));
    expect(cityMatchesPattern).toBeTruthy();

    // Verify that the phone number follows one of the custom formats
    const phonePatterns = [
      /^\+1 \(\d{3}\) \d{3}-\d{4}$/,  // Matches +1 (123) 456-7890
      /^\d{3}-\d{3}-\d{4}$/,          // Matches 123-456-7890
      /^\(\d{3}\) \d{3}-\d{4}$/       // Matches (123) 456-7890
    ];

    // Check if the phone matches at least one of the patterns
    const phoneMatchesPattern = phonePatterns.some(pattern => pattern.test(customerData.phone));
    expect(phoneMatchesPattern).toBeTruthy();
  });

  test('Create customer with extended locale', async ({ page }) => {
    // Generate customer data using the extended locale
    const customerData = await createCustomerDataWithExtendedLocale();

    // Log the generated data to the console
    console.log('Customer data with extended locale:');
    console.log(JSON.stringify(customerData, null, 2));

    // Verify that the phone number follows one of the custom UK formats
    const phonePatterns = [
      /^\+44 7\d{3} \d{6}$/,  // Matches +44 7123 456789
      /^07\d{3} \d{6}$/,      // Matches 07123 456789
      /^01\d{3} \d{6}$/,      // Matches 01123 456789
      /^02\d \d{4} \d{4}$/    // Matches 021 1234 5678
    ];

    // Check if the phone matches at least one of the patterns
    const phoneMatchesPattern = phonePatterns.some(pattern => pattern.test(customerData.phone));
    expect(phoneMatchesPattern).toBeTruthy();
  });

});
