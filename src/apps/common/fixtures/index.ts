import { test as baseTest, BrowserContext, TestInfo } from "@playwright/test";
import { createCustomerData } from "@common/fixtures/customer";
import { CustomerData } from '@common/interfaces/CustomerData';
import { expect as customExpect } from "../../../../playwright.config";
import path from "path";
import fs from "fs";

// Get the test results directory based on the app and test base
const appName = process.env.APP_NAME || 'hyva';
const testBase = process.env.TEST_BASE || 'default';
const testResultsDir = path.join(process.cwd(), '../../../test-results', `${appName}-${testBase}`);

// Ensure the test results directory exists
if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
}

// Function to create a sanitized directory name from test title
function sanitizeTestTitle(title: string): string {
    // Replace spaces and special characters with hyphens
    return title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

type pages = {
    customerData: CustomerData;
    context: BrowserContext;
    page: ReturnType<BrowserContext['newPage']>;
    workerId: number;
    testInfo: TestInfo;
};

const testPages = baseTest.extend<pages>({
    // Add a workerId fixture to identify which worker is running the test
    workerId: [async ({}, use, workerInfo) => {
        // Use the worker index as the worker ID
        await use(workerInfo.workerIndex);
    }, { scope: 'worker' }],

    // Add a testInfo fixture to access test information
    testInfo: async ({}, use, testInfo) => {
        await use(testInfo);
    },

    // Override the default context fixture to create a context with ignoreHTTPSErrors and recordVideo
    context: async ({ browser, testInfo }, use) => {
        // Create a test-specific directory for videos
        const testTitle = testInfo.title;
        const projectName = testInfo.project?.name || 'unknown';

        // Get the parent title (test suite)
        // Since the parent chain is not available in the testInfo object at this point,
        // we'll extract information from the file path and test title

        // Extract the file name from the file path
        const filePath = testInfo.file || '';
        const fileName = path.basename(filePath, '.spec.ts');

        // Use the file name as a fallback for the parent title
        let parentTitle = fileName || 'unknown';

        // For admin.spec.ts, we know the parent title is "Admin Tests - Order Email Edits"
        if (fileName === 'admin') {
            parentTitle = 'Admin-Tests---Order-Email-Edits';
        }

        // Create a directory path that includes the parent title (test suite), test title, and browser
        const testDirName = `${sanitizeTestTitle(parentTitle)}-${sanitizeTestTitle(testTitle)}-${projectName}`;
        const testVideoDir = path.join(testResultsDir, testDirName);

        // Ensure the test-specific directory exists
        if (!fs.existsSync(testVideoDir)) {
            fs.mkdirSync(testVideoDir, { recursive: true });
        }

        // Check if this is the first retry (retry === 0) or a subsequent retry
        const isFirstRetry = testInfo.retry === 0;

        // Create a context with ignoreHTTPSErrors and conditionally enable video/trace/screenshot
        let contextOptions = {
            ignoreHTTPSErrors: true,
            // Only record video on the first retry
            recordVideo: isFirstRetry ? {
                dir: testVideoDir,
                size: { width: 1280, height: 720 }
            } : undefined,
            // Only capture trace on the first retry
            trace: isFirstRetry ? "retain-on-failure" : "off",
            // Only take screenshots on the first retry
            screenshot: isFirstRetry ? "only-on-failure" : "off"
        };

        // Set the output directory for this test to ensure all artifacts go to the same place
        testInfo.outputDir = testVideoDir;

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
