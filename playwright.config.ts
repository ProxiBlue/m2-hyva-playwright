import { PlaywrightTestConfig, devices, expect } from "@playwright/test";

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T> {
      toBeWithinRange(a: number, b: number): R;
    }
  }
}

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => "passed",
        pass: true,
      };
    } else {
      return {
        message: () => "failed",
        pass: false,
      };
    }
  },
});

const config: PlaywrightTestConfig = {
  testDir: "src/apps/ui-testing-playground",
  testMatch: "src/apps/ui-testing-playground/tests/*.spec.ts",
  timeout: 20 * 1000,
  retries: 3,
  workers: 2,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ["dot"],
    [
      "monocart-reporter",
      {
        outputFile: "monocart-report/grid/index.html",
      },
    ],
    [
      "json",
      {
        outputFile: "json-reports/json-report.json",
      },
    ],
    [
      "html",
      {
        open: "never",
      },
    ],
    ["./src/utils/custom-reporter.ts"],
  ],
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
      slowMo: 1500,
    },
  },
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
      name: "Pixel 5",
      use: {
        browserName: "chromium",
        ...devices["Pixel 5"],
      },
    },
    {
      name: "iPhone 12",
      use: {
        browserName: "webkit",
        ...devices["iPhone 12"],
      },
    },
  ],
};

export default config;
