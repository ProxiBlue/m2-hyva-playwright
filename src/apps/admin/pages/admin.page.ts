import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as locators from "@admin/locators/admin.locator";
import { AdminData } from "@admin/interfaces/AdminData";
import { loadJsonData } from "@utils/functions/file";

// Default admin data structure
const defaultData: AdminData = {"default": {}};

// Load the admin data using the utility function
let data = loadJsonData<AdminData>('admin.data.json', 'admin', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
}
export default class AdminPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    async navigateTo() {
        // @ts-ignore
        await actions.navigateTo(this.page, process.env.URL + process.env.admin_path, this.workerInfo);
    }

    async login() {
        await test.step(
            this.workerInfo.project.name + ": Login to admin ",
            async () => {
                // @ts-ignore
                await this.page.fill(locators.username, process.env.admin_user);
                // @ts-ignore
                await this.page.fill(locators.password, process.env.admin_password);
                await this.page.getByRole('button', {name: 'Sign in'}).click()
                await this.page.waitForSelector(locators.title)
                const pageTitleText = data.default.page_title_text || '';
                expect(await this.page.locator(locators.title).textContent()).toContain(pageTitleText);
                // and sometmes there is a dialog, just refresh and it will go away
                await this.page.reload();
                await this.page.waitForSelector(locators.title)
            });
    }

    async logout() {
        await test.step(
            this.workerInfo.project.name + ": Logout of admin panel ",
            async () => {
                await this.page.locator(".admin__action-dropdown-wrap").first().click();
                await this.page.locator(locators.logout_option).click({force: true});
                await this.page.waitForSelector(locators.username)
            });
    }

}
