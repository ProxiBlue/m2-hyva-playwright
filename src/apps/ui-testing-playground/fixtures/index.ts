import { test as baseTest } from "@playwright/test";
import HomePage from "../pages/home.page";
import DynamicIdPage from "../pages/dynamic-id.page";
import ClassAttributePage from "../pages/class-attribute.page";
import HiddenLayersPage from "../pages/hidden-layers.page";
import LoadDelaysPage from "../pages/load-delays.page";
import CommonPage from "../pages/common.page";

type pages = {
  commonPage: CommonPage;
  homePage: HomePage;
  dynamicIdPage: DynamicIdPage;
  classAttributePage: ClassAttributePage;
  hiddenLayersPage: HiddenLayersPage;
  loadDelaysPage: LoadDelaysPage;
};

const testPages = baseTest.extend<pages>({
  commonPage: async ({ page }, use, workerInfo) => {
    await use(new CommonPage(page, workerInfo));
  },
  homePage: async ({ page }, use, workerInfo) => {
    await use(new HomePage(page, workerInfo));
  },
  dynamicIdPage: async ({ page }, use, workerInfo) => {
    await use(new DynamicIdPage(page, workerInfo));
  },
  classAttributePage: async ({ page }, use, workerInfo) => {
    await use(new ClassAttributePage(page, workerInfo));
  },
  hiddenLayersPage: async ({ page }, use, workerInfo) => {
    await use(new HiddenLayersPage(page, workerInfo));
  },
  loadDelaysPage: async ({ page }, use, workerInfo) => {
    await use(new LoadDelaysPage(page, workerInfo));
  },
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
