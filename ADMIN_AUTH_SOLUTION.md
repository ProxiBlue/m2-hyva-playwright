# Admin Authentication Solution for Parallel Workers

## Problem

When running admin tests in parallel with multiple workers, if test A logs into the admin panel, it can get logged out if test B runs on another worker and also logs in. This is because all workers are using the same admin account, and Magento only allows one active session per account.

## Solution

The solution implemented is based on Playwright's "one account per parallel worker" approach, as described in the [Playwright authentication documentation](https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker).

### Key Components

1. **Global Setup Authentication**
   - In `global-setup.ts`, we authenticate once per worker during setup
   - Each worker's authentication state is saved to a separate file in the `auth` directory
   - Environment variables are set to point to these authentication state files

2. **Worker-Specific Context**
   - In `src/apps/common/fixtures/index.ts`, we added a `workerId` fixture to identify which worker is running each test
   - The `context` fixture is modified to load the appropriate authentication state based on the worker ID
   - This ensures each worker maintains its own separate authenticated session

3. **Smart Login Handling**
   - The `AdminPage.login()` method now checks if the page is already authenticated before attempting to log in
   - The `AdminPage.navigateTo()` method also checks authentication status after navigation
   - This prevents unnecessary login attempts when the browser is already authenticated

4. **Configuration Handling**
   - The global setup can load admin credentials from environment variables or app-specific config files
   - This makes the solution more robust across different environments

### Files Modified

1. `tests/m2-hyva-playwright/global-setup.ts`
   - Added authentication for each worker during setup
   - Added storage state saving for each worker

2. `tests/m2-hyva-playwright/src/apps/common/fixtures/index.ts`
   - Added workerId fixture
   - Modified context fixture to load the appropriate authentication state

3. `tests/m2-hyva-playwright/src/apps/admin/pages/admin.page.ts`
   - Updated login method to check if already authenticated
   - Updated navigateTo method to handle authentication status

4. `tests/m2-hyva-playwright/auth/README.md`
   - Added documentation for the auth directory

5. `tests/m2-hyva-playwright/.gitignore`
   - Added entry to ignore auth state files

## How to Use

No changes are needed in the test files themselves. The solution works transparently with existing tests. When running tests with multiple workers, each worker will automatically use its own authenticated session.

## Troubleshooting

If authentication issues occur:
1. Delete the files in the `auth` directory to force re-authentication
2. Check that admin credentials are correctly set in environment variables or config files
3. Verify that the selectors used for login match between `global-setup.ts` and `admin.locator.ts`
