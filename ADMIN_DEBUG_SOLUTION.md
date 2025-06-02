# Admin Pre-Login Debug Solution

## Problem

There was an issue with the admin pre-login process. When the login attempt failed, there was no mechanism to capture debug information such as screenshots or videos of the failed login attempt.

## Solution

The solution implemented adds comprehensive debugging capabilities to the admin authentication process in the global setup:

1. **Video Recording**: Records a video of the entire login process for each worker
2. **Screenshot Capture**: Takes screenshots at key points:
   - Before login attempt (login page)
   - After a failed login attempt
3. **Error Logging**: Captures and logs detailed error information:
   - The error message and stack trace
   - The current URL at the time of failure
   - The HTML content of the page at the time of failure
4. **Organized Debug Artifacts**: Stores all debug information in a structured directory:
   - `/test-results/screenshots/`: Contains all captured screenshots
   - `/test-results/videos/`: Contains all recorded videos

### Key Components

1. **Browser Context Configuration**
   - Added video recording configuration to the browser context
   - Set video resolution to 1280x720 for clear playback

2. **Directory Structure**
   - Created a structured directory hierarchy for debug artifacts
   - Ensured directories exist before attempting to save files

3. **Try-Catch Implementation**
   - Wrapped the login process in a try-catch block
   - Added error handling to capture debug information when login fails
   - Used a finally block to ensure proper cleanup regardless of success or failure

4. **Naming Convention**
   - Used worker-specific naming for all debug artifacts
   - This ensures that debug information from different workers doesn't overwrite each other

### Files Modified

1. `tests/m2-hyva-playwright/global-setup.ts`
   - Modified the `authenticateAdmin` function to add debug capabilities
   - Added try-catch-finally blocks around the login process
   - Added code to capture screenshots and videos
   - Added code to create necessary directories

## How to Use

When a login failure occurs during the global setup process:

1. **View Error Messages**: Check the console output for detailed error messages
2. **Examine Screenshots**: Look in the `test-results/screenshots/` directory for:
   - `admin-login-page-worker{N}.png`: The login page before the login attempt
   - `admin-login-failed-worker{N}.png`: The page state after the login failure
3. **Watch Videos**: Look in the `test-results/videos/` directory for a video recording of the entire login process

## Troubleshooting

If you need to debug admin login issues:

1. Check the screenshots and videos in the test-results directory
2. Review the error messages in the console output
3. Look for specific error patterns:
   - Network connectivity issues
   - Authentication failures
   - Selector timing problems
   - Page structure changes

## References

This implementation follows best practices for Playwright debugging:
- https://playwright.dev/docs/videos
- https://playwright.dev/docs/screenshots
- https://playwright.dev/docs/debug
