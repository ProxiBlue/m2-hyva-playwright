import {devices, PlaywrightTestConfig} from "@playwright/test";
import path from "path";

const config: PlaywrightTestConfig = {
    testDir: process.env.TEST_BASE ? `../${process.env.TEST_BASE}/tests` : 'tests',
    testMatch: "tests/*.spec.ts",
    timeout: 30 * 1000,
    retries: 3,
    workers: 3,
    globalSetup: require.resolve("@home/global-setup"),
    globalTeardown: require.resolve("@home/global-teardown"),
    outputDir: path.join(process.cwd(), '../../../test-results', 'pps', `hyva-${process.env.TEST_BASE || 'default'}`),
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
            slowMo: 500
        },
    },
    preserveOutput: 'failures-only',
    reporter: [
        ["list"],
        [
            "json",
            {
                outputFile: path.join(process.cwd(), '../../../test-results', 'pps', `hyva-${process.env.TEST_BASE || 'default'}-reports`, "json-reports/json-report.json"),
            },
        ],
        [
            "html",
            {
                outputFolder: path.join(process.cwd(), '../../../test-results', 'pps', `hyva-${process.env.TEST_BASE || 'default'}-reports`, "playwright-report/"),
                open: "never",
            },
        ],
    ],
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                viewport: { width: 1280, height: 1400 },
                ignoreHTTPSErrors: true,
            },
        },
        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
                viewport: { width: 1280, height: 1400 },
                ignoreHTTPSErrors: true,
                // Firefox-specific settings for better stability
                actionTimeout: 15000,
                navigationTimeout: 30000,
            },
            // Reduce workers for Firefox to avoid context issues
            fullyParallel: false,
        },
        {
            name: "webkit",
            use: {
                ...devices["Desktop Safari"],
                viewport: { width: 1280, height: 1400 },
                ignoreHTTPSErrors: true,
            },
        }
    ],
};

export default config;
