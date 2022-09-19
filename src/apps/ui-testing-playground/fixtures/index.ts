import { test as baseTest } from "@playwright/test";
import CommonPage from "../pages/common.page";
import HomePage from "../pages/home.page";
import DynamicIdPage from "../pages/dynamic-id.page";
import ClassAttributePage from "../pages/class-attribute.page";
import HiddenLayersPage from "../pages/hidden-layers.page";
import LoadDelaysPage from "../pages/load-delays.page";
import AjaxDataPage from "../pages/ajax-data.page";
import ClickPage from "../pages/click.page";
import TextInputPage from "../pages/text-input.page";
import ScrollBarsPage from "../pages/scrollbars.page";

type pages = {
  commonPage: CommonPage;
  homePage: HomePage;
  dynamicIdPage: DynamicIdPage;
  classAttributePage: ClassAttributePage;
  hiddenLayersPage: HiddenLayersPage;
  loadDelaysPage: LoadDelaysPage;
  ajaxDataPage: AjaxDataPage;
  clickPage: ClickPage;
  textInputPage: TextInputPage;
  scrollBarsPage: ScrollBarsPage;
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
  ajaxDataPage: async ({ page }, use, workerInfo) => {
    await use(new AjaxDataPage(page, workerInfo));
  },
  clickPage: async ({ page }, use, workerInfo) => {
    await use(new ClickPage(page, workerInfo));
  },
  textInputPage: async ({ page }, use, workerInfo) => {
    await use(new TextInputPage(page, workerInfo));
  },
  scrollBarsPage: async ({ page }, use, workerInfo) => {
    await use(new ScrollBarsPage(page, workerInfo));
  },
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
