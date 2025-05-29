import { expect as playwrightExpect, test } from "@playwright/test";
import { initConfig } from "./config.init";

const appName = process.env.APP_NAME || 'hyva';
initConfig(appName);

const appDir = "./src/apps/" + appName;

export const appConfigPath = appDir + "/playwright.config.ts";

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T> {
      toBeWithinRange(a: number, b: number): R;
    }
  }
}

playwrightExpect.extend({
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

/**
 * Format a value for display in logs
 *
 * @param value The value to format
 * @returns A string representation of the value
 */
function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  if (typeof value === 'object') {
    // For DOM elements or Playwright locators, try to get a useful description
    if (value.constructor && value.constructor.name.includes('Locator')) {
      return `Locator(${value.toString()})`;
    }

    // For other objects, convert to JSON with a max length
    try {
      const json = JSON.stringify(value);
      return json.length > 100 ? json.substring(0, 97) + '...' : json;
    } catch (e) {
      return String(value);
    }
  }

  return String(value);
}

/**
 * A wrapper around the Playwright expect function that adds logging functionality
 *
 * @param actual The actual value to test
 * @param message Optional message to include in the log
 * @returns The Playwright expect object for chaining
 */
export function expect<T>(actual: T, message?: string): ReturnType<typeof playwrightExpect<T>> {
  // Create a log message based on the actual value
  const logMessage = message || `Expecting [${typeof actual}]: ${formatValue(actual)}`;

  // Try to get the project name from the test context
  let projectName = "Test";
  try {
    // This might throw an error if called outside of a test context
    const testInfo = test.info();
    if (testInfo && testInfo.project) {
      projectName = testInfo.project.name;
    }
  } catch (e) {
    // Ignore errors and use the default project name
  }

  // Log the expectation
  test.step(projectName + ": " + logMessage, async () => {});

  // Return the original expect for chaining
  return playwrightExpect(actual);
}
