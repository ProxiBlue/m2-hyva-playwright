#!/bin/bash

mkdir -p src/apps/$1 &&
cd src/apps/$1 &&
git init &&
git branch -m main &&
mkdir data &&
mkdir fixtures &&
mkdir locators &&
mkdir pages &&
mkdir -p ./reports/allure/allure-result &&
touch ./reports/allure/allure-result/.gitkeep &&
git add -f ./reports/allure/allure-result/.gitkeep &&
mkdir tests &&
printf "reports\ntest-results" > .gitignore &&
cp ../../../bootstrap_files/config.json ./ &&
cp ../hyva/playwright.config.ts ./ &&
cp ../../../bootstrap_files/package.json ./ &&
cp ../../../bootstrap_files/fixtures_index.ts ./fixtures/index.ts &&
sed -i "s/APP_NAME/$1/g" package.json





