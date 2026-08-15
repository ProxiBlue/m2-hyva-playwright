#!/usr/bin/env node
// Preflight gate: fail fast with a clear fix-hint before burning a full
// test:all run on a missing browser binary. Origin: pvcpipesupplies #427
// mageos 3.4 upgrade session — 253 apparent test failures, ~2h triage,
// root cause was a missing webkit binary. Proposal: chat 9b22140b.
//
// Deliberately does not parse playwright.config.ts to discover browser
// projects dynamically — the pps app config is loaded through a symlink
// into a sibling repo (pps-local migration) where TS/ESM module resolution
// gets ambiguous. A short env-overridable list is far more robust.
//
// Exported as a module (not just a CLI script) so global-setup.ts can call
// it directly from Playwright's own globalSetup hook. That's the only choke
// point every invocation path passes through — the framework root's
// `env-check` yarn prefix is bypassed entirely by consumer apps that ship
// their own nested package.json (e.g. pps) and run `yarn test:xxx` from
// inside it. See #432 gap report, coord thread 0eb2e33f.

const fs = require('fs');
const playwright = require('playwright');

function checkBrowsers({ appName, browserNames } = {}) {
  appName = appName || process.env.APP_NAME || 'hyva';
  const names = (browserNames || process.env.PLAYWRIGHT_BROWSERS || 'chromium,webkit')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const missing = [];
  for (const name of names) {
    const browserType = playwright[name];
    if (!browserType) {
      console.warn(`env-check: unknown browser type "${name}", skipping`);
      continue;
    }
    const execPath = browserType.executablePath();
    if (!execPath || !fs.existsSync(execPath)) {
      missing.push(name);
    }
  }

  return { appName, browserNames: names, missing };
}

function checkBrowsersOrExit(opts) {
  const { appName, browserNames, missing } = checkBrowsers(opts);

  if (missing.length > 0) {
    console.error('');
    console.error(`env-check FAILED: browser binaries missing for APP_NAME=${appName}: ${missing.join(', ')}`);
    console.error(`Fix: npx playwright install ${missing.join(' ')}`);
    console.error('');
    process.exit(1);
  }

  console.log(`env-check: browser binaries OK for APP_NAME=${appName} (${browserNames.join(', ')})`);
}

module.exports = { checkBrowsers, checkBrowsersOrExit };

if (require.main === module) {
  checkBrowsersOrExit();
}
