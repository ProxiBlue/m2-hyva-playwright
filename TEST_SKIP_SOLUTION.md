# Test Skip Solution for Layered Tests

## Problem

When running layered tests where one app extends another (e.g., a site-specific app extending the base Hyva tests), there's a need to skip certain base tests that aren't relevant to the extending app. The original implementation had a flaw where tests with identical names in different test suites would both be skipped when only one was intended to be skipped.

For example, if both `simple_product.spec.ts` and `configurable_product.spec.ts` had tests with identical names, and only the tests in `configurable_product.spec.ts` needed to be skipped, the original implementation would skip those tests in both files.

## Solution

The solution implemented provides a more robust way to skip tests by considering both the test suite name and the test title, rather than just the test title.

### Key Components

1. **Structured Configuration**
   - The `skipBaseTests` configuration in `config.json` uses a hierarchical structure
   - Tests to skip are organized by test suite name, preventing conflicts between identical test titles in different suites

2. **Helper Function**
   - A `shouldSkipTest` helper function in `src/utils/functions/test-skip.ts` handles the logic
   - The function automatically extracts the test suite name and test title from the Playwright `testInfo` object

3. **Consistent Implementation**
   - All test files use the same pattern for skipping tests
   - The beforeEach hook in each test file calls the helper function with the testInfo object

### Files Modified

1. `tests/m2-hyva-playwright/config.init.ts`
   - Updated to handle the structured skipBaseTests format
   - Added serialization of the skipBaseTests object to JSON

2. `tests/m2-hyva-playwright/src/utils/functions/test-skip.ts`
   - Created a helper function that determines if a test should be skipped
   - Parses the JSON structure and checks if the test should be skipped based on test suite and test title

3. `tests/m2-hyva-playwright/README.md`
   - Updated documentation to explain the format
   - Added examples of how to use the helper function

4. Test files in various app directories
   - Updated all test files to use the new helper function
   - Removed manual test suite name declarations in favor of automatic extraction

### Configuration Format

```json
{
  "skipBaseTests": {
    "Category test suite": [
      "Filters",
      "it can sort the products by name (a-z)"
    ],
    "Configurable products test suite": [
      "Can increment the product quantity on the pdp",
      "Can add configurable product to cart and verify options in cart"
    ]
  }
}
```

## How to Use

1. **Configure Tests to Skip**
   - In your app's `config.json`, add a `skipBaseTests` object
   - Organize tests to skip by test suite name
   - For each test suite, list the test titles to skip

2. **Implement in Test Files**
   - Import the helper function: `import { shouldSkipTest } from "@utils/functions/test-skip";`
   - Use it in the beforeEach hook:
   ```javascript
   test.beforeEach(async ({ page }, testInfo) => {
       const shouldSkip = shouldSkipTest(testInfo);
       test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
       // Rest of your beforeEach code
   });
   ```

## Benefits

1. **Precision**: Skip tests based on both test suite and test title, preventing unintended skips
2. **Maintainability**: Clearer configuration structure makes it easier to manage which tests to skip
3. **Simplicity**: Automatic extraction of test suite name eliminates the need for manual declaration

## Troubleshooting

If tests aren't being skipped as expected:

1. Verify the test suite name in your config matches the describe block's title exactly
2. Check that the test title in your config matches the test's title exactly
3. Ensure the `shouldSkipTest` function is being called correctly in the beforeEach hook
4. For debugging, you can add console logs in the test-skip.ts file to see what's being checked
