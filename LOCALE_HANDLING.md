# Locale Handling in m2-hyva-playwright

This document explains how locales are dynamically handled in the m2-hyva-playwright test suite and how extra locale data can be injected.

## How Locales are Configured

The test suite uses [Faker.js](https://fakerjs.dev/) to generate locale-specific test data. The locale is configured in the `config.json` file of each app:

```json
{
  "faker_locale": "en_US"
}
```

This configuration is loaded in the `config.init.ts` file, which sets the `process.env.faker_locale` environment variable:

```typescript
process.env.faker_locale = jsonData.faker_locale;
```

The environment variable is then used in the `common/fixtures/index.ts` file to pass the locale to the `createCustomerData` function:

```typescript
customerData: async ({ page }, use) => {
    const customerData: CustomerData = await createCustomerData(process.env.faker_locale);
    await use(customerData);
}
```

## How Customer Data is Generated

The `createCustomerData` function in `common/fixtures/customer.ts` generates customer data based on the specified locale:

```typescript
export async function createCustomerData(locale: string = "en_US"): Promise<CustomerData> {
    // @ts-ignore
    if (!allFakers[locale]) {
        throw new Error(`Locale '${locale}' is not supported by faker. If empty, please set locale in config file`);
    }
    // @ts-ignore
    const fakerLocale = allFakers[locale];
    // ... generate customer data using fakerLocale
}
```

The function uses the `allFakers` object from the `@faker-js/faker` library to get the faker instance for the specified locale. If the locale is not supported, an error is thrown.

## How Extra Locale Data Can Be Injected

The test suite already includes an example of how to inject extra locale data. For the "en_AU" locale, it adds a custom `postcode_by_state` property to the `fakerLocale.rawDefinitions.location` object:

```typescript
if (locale == "en_AU") {
    state = fakerLocale.location.state({abbreviated: true});
    let zip = fakerLocale.location.zipCode({state: state});
    const stateMap: { [key: string]: string } = {
        NSW: "New South Wales",
        ACT: "Australian Capital Territory",
        VIC: "Victoria",
        QLD: "Queensland",
        SA: "South Australia",
        WA: "Western Australia",
        TAS: "Tasmania",
        NT: "Northern Territory"
    };
    fakerLocale.rawDefinitions.location.postcode_by_state = {
        NSW: [
            '{{number.int({"min": 2000,"max": 2599})}}',
            '{{number.int({"min": 2619,"max": 2899})}}'
        ],
        // ... other states
    }

    state = stateMap[state]
}
```

This example shows how to:

1. Add custom data to the faker instance for a specific locale
2. Use conditional logic based on the locale
3. Extend the faker instance with new properties

## How to Inject Your Own Extra Locale Data

You can inject your own extra locale data by following these steps:

1. Identify the locale you want to extend
2. Add conditional logic in the `createCustomerData` function to check for that locale
3. Add your custom data to the `fakerLocale.rawDefinitions` object

Here's an example of how to add custom phone number formats for the "en_GB" locale:

```typescript
if (locale == "en_GB") {
    // Add custom phone number formats for UK
    fakerLocale.rawDefinitions.phone.formats = [
        '+44 7### ######',
        '07### ######',
        '01### ######',
        '02# #### ####'
    ];
}
```

## Example Implementation

For a complete example of how to inject extra locale data, see the following files in the test suite:

- [custom-locale-example.ts](src/apps/pps/examples/custom-locale-example.ts): Contains two example functions that demonstrate how to create a custom locale and how to extend an existing locale.
- [custom-locale-test.spec.ts](src/apps/pps/examples/custom-locale-test.spec.ts): Contains example tests that use the custom locale data and verify that it works as expected.

To run the example tests:

```bash
ddev exec "cd tests/m2-hyva-playwright/src/app/pps && APP_NAME=pps TEST_BASE=pps npx playwright test examples/custom-locale-test.spec.ts"
```

## Creating a New Locale

If you need to create a completely new locale that isn't supported by Faker.js, you can extend an existing locale and override its definitions:

```typescript
if (locale == "custom_locale") {
    // Use en_US as a base
    const baseLocale = allFakers["en_US"];

    // Create a new locale by copying the base locale
    const customLocale = { ...baseLocale };

    // Override definitions as needed
    customLocale.rawDefinitions.location.city_patterns = [
        "{{name.first_name}}ville",
        "{{name.last_name}} City",
        "New {{name.first_name}}"
    ];

    // Use the custom locale
    fakerLocale = customLocale;
}
```

## Conclusion

The m2-hyva-playwright test suite provides a flexible way to handle locales dynamically. By configuring the locale in the `config.json` file and using Faker.js to generate locale-specific data, the tests can be run with different locales without changing the test code. Additionally, the test suite allows for injecting extra locale data to customize the generated data for specific locales.
