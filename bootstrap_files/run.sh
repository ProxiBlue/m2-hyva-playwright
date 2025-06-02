#!/bin/bash

set -xe

APP_NAME=pps  TEST_BASE=admin npx playwright test --workers=1 --retries=0
APP_NAME=pps  TEST_BASE=hyva npx playwright test
APP_NAME=pps  TEST_BASE=pps npx playwright test
