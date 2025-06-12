# Bootstrap Process Changes

## Issues Identified and Fixed

1. **Bug in Directory Check**
   - The bootstrap script was checking for the existence of `$DIR` but defining `$APP`, so the directory check wasn't working correctly.
   - Fixed by changing the check to use `$APP` instead of `$DIR`.

2. **Outdated Admin Authentication**
   - The `config.private.json` file still had fields for `admin_user` and `admin_password`, which are no longer needed according to the new on-demand admin authentication approach described in `ADMIN_AUTH_SOLUTION.md`.
   - Removed these fields from the template file.

3. **Hardcoded App Name in run.sh**
   - The `run.sh` file was hardcoded to use "pps" as the app name, which is not appropriate for a bootstrap file that should be configurable for any app name.
   - Updated the template file to use "NEW_APP_NAME" as a placeholder, which is replaced with the actual app name during bootstrap.

4. **Syntax Error in package.json**
   - The `package.json` file had a trailing comma in the "scripts" object, which could cause errors when running npm commands.
   - Removed the trailing comma.

5. **Missing App Name Replacement in run.sh**
   - The bootstrap script was replacing "NEW_APP_NAME" with the actual app name in `package.json`, but not in `run.sh`.
   - Added a sed command to also replace "NEW_APP_NAME" in `run.sh`.

6. **Outdated config.json Structure**
   - The `config.json` file had an outdated structure with an "env" object containing different environments.
   - Updated the structure to match the pps app's config.json, with a direct "url" field, a structured "skipBaseTests" object, and a "currency_symbol" field.
   - This ensures that new apps have the same configuration structure as the pps app.

## Testing

The updated bootstrap script was tested by creating a new app called 'nto'. The script successfully:
- Created the app directory with all the necessary subdirectories
- Copied all the required files
- Replaced "NEW_APP_NAME" with "nto" in `package.json`
- Set up the app to use npm scripts instead of run.sh

## How to Use

To bootstrap a new app, run the following command from the `tests/m2-hyva-playwright` directory:

```bash
./bootstrapNewApp.sh <app_name>
```

Replace `<app_name>` with the name of your new app. The script will create a new app directory in `src/apps/<app_name>` with all the necessary files and directories.

After bootstrapping, you'll need to:
1. Fill in the URL in `config.private.json`
2. Add any app-specific tests in the `tests` directory
3. Add any app-specific page objects in the `pages` directory
4. Add any app-specific fixtures in the `fixtures` directory

You can then run the tests using npm scripts:

```bash
cd src/apps/<app_name>
npm run test:all         # Run all test bases (admin, hyva, app)
npm run test:admin       # Run only admin tests
npm run test:hyva        # Run only hyva tests
npm run test:app         # Run only app-specific tests
npm run test:debug       # Run tests in debug mode
npm run test:ui          # Run tests in UI mode
npm run test:display     # Run tests in headed mode
npm run report           # Show test report
```

Or, you can run tests directly with Playwright:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 APP_NAME=<app_name> TEST_BASE=admin npx playwright test --workers=1 --retries=0
NODE_TLS_REJECT_UNAUTHORIZED=0 APP_NAME=<app_name> TEST_BASE=hyva npx playwright test
NODE_TLS_REJECT_UNAUTHORIZED=0 APP_NAME=<app_name> TEST_BASE=<app_name> npx playwright test
```

Note: The `run.sh` script has been eliminated from all code/apps in favor of npm scripts that directly run Playwright tests.
