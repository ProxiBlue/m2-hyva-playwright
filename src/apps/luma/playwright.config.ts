import {devices, PlaywrightTestConfig} from "@playwright/test";

const config: PlaywrightTestConfig = {
    testDir: process.env.TEST_BASE ? `../${process.env.TEST_BASE}/tests` : 'tests',
    testMatch: "tests/*.spec.ts",
    timeout: 30 * 1000,
    retries: 1,
    workers: 3,
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
        ]
    ],
    projects: [
        {
            name: "chromium",
            use: {...devices["Desktop Chrome"], ignoreHTTPSErrors: true },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"], ignoreHTTPSErrors: true },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"], ignoreHTTPSErrors: true },
        }
    ],
};

export default config;
