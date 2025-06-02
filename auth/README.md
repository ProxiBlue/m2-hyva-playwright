# Admin Authentication for Parallel Workers

This directory contains authentication state files for admin users, one per parallel worker. These files are created during the global setup process and are used to maintain separate authentication states for each worker when running tests in parallel.

## How it works

1. During global setup (`global-setup.ts`), a browser is launched for each worker and logs in to the admin panel.
2. The authentication state (cookies, localStorage, etc.) is saved to a file named `adminAuth{workerId}.json` in this directory.
3. When tests run, each worker loads its own authentication state from the corresponding file.
4. This ensures that each worker has its own authenticated session, preventing one worker from logging out another.

## Implementation Details

- The number of workers is determined by the `workers` setting in the Playwright configuration.
- Authentication state files are created during global setup and used by the browser contexts during test execution.
- The `AdminPage.login()` method checks if the page is already authenticated before attempting to log in again.

## Troubleshooting

If you encounter authentication issues:

1. Delete the files in this directory to force re-authentication during the next test run.
2. Check that the admin credentials in the environment variables are correct.
3. Verify that the selectors used for login in `global-setup.ts` match those in `admin.locator.ts`.

## References

This implementation is based on the Playwright documentation for authentication:
https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker
