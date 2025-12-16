# Test Reports in m2-hyva-playwright

This document describes how test reports work in the m2-hyva-playwright testing framework, including how to find and interpret test results, screenshots, and videos.

## Report Directory Structure

Test results are stored in two locations:

1. Failed test artifacts (screenshots, videos, traces) are stored in the `test-results` directory at the root of the m2-hyva-playwright project.
2. HTML and JSON reports are stored in the `tests` directory at the root of the repository, allowing them to be committed and pushed to a test server for viewing.

The directory structure is organized as follows:

```
test-results/                        # Contains failed test artifacts
├── {app-name}-{test-base}/          # App-specific test results (e.g., pps-admin, hyva-default)
│   ├── {test-name}/                 # Directory for each failed test
│   │   ├── test-failed-1.png        # Screenshot of the failed test
│   │   ├── trace.zip                # Trace file for debugging
│   │   └── video.webm               # Video recording of the test
│   └── ...
├── screenshots/                     # Screenshots directory
│   └── ...                          # Various screenshots
└── videos/                          # Videos directory
    └── ...                          # Various video recordings

tests/                               # Contains HTML and JSON reports
└── {app-name}-{test-base}-reports/  # HTML and JSON reports
    ├── json-reports/
    │   └── json-report.json         # JSON report data
    └── playwright-report/           # HTML report files
        └── index.html               # Main HTML report
```

## How Test Results Are Organized

The test results are organized by app name and test base. Each app-specific test result directory contains:

1. **Failed Test Directories**: Each failed test gets its own directory named after the test.
2. **Screenshots**: Screenshots are captured when tests fail.
3. **Videos**: Video recordings are saved for failed tests.
4. **Trace Files**: Trace files for debugging test failures.

The framework uses the `preserveOutput: 'failures-only'` option in the Playwright configuration, which ensures that only the output for failed tests is preserved. This helps keep the test results directory clean and focused on issues that need attention.

## Finding and Interpreting Screenshots and Videos

### Screenshots

Screenshots are automatically captured when a test fails. They can be found in two locations:

1. **In the failed test directory**: Each failed test has its own directory containing a screenshot of the failure.
2. **In the screenshots directory**: Additional screenshots may be stored in the `test-results/screenshots/` directory.

Screenshots show the state of the page at the moment of failure, which can help identify what went wrong.

### Videos

Video recordings are also automatically captured for failed tests. They can be found in:

1. **In the failed test directory**: Each failed test directory contains a video recording of the test execution.
2. **In the videos directory**: Additional videos may be stored in the `test-results/videos/` directory.

Videos provide a complete visual record of the test execution, showing all interactions leading up to the failure.

## Viewing Reports

After running tests, you can view the HTML report using the following command:

```bash
yarn playwright show-report tests/{app-name}-{test-base}-reports/playwright-report
```

For example:

```bash
yarn playwright show-report tests/pps-admin-reports/playwright-report
```

Alternatively, you can use the report script in the app-specific package.json:

```bash
cd tests/m2-hyva-playwright/src/apps/pps
TEST_BASE=admin yarn report
```

Since the HTML reports are stored in the `tests` directory, they can be committed and pushed to a test server for viewing. This allows team members to view the test results without having to run the tests themselves.

The HTML report provides a comprehensive view of all test results, including:

- Test status (passed, failed, skipped)
- Test duration
- Error messages for failed tests
- Links to screenshots, videos, and trace files
- Test steps and assertions

### Debugging Failed Tests

When a test fails, you can use the following resources to debug the issue:

1. **Error Message**: The error message in the HTML report provides information about what went wrong.
2. **Screenshot**: The screenshot shows the state of the page at the moment of failure.
3. **Video**: The video recording shows all interactions leading up to the failure.
4. **Trace File**: The trace file can be opened in Playwright Trace Viewer for detailed debugging.

To open a trace file:

```bash
npx playwright show-trace test-results/{app-name}-{test-base}/{test-name}/trace.zip
```

## Customizing Report Options

You can customize the report options in the app-specific Playwright configuration files. For example:

```typescript
// src/apps/pps/playwright.config.ts
const config = {
    reporter: [
        ["list"],
        [
            "json",
            {
                outputFile: "reports/json-reports/json-report.json",
            },
        ],
        [
            "html",
            {
                outputFolder: "reports/playwright-report/",
                open: "never",
            },
        ]
    ]
};
```

Available reporter options include:

- **list**: Simple console reporter
- **json**: JSON reporter for machine-readable output
- **html**: HTML reporter for human-readable output
- **junit**: JUnit reporter for CI integration

## Troubleshooting

If you're not seeing screenshots or videos for failed tests:

1. **Check Playwright Configuration**: Ensure that `screenshot: "only-on-failure"` and `video: "retain-on-failure"` are set in the Playwright configuration.
2. **Check preserveOutput Setting**: Ensure that `preserveOutput: 'failures-only'` is set in the Playwright configuration.
3. **Check Directory Permissions**: Ensure that the test-results directory and its subdirectories have the correct permissions.
4. **Check for Errors in Test Execution**: Look for any errors in the test execution output that might prevent screenshots or videos from being saved.

## Conclusion

The m2-hyva-playwright testing framework provides comprehensive test reporting capabilities, including screenshots, videos, and HTML reports. By understanding how these reports are organized and how to interpret them, you can effectively debug test failures and ensure the quality of your Magento 2 + Hyva implementation.
