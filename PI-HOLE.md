# PI-HOLE Integration

## Issue
When PI-HOLE is utilized on the network as a global DNS blocking service, Firefox tests may fail in Playwright. This is because Pi-hole blocks certain domains that Firefox needs to access during testing.

## Solution
To address this issue, we've implemented an automatic Pi-hole management system that:
1. Temporarily disables Pi-hole before running tests
2. Re-enables Pi-hole after tests are completed

## Configuration
To use this feature, add the following to your app's `config.private.json` file:

```json
{
  "pi-hole-api": "YOUR_PI_HOLE_API_KEY",
  "pi-hole-service": "YOUR_PI_HOLE_IP_ADDRESS"
}
```

Example:
```json
{
  "admin_path": "admin",
  "url": "",
  "pi-hole-api": "",
  "pi-hole-service": ""
}
```

## How It Works
1. During test initialization, the system checks if Pi-hole configuration is available in the app's `config.private.json`
2. If configuration is found, Pi-hole is automatically disabled for 20 minutes (1200 seconds) before tests run
3. After all tests are completed, Pi-hole is automatically re-enabled

## Implementation Details
- The Pi-hole API key and service address are read from `config.private.json` and set as environment variables
- The `disablePiHole()` function in `global-setup.ts` disables Pi-hole before tests run
- The `enablePiHole()` function in `global-teardown.ts` re-enables Pi-hole after tests complete
- The disable duration is set to 1200 seconds (20 minutes) to ensure enough time for tests to complete

## Notes
- The Pi-hole API expects the disable duration in seconds, not in minutes or with time unit suffixes
- This solution works with all test runners (npm, yarn, npx playwright)
- If Pi-hole configuration is not found, the system will skip Pi-hole management and proceed with tests normally
