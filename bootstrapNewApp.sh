#!/bin/bash


mkdir src/apps/$1 &&
cd src/apps/$1 &&
mkdir data &&
mkdir fixtures &&
mkdir locators &&
mkdir pages &&
mkdir tests &&
touch config.json &&
touch package.json &&
touch playwright.config.ts &&
touch data/home.data.json &&
touch fixtures/index.ts &&


