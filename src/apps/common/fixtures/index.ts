import { test as baseTest, BrowserContext } from "@playwright/test";
import { createCustomerData } from "@common/fixtures/customer";
import { CustomerData } from '@common/interfaces/CustomerData';
import { expect as customExpect } from "../../../../playwright.config";
import path from "path";
import fs from "fs";

type pages = {
    customerData: CustomerData;
    context: BrowserContext;
    page: ReturnType<BrowserContext['newPage']>;
    workerId: number;
};

const testPages = baseTest.extend<pages>({
    // Add a workerId fixture to identify which worker is running the test
    workerId: [async ({}, use, workerInfo) => {
        // Use the worker index as the worker ID
        await use(workerInfo.workerIndex);
    }, { scope: 'worker' }],

    // Override the default context fixture to create a context with ignoreHTTPSErrors
    // and load the appropriate authentication state for admin tests
    context: async ({ browser, workerId }, use) => {
        let contextOptions = { ignoreHTTPSErrors: true };

        // Check if this is an admin test by looking at the test file path
        const testFilePath = process.env.TEST_FILE_PATH || '';
        const isAdminTest = testFilePath.includes('admin') || testFilePath.includes('admin.spec.ts') || process.env.TEST_BASE === 'admin';

        // If this is an admin test, load the authentication state for this worker
        if (isAdminTest) {
            const authPath = process.env[`ADMIN_AUTH_${workerId}`];
            if (authPath && fs.existsSync(authPath)) {
                console.log(`Loading auth state for worker ${workerId} from ${authPath}`);
                contextOptions['storageState'] = authPath;
            } else {
                console.warn(`Auth state not found for worker ${workerId}. Will perform regular login.`);
            }
        }

        // Create a new browser context with the options
        const context = await browser.newContext(contextOptions);
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
