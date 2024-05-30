import {devices, PlaywrightTestConfig} from "@playwright/test";

const config: PlaywrightTestConfig = {
    testDir: process.env.TEST_BASE ? `../${process.env.TEST_BASE}/tests` : 'tests',
    testMatch: "tests/*.spec.ts",
    timeout: 30 * 1000,
    retries: 1,
    workers: 5,
    globalSetup: require.resolve("@home/global-setup"),
    globalTeardown: require.resolve("@home/global-teardown"),
    expect: {
        timeout: 20000,
    },
    use: {
        headless: true,
        actionTimeout: 0,
        trace: "retain-on-failure",
        ignoreHTTPSErrors: true,
        video: "retain-on-failure",
        screenshot: "only-on-failure",
        acceptDownloads: true,
        colorScheme: "dark",
        launchOptions: {
            slowMo: 500,
        },
    },
    reporter: [
        ["list"],
        [
            "json",
            {
                outputFile: "reports/json-reports/json-report.json",
            },
        ],
        [
            "html",
            {
                outputFolder: "reports/playwright-report/",
                open: "never",
            },
        ],
        [
            "allure-playwright",
            {
                outputFolder: "reports/allure/allure-result/",
                open: "never",
            },
        ],
    ],
    projects: [
        {
            name: "chromium",
            use: {...devices["Desktop Chrome"] },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        }
    ],
};

export default config;
