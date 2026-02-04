import {devices, PlaywrightTestConfig} from "@playwright/test";
import path from "path";

const config: PlaywrightTestConfig = {
    testDir: process.env.TEST_BASE ? `../${process.env.TEST_BASE}/tests` : 'tests',
    testMatch: "tests/*.spec.ts",
    timeout: 30 * 1000,
    retries: 1,
    workers: 3,
    globalSetup: require.resolve("@home/global-setup"),
    globalTeardown: require.resolve("@home/global-teardown"),
    outputDir: path.join(process.cwd(), '../../../test-results', 'pps', `luma-${process.env.TEST_BASE || 'default'}`),
    expect: {
        timeout: 20000,
    },
    use: {
        headless: true,
        actionTimeout: 0,
        trace: "retain-on-failure",
        ignoreHTTPSErrors: true,
        video: "on-first-retry",
        screenshot: "only-on-failure",
        acceptDownloads: true,
        colorScheme: "dark",
        launchOptions: {
            slowMo: 500,
        },
    },
    preserveOutput: 'failures-only',
    reporter: [
        ["list"],
        [
            "json",
            {
                outputFile: path.join(process.cwd(), '../../../test-results', 'pps', `luma-${process.env.TEST_BASE || 'default'}-reports`, "json-reports/json-report.json"),
            },
        ],
        [
            "html",
            {
                outputFolder: path.join(process.cwd(), '../../../test-results', 'pps', `luma-${process.env.TEST_BASE || 'default'}-reports`, "playwright-report/"),
                open: "never",
            },
        ]
    ],
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                viewport: { width: 1920, height: 1080 },
                ignoreHTTPSErrors: true,
            },
        },
        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
                viewport: { width: 1920, height: 1080 },
                ignoreHTTPSErrors: true,
            },
        },
        {
            name: "webkit",
            use: {
                ...devices["Desktop Safari"],
                viewport: { width: 1920, height: 1080 },
                ignoreHTTPSErrors: true,
            },
        }
    ],
};

export default config;
