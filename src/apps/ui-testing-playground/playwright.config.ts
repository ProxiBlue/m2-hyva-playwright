import { PlaywrightTestConfig, devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "tests",
  testMatch: "tests/*.spec.ts",
  timeout: 30 * 1000,
  retries: 3,
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
    video: "on-first-retry",
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
    // ["../../utils/reports/custom-reporter.ts"],
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
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Pixel-5",
      use: {
        browserName: "chromium",
        ...devices["Pixel 5"],
      },
    },
    {
      name: "iPhone-12",
      use: {
        browserName: "webkit",
        ...devices["iPhone 12"],
      },
    },
  ],
};

export default config;
