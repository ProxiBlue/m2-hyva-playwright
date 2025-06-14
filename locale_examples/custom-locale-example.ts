import { allFakers } from '@faker-js/faker';
import { CustomerData } from '@common/interfaces/CustomerData';

/**
 * Example of how to inject extra locale data for a custom locale
 *
 * This example creates a custom locale based on en_US but with custom city names
 * and phone number formats.
 *
 * To use this in your tests:
 * 1. Import this file in your test file
 * 2. Set the faker_locale in your config.json to "custom_locale"
 */
export async function createCustomerDataWithCustomLocale(): Promise<CustomerData> {
    const locale = "custom_locale";

    // Use en_US as a base
    const baseLocale = allFakers["en_US"];

    // Create a new locale by copying the base locale
    const customLocale = { ...baseLocale };

    // Override definitions as needed
    //@ts-ignore
    customLocale.rawDefinitions.location.city_patterns = [
        "{{name.first_name}}ville",
        "{{name.last_name}} City",
        "New {{name.first_name}}"
    ];

    // Add custom phone number formats
    customLocale.rawDefinitions.phone.formats = [
        '+1 (###) ###-####',
        '###-###-####',
        '(###) ###-####'
    ];

    // Use the custom locale
    const fakerLocale = customLocale;

    // Generate customer data using the custom locale
    let firstname = fakerLocale.person.firstName();
    let lastname = fakerLocale.person.lastName();
    let email = fakerLocale.internet.email({firstName: firstname, lastName: lastname});

    return {
        firstName: firstname,
        lastName: lastname,
        email: email,
        password: fakerLocale.internet.password({length: 20, memorable: true, pattern: /[A-Z0-9]/, prefix: '@-1'}),
        street_one_line: fakerLocale.location.streetAddress(),
        state: fakerLocale.location.state({abbreviated: false}),
        city: fakerLocale.location.city(),
        zip: fakerLocale.location.zipCode(),
        state_code: fakerLocale.location.state({abbreviated: true}),
        phone: fakerLocale.phone.number({ style: 'national' })
    };
}

/**
 * Example of how to extend an existing locale with extra data
 *
 * This example extends the en_GB locale with custom phone number formats
 *
 * To use this in your tests:
 * 1. Import this file in your test file
 * 2. Set the faker_locale in your config.json to "en_GB"
 * 3. Call this function instead of createCustomerData
 */
export async function createCustomerDataWithExtendedLocale(): Promise<CustomerData> {
    const locale = "en_GB";

    // @ts-ignore
    if (!allFakers[locale]) {
        throw new Error(`Locale '${locale}' is not supported by faker. If empty, please set locale in config file`);
    }

    // @ts-ignore
    const fakerLocale = allFakers[locale];

    // Add custom phone number formats for UK
    fakerLocale.rawDefinitions.phone.formats = [
        '+44 7### ######',
        '07### ######',
        '01### ######',
        '02# #### ####'
    ];

    // Generate customer data using the extended locale
    let firstname = fakerLocale.person.firstName();
    let lastname = fakerLocale.person.lastName();
    let email = fakerLocale.internet.email({firstName: firstname, lastName: lastname});

    return {
        firstName: firstname,
        lastName: lastname,
        email: email,
        password: fakerLocale.internet.password({length: 20, memorable: true, pattern: /[A-Z0-9]/, prefix: '@-1'}),
        street_one_line: fakerLocale.location.streetAddress(),
        state: fakerLocale.location.state({abbreviated: false}),
        city: fakerLocale.location.city(),
        zip: fakerLocale.location.zipCode(),
        state_code: fakerLocale.location.state({abbreviated: true}),
        phone: fakerLocale.phone.number({ style: 'national' })
    };
}
