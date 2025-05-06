import { test as baseTest } from "@common/fixtures";
import AdminPage from "@admin/pages/admin.page";
import AdminProductsPage from "@admin/pages/products.page";


type pages = {
    adminPage: AdminPage;
    adminProductsPage: AdminProductsPage;
};

const testPages = baseTest.extend<pages>({
    adminPage: async ({ page }, use, workerInfo) => {
        await use(new AdminPage(page, workerInfo));
    },
    adminProductsPage: async ({ page }, use, workerInfo) => {
        await use(new AdminProductsPage(page, workerInfo));
    },
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
