import { PlaywrightTestConfig, devices, expect } from "@playwright/test";
import { initConfig } from "./config.init";

const appName = process.env.APP_NAME;
initConfig(appName);

const appDir = "apps/" + appName;
export const screenshotPath = "/screenshots/" + appDir + "/";
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
  // testDir: "src/" + appDir,
  // testMatch: "src/" + appDir + "/tests/*.spec.ts",
  // timeout: 30 * 1000,
  // retries: 3,
  // workers: 3,
  // preserveOutput: "failures-only",
  // globalSetup: require.resolve("./global-setup"),
  // globalTeardown: require.resolve("./global-teardown"),
  // expect: {
  //   timeout: 20000,
  // },
  // reporter: [
  //   // ["line"],
  //   ["list"],
  //   [
  //     "json",
  //     {
  //       outputFile:
  //         "./src/" + appDir + "/reports/json-reports/json-report.json",
  //     },
  //   ],
  //   [
  //     "html",
  //     {
  //       outputFolder: "./src/" + appDir + "/reports/playwright-report/",
  //       open: "never",
  //     },
  //   ],
  //   // ["./src/utils/reports/custom-reporter.ts"],
  //   [
  //     "allure-playwright",
  //     {
  //       outputFolder: "./src/" + appDir + "/reports/allure/allure-result/",
  //       open: "never",
  //     },
  //   ],
  // ],
  use: {
    headless: true,
    // actionTimeout: 0,
    // trace: "retain-on-failure",
    // ignoreHTTPSErrors: true,
    // video: "on-first-retry",
    // screenshot: "only-on-failure",
    // acceptDownloads: true,
    // colorScheme: "dark",
    // launchOptions: {
    //   slowMo: 500,
    // },
  },
  // projects: [
  //   {
  //     name: "chromium",
  //     use: { ...devices["Desktop Chrome"] },
  //   },
  //   {
  //     name: "firefox",
  //     use: { ...devices["Desktop Firefox"] },
  //   },
  //   {
  //     name: "webkit",
  //     use: { ...devices["Desktop Safari"] },
  //   },
  //   {
  //     name: "Pixel-5",
  //     use: {
  //       browserName: "chromium",
  //       ...devices["Pixel 5"],
  //     },
  //   },
  //   {
  //     name: "iPhone-12",
  //     use: {
  //       browserName: "webkit",
  //       ...devices["iPhone 12"],
  //     },
  //   },
  // ],
};

export default config;
