import { expect } from "@playwright/test";
import { initConfig } from "./config.init";

const appName = process.env.APP_NAME;
initConfig(appName);

const appDir = "../../" + appName;
export const appConfigPath = appDir + "/playwright.config.ts";

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
