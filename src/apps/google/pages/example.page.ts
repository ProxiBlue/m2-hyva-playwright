import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import * as fs from "fs";

import * as locator from "../locators/example.locator";
import * as data from "../../../../data/apps/google/example";
import * as actions from "../../../utils/actions";
import { matchScreenshot, takeScreenshot } from "../../../utils/screenshots";

export const navigateToGoogle = async (page: Page) => {
  await actions.navigateTo(page, data.url);
  const url = await page.url();

  fs.existsSync(data.homePagePath)
    ? matchScreenshot(page, data.homePagePath)
    : takeScreenshot(page, data.homePagePath, true);

  expect(url).toContain(data.urlContains);
};

export const searchForPlaywright = async (page: Page) => {
  await page.goto(data.url);
  await actions.type(page, locator.searchInput, data.searchText);
  await actions.pressEnter(page);

  const text = await actions.getInnerText(page, locator.searchResult);

  expect(text).toContain(data.searchResultContains);
};
