import { test as baseTest } from "@playwright/test";
import HomePage from "../pages/home.page";
import DynamicIdPage from "../pages/dynamic-id.page";
import ClassAttributePage from "../pages/class-attribute.page";

type pages = {
  homePage: HomePage;
  dynamicIdPage: DynamicIdPage;
  classAttributePage: ClassAttributePage;
};

const testPages = baseTest.extend<pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  dynamicIdPage: async ({ page }, use) => {
    await use(new DynamicIdPage(page));
  },
  classAttributePage: async ({ page }, use) => {
    await use(new ClassAttributePage(page));
  },
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
