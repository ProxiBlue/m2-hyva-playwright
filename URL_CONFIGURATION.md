# URL Configuration for Playwright Tests

## Issues Fixed

This document explains fixes for the following errors that were occurring during test execution:

1. Invalid URL error:
```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "admin/admin", waiting until "load"
```

2. SSL certificate error:
```
Error: page.goto: net::ERR_CERT_AUTHORITY_INVALID at https://hyva.ddev.site//admin
Call log:
  - navigating to "https://hyva.ddev.site//admin", waiting until "load"
```

3. Double slash in URL:
```
Notice the double slash in the URL: https://hyva.ddev.site//admin
```

## Root Causes

1. **Invalid URL Error**: This was caused by incorrect URL configuration in the `config.private.json` files. When the URL and admin path were concatenated, they formed an invalid URL without a proper protocol and domain.

2. **SSL Certificate Error**: This was caused by the browser rejecting the self-signed or invalid SSL certificate used by the development environment. This is common in local development setups using tools like DDEV.

3. **Double Slash in URL**: This was caused by simple string concatenation of the base URL and the admin path. If the base URL ended with a slash (e.g., "https://hyva.ddev.site/") and the admin path started with a slash (e.g., "/admin"), it resulted in a URL with a double slash (e.g., "https://hyva.ddev.site//admin").

## Solutions

The following changes were made to fix the issues:

### For the Invalid URL Error:

1. Updated all `config.private.json` files to use a proper URL format with protocol and domain:
   ```json
   {
     "url": "https://hyva.ddev.site/"
   }
   ```

2. Added a separate `admin_path` property to clearly define the admin path:
   ```json
   {
     "admin_path": "admin"
   }
   ```

### For the SSL Certificate Error:

1. Added the `ignoreHTTPSErrors: true` option to the Playwright configuration in all relevant files:
   - In `playwright.config.ts`:
   ```
   use: {
     ignoreHTTPSErrors: true,
     /* other options */
   }
   ```

2. Added the `NODE_TLS_REJECT_UNAUTHORIZED=0` environment variable to the test scripts in `package.json`:
   ```
   "scripts": {
     "test": "NODE_TLS_REJECT_UNAUTHORIZED=0 APP_NAME=hyva  TEST_BASE=hyva npx playwright test"
   }
   ```

3. Fixed an issue with `ignoreHTTPSErrors` in launch options:
   - Removed `ignoreHTTPSErrors` from `launchOptions` in all playwright.config.ts files:
   ```typescript
   // Before
   launchOptions: {
     slowMo: 500,
     ignoreHTTPSErrors: true, // This is no longer supported in launch options
   }

   // After
   launchOptions: {
     slowMo: 500,
   }
   ```

   - Moved `ignoreHTTPSErrors` from browser launch to browser context in global-setup.ts:
   ```typescript
   // Before
   const browser = await chromium.launch({ ignoreHTTPSErrors: true });
   const context = await browser.newContext();

   // After
   const browser = await chromium.launch();
   const context = await browser.newContext({ ignoreHTTPSErrors: true });
   ```

This tells Playwright to ignore HTTPS errors and continue with the test execution even when encountering invalid SSL certificates. The `ignoreHTTPSErrors` option must be set on the browser context, not in the launch options, as it is no longer supported in launch options in recent versions of Playwright.

### For the Double Slash in URL:

1. Added a utility function to properly join URL parts in both `admin.page.ts` and `global-setup.ts`:
   ```typescript
   function joinUrl(base: string, path: string): string {
     // Remove trailing slash from base if present
     const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
     // Remove leading slash from path if present
     const cleanPath = path.startsWith('/') ? path.slice(1) : path;
     // Join with a single slash
     return `${cleanBase}/${cleanPath}`;
   }
   ```

2. Updated all URL concatenations to use this function:
   ```
   // Before
   await page.goto(process.env.url + process.env.admin_path);

   // After
   const adminUrl = joinUrl(process.env.url || '', process.env.admin_path || 'admin');
   await page.goto(adminUrl);
   ```

This ensures that URLs are properly constructed without double slashes, regardless of whether the base URL ends with a slash or the path starts with a slash.

## Proper URL Configuration

When configuring URLs in the `config.private.json` files, always follow these guidelines:

1. The `url` property should include the protocol and domain with a trailing slash:
   ```json
   {
     "url": "https://yourdomain.com/"
   }
   ```

2. The `admin_path` property should specify just the path segment without leading or trailing slashes:
   ```json
   {
     "admin_path": "admin"
   }
   ```

This ensures that when the URL is constructed in the code using:
```typescript
process.env.url + process.env.admin_path
```

It results in a valid URL like `"https://yourdomain.com/admin"`.

## Testing

After making these changes, the tests should be able to navigate to the admin panel without errors. If you encounter any issues, verify that your `config.private.json` files are properly configured according to the guidelines above.

It is preferred to keep the admin url path a seperate config value as some setups could run admin on a different url/domain.
