#!/bin/bash

set -xe

yarn workspace admin test
yarn workspace checkout test
yarn workspace pps test


