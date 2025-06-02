# Configuration Initialization Solution

## Problem

The `authenticateAdmin` function in `global-setup.ts` was running before `config.init.ts` had a chance to set up critical environment variables. This caused authentication failures because the admin credentials and URLs were not available when needed.

## Root Cause

In the original implementation:

1. The `initConfig` function from `config.init.ts` was imported and called in `playwright.config.ts`
2. The global setup ran after the Playwright configuration was loaded
3. However, the environment variables set by `initConfig` were not reliably available to the global setup

This could be due to:
- The global setup running in a different process or context
- The order of execution being different than expected
- Environment variables not being properly propagated between different parts of the Playwright execution flow

## Solution

The solution implemented ensures that the configuration is explicitly initialized in the global setup before any authentication attempts:

1. Import the `initConfig` function directly in `global-setup.ts`:
   ```typescript
   import { initConfig } from "./config.init";
   ```

2. Call `initConfig` at the beginning of the `globalSetup` function:
   ```typescript
   const globalSetup = async (config: FullConfig) => {
     // Initialize configuration to ensure environment variables are set
     const appName = process.env.APP_NAME || 'hyva';
     console.log(`Initializing configuration for app: ${appName}`);
     initConfig(appName);
     
     // Rest of the setup code...
   }
   ```

This ensures that all critical environment variables are set before the admin authentication process begins, regardless of whether they were already set by the Playwright configuration.

## Files Modified

1. `tests/m2-hyva-playwright/global-setup.ts`
   - Added import for `initConfig`
   - Added explicit call to `initConfig` at the beginning of the `globalSetup` function

## Benefits

1. **Reliability**: The solution ensures that configuration is always initialized before authentication
2. **Clarity**: The explicit initialization makes the dependency clear
3. **Maintainability**: The solution is simple and easy to understand

## Testing

The solution has been tested by running the Playwright tests and verifying that:
1. The configuration is properly initialized
2. The admin authentication succeeds
3. No errors occur related to missing environment variables

## References

- [Playwright Global Setup Documentation](https://playwright.dev/docs/test-global-setup-teardown)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)
