/**
 * Helper function to determine if a test should be skipped based on the skipBaseTests configuration
 *
 * @param testInfo The test information object from Playwright
 * @returns boolean indicating whether the test should be skipped
 */
export function shouldSkipTest(testInfo: any): boolean {
    // Extract test title from testInfo
    const testTitle = testInfo.title;

    // Extract test suite name from testInfo
    const testSuiteName = testInfo.titlePath[1];

    // Parse the JSON string containing the tests to skip
    const skipBaseTests = JSON.parse(process.env.skipBaseTests || '{}');

    // Check if this test suite has tests to skip and if the current test is in that list
    return skipBaseTests[testSuiteName] && skipBaseTests[testSuiteName].includes(testTitle);
}
