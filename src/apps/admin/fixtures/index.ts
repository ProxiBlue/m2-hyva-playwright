import { test as baseTest } from "@common/fixtures";
import AdminPage from "@admin/pages/admin.page";

type pages = {
    adminPage: AdminPage;
};

const testPages = baseTest.extend<pages>({
    adminPage: async ({ page }, use, workerInfo) => {
        await use(new AdminPage(page, workerInfo));
    },
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
