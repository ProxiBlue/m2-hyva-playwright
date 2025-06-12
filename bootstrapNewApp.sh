#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Please supply the app name to be created."
  exit 1
fi

# Define the path to check
APP="src/apps/$1"

# Check if the directory exists
if [ -d "$APP" ]; then
  echo "Error: The app '$APP' already exists."
  exit 1
fi

mkdir -p $APP &&
cd $APP &&
git init &&
mkdir data &&
mkdir fixtures &&
mkdir locators &&
mkdir pages &&
mkdir tests &&
mkdir interfaces &&
printf "reports\ntest-results\nconfig.private.json" > .gitignore &&
cp ../../../bootstrap_files/config.json ./ &&
cp ../../../bootstrap_files/config.private.json ./ &&
cp ../hyva/playwright.config.ts ./ &&
cp ../../../bootstrap_files/package.json ./ &&
cp ../../../bootstrap_files/fixtures_index.ts ./fixtures/index.ts &&
sed -i "s/NEW_APP_NAME/$1/g" package.json
