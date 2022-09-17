import { test as baseTest } from "@playwright/test";
import HomePage from "../pages/home.page";
import DynamicIdPage from "../pages/dynamic-id.page";
import ClassAttributePage from "../pages/class-attribute.page";
import HiddenLayersPage from "../pages/hidden-layers.page";

type pages = {
  homePage: HomePage;
  dynamicIdPage: DynamicIdPage;
  classAttributePage: ClassAttributePage;
  hiddenLayersPage: HiddenLayersPage;
};

const testPages = baseTest.extend<pages>({
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
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
