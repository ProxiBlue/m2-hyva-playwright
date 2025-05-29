import { test as baseTest, BrowserContext } from "@playwright/test";
import { createCustomerData } from "@common/fixtures/customer";
import { CustomerData } from '@common/interfaces/CustomerData';
import { expect as customExpect } from "../../../../playwright.config";

type pages = {
    customerData: CustomerData;
    context: BrowserContext;
    page: ReturnType<BrowserContext['newPage']>;
};

const testPages = baseTest.extend<pages>({
    // Override the default context fixture to create a context with ignoreHTTPSErrors
    context: async ({ browser }, use) => {
        // Create a new browser context with ignoreHTTPSErrors set to true
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        await use(context);
        await context.close();
    },

    // Override the default page fixture to use our custom context
    page: async ({ context }, use) => {
        const page = await context.newPage();
        await use(page);
    },

    customerData: async ({ page }, use) => {
        const customerData: CustomerData = await createCustomerData(process.env.faker_locale);
        await use(customerData);
    },
});

baseTest.use({ ignoreHTTPSErrors: true})
export const test = testPages;
export const expect = customExpect;
export const describe = testPages.describe;
