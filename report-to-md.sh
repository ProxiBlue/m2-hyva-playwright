#!/bin/bash
# Convert Playwright JSON report to markdown for GitHub tickets.
# Usage: ./report-to-md.sh [json-report-path]
# Default: test-results/pps/pps-pps-reports/json-reports/json-report.json

REPORT="${1:-test-results/pps/pps-pps-reports/json-reports/json-report.json}"

if [ ! -f "$REPORT" ]; then
    echo "Report not found: $REPORT"
    exit 1
fi

python3 -c "
import json, sys
from datetime import datetime

data = json.load(open('$REPORT'))

stats = {'passed': 0, 'failed': 0, 'skipped': 0, 'flaky': 0}
rows = []

def walk_suites(suites, path=''):
    for suite in suites:
        title = suite.get('title', '')
        current = f'{path} > {title}'.strip(' > ') if path else title
        for spec in suite.get('specs', []):
            for test in spec.get('tests', []):
                status = test['status']
                browser = test.get('projectName', '')
                name = f'{current} > {spec[\"title\"]}'
                if status == 'expected':
                    icon = ':white_check_mark:'
                    label = 'passed'
                    stats['passed'] += 1
                elif status == 'skipped':
                    icon = ':fast_forward:'
                    label = 'skipped'
                    stats['skipped'] += 1
                elif status == 'flaky':
                    icon = ':warning:'
                    label = 'flaky'
                    stats['flaky'] += 1
                else:
                    icon = ':x:'
                    label = 'failed'
                    stats['failed'] += 1
                rows.append((icon, label, browser, name, spec.get('file', '')))
        walk_suites(suite.get('suites', []), current)

walk_suites(data.get('suites', []))

total = sum(stats.values())
now = datetime.now().strftime('%Y-%m-%d %H:%M')

print(f'## Test Results ({now})')
print()
print(f'**{total} tests** | '
      f':white_check_mark: {stats[\"passed\"]} passed | '
      f':x: {stats[\"failed\"]} failed | '
      f':fast_forward: {stats[\"skipped\"]} skipped'
      + (f' | :warning: {stats[\"flaky\"]} flaky' if stats['flaky'] else ''))
print()
print('| Status | Browser | Test | File |')
print('|--------|---------|------|------|')

for icon, label, browser, name, file in sorted(rows, key=lambda r: (r[1] != 'failed', r[1] != 'flaky', r[3])):
    print(f'| {icon} {label} | {browser} | {name} | {file} |')
"
