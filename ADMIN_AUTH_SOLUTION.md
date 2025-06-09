# On-Demand Admin Authentication Solution

## Problem

Previous approach created admin users for all tests in certain apps (checkout, hyva, pps) even if they didn't actually use admin functionality. This led to unnecessary admin user creation and potential session conflicts.

## Solution

The new solution creates temporary admin users on-demand when a test actually needs to access the admin area. Each admin user is created just before login and removed after the test completes.

### Key Components

1. **On-Demand Admin User Creation**
   - Admin users are created only when a test actually calls `adminPage.login()`
   - Each admin user has a unique username and a strong, randomly generated password
   - Admin users are created using the existing `admin-users.sh` script

2. **Strong Password Generation**
   - Passwords are generated with a mix of uppercase, lowercase, numbers, and special characters
   - Each password is unique and meets security requirements

3. **Automatic Cleanup**
   - Temporary admin users are automatically removed after the test completes
   - A cleanup process runs once at the beginning of the entire test suite to remove any straggling admin users from previous runs

4. **No Configuration Required**
   - No need for config.private.json or environment variables with admin credentials
   - The admin path is still configurable, but credentials are generated automatically

### Files Modified

1. `tests/m2-hyva-playwright/src/apps/admin/pages/admin.page.ts`
   - Added methods to create and remove temporary admin users
   - Added method to generate strong passwords
   - Modified login method to create a temporary admin user before logging in
   - Added teardown to remove the temporary admin user after the test completes

2. `tests/m2-hyva-playwright/global-setup.ts`
   - Removed admin user creation and authentication logic
   - Added cleanup of straggling admin users at startup

3. `tests/m2-hyva-playwright/src/apps/common/fixtures/index.ts`
   - Removed admin authentication logic
   - Simplified context creation

## How to Use

No changes are needed in the test files themselves. The solution works transparently with existing tests. When a test calls `adminPage.login()`, a temporary admin user is created, used for the test, and then removed.

## Cleaning Up Temporary Admin Users

Temporary admin users are automatically removed after each test, but if you need to manually clean them up:

1. **During Test Development**
   - Call `adminPage.removeAllTempAdminUsers()` in your test

2. **Outside of Tests**
   - Run the following command:
   ```
   ddev exec "cd /var/www/html && mysql -e \"DELETE FROM admin_user WHERE username LIKE 'temp_admin_%';\""
   ```

## Troubleshooting

If authentication issues occur:
1. Check that the admin path is correctly set in environment variables or config files
2. Verify that the selectors used for login match in `admin.locator.ts`
3. Run the cleanup command above to remove any straggling admin users
