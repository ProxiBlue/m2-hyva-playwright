import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
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

    /**
     * Joins URL parts correctly, avoiding double slashes
     * @param base The base URL (e.g., "https://example.com/")
     * @param path The path to append (e.g., "admin")
     * @returns A properly joined URL (e.g., "https://example.com/admin")
     */
    private joinUrl(base: string, path: string): string {
        // Remove trailing slash from base if present
        const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
        // Remove leading slash from path if present
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        // Join with a single slash
        return `${cleanBase}/${cleanPath}`;
    }

    async navigateTo() {
        // Construct a proper URL without double slashes
        const adminUrl = this.joinUrl(process.env.url || '', process.env.admin_path || 'admin');

        await test.step(
            this.workerInfo.project.name + ": Go to " + adminUrl,
            async () => {
                // Navigate to the admin page
                await this.page.goto(adminUrl);
                await this.page.waitForLoadState('domcontentloaded');

                // Check if we're already logged in or need to log in
                try {
                    // Try to find the admin title with a short timeout
                    await this.page.waitForSelector(locators.title, { timeout: 3000 });
                    //console.log("Already logged in from storage state");
                } catch (e) {
                    // Not logged in, we might be on the login page
                    // Check if we're on the login page
                    if (await this.page.isVisible(locators.username)) {
                        //console.log("On login page, need to log in");
                        // We'll let the login method handle the actual login
                    } else {
                        console.error("Not logged in and not on login page. Current URL:", await this.page.url());
                    }
                }
            }
        );
    }

    async login() {
        await test.step(
            this.workerInfo.project.name + ": Login to admin ",
            async () => {
                // Check if we're already logged in by looking for the admin title
                try {
                    // Try to find the admin title with a short timeout
                    await this.page.waitForSelector(locators.title, { timeout: 3000 });
                    //console.log("Already logged in, skipping login process");

                    // Verify we're on the admin page
                    const pageTitleText = data.default.page_title_text || '';
                    expect(await this.page.locator(locators.title).textContent()).toContain(pageTitleText);

                    // Sometimes there is a dialog, just refresh and it will go away
                    await this.page.reload();
                    await this.page.waitForSelector(locators.title);
                    return;
                } catch (e) {
                    // Not logged in, proceed with login
                    //console.log("Not logged in, performing login");
                }

                // Perform login
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
