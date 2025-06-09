import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@admin/locators/admin.locator";
import { AdminData } from "@admin/interfaces/AdminData";
import { loadJsonData } from "@utils/functions/file";
import { execSync } from "child_process";
import path from "path";
import crypto from "crypto";

// Default admin data structure
const defaultData: AdminData = {"default": {}};

// Load the admin data using the utility function
let data = loadJsonData<AdminData>('admin.data.json', 'admin', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
}
export default class AdminPage extends BasePage {
    private tempAdminUser: string | null = null;
    private tempAdminPassword: string | null = null;

    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    /**
     * Generates a strong random password
     * @param length Length of the password (default: 16)
     * @returns A random password with mixed case, numbers, and special characters
     */
    private generateStrongPassword(length: number = 16): string {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
        let password = '';

        // Ensure we have at least one of each character type
        password += 'A'; // uppercase
        password += 'a'; // lowercase
        password += '1'; // number
        password += '!'; // special

        // Fill the rest with random characters
        for (let i = password.length; i < length; i++) {
            const randomIndex = crypto.randomInt(0, charset.length);
            password += charset[randomIndex];
        }

        // Shuffle the password to randomize the positions of the required characters
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    /**
     * Creates a temporary admin user for testing
     * @returns Object containing the username and password of the created user
     */
    private async createTempAdminUser(): Promise<{ username: string, password: string }> {
        // Generate a unique username based on timestamp and random string
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(4).toString('hex');
        const username = `temp_admin_${timestamp}_${randomString}`;

        // Generate a strong password
        const password = this.generateStrongPassword();

        try {
            // Create the admin user directly using Magento CLI

            // Create a single admin user with the generated credentials
            const command = `cd /var/www/html && php bin/magento admin:user:create --admin-user="${username}" --admin-password="${password}" --admin-email="${username}@example.com" --admin-firstname="Temp" --admin-lastname="Admin"`;

            // Execute the command
            execSync(command, { stdio: 'inherit' });

            // Store the credentials for later use
            this.tempAdminUser = username;
            this.tempAdminPassword = password;

            await test.step(this.workerInfo.project.name + `: Created temporary admin user: ${username}`, async () => {});
            return { username, password };
        } catch (error) {
            await test.step(this.workerInfo.project.name + ': Failed to create temporary admin user: ' + error, async () => {});
            throw error;
        }
    }

    /**
     * Removes a specific admin user
     * @param username Username of the admin user to remove
     */
    private async removeTempAdminUser(username: string): Promise<void> {
        try {
            // Use direct MySQL command to remove the specific user
            const command = `cd /var/www/html && mysql -e "DELETE FROM admin_user WHERE username = '${username}';"`;

            // Execute the command
            execSync(command, { stdio: 'inherit' });

            await test.step(this.workerInfo.project.name + `: Removed temporary admin user: ${username}`, async () => {});
        } catch (error) {
            await test.step(this.workerInfo.project.name + `: Failed to remove temporary admin user ${username}: ` + error, async () => {});
            // Don't throw the error, as this is cleanup code
        }
    }

    /**
     * Removes all temporary admin users created for testing
     */
    async removeAllTempAdminUsers(): Promise<void> {
        try {
            // Use direct MySQL command to remove all temporary admin users
            const command = `cd /var/www/html && mysql -e "DELETE FROM admin_user WHERE username LIKE 'temp_admin_%';"`;

            // Execute the command
            execSync(command, { stdio: 'inherit' });

            await test.step(this.workerInfo.project.name + ': Removed all temporary admin users', async () => {});
        } catch (error) {
            await test.step(this.workerInfo.project.name + ': Failed to remove temporary admin users: ' + error, async () => {});
            // Don't throw the error, as this is cleanup code
        }
    }

    /**
     * Cleans up any straggling temporary admin users from previous test runs
     */
    async cleanupStragglingAdminUsers(): Promise<void> {
        await this.removeAllTempAdminUsers();
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
                        await test.step(this.workerInfo.project.name + ": Not logged in and not on login page. Current URL: " + await this.page.url(), async () => {});
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
                    await test.step(this.workerInfo.project.name + ": Already logged in, skipping login process", async () => {});

                    // Verify we're on the admin page
                    const pageTitleText = data.default.page_title_text || '';
                    expect(await this.page.locator(locators.title).textContent()).toContain(pageTitleText);

                    // Sometimes there is a dialog, just refresh and it will go away
                    await this.page.reload();
                    await this.page.waitForSelector(locators.title);
                    return;
                } catch (e) {
                    await test.step(this.workerInfo.project.name + ": Not logged in, performing login with temporary admin user", async () => {});
                }


                // Create a temporary admin user for this test
                const { username, password } = await this.createTempAdminUser();

                // Perform login with the temporary admin user
                await this.page.fill(locators.username, username);
                await this.page.fill(locators.password, password);
                await this.page.getByRole('button', {name: 'Sign in'}).click();

                // Wait for login to complete
                await this.page.waitForSelector(locators.title);

                // Verify we're on the admin page
                const pageTitleText = data.default.page_title_text || '';
                expect(await this.page.locator(locators.title).textContent()).toContain(pageTitleText);

                // Sometimes there is a dialog, just refresh and it will go away
                await this.page.reload();
                await this.page.waitForSelector(locators.title);

                // Register a teardown function to remove the temporary admin user when the page is closed
                this.page.on('close', async () => {
                    if (this.tempAdminUser) {
                        try {
                            await this.removeTempAdminUser(this.tempAdminUser);
                            this.tempAdminUser = null;
                            this.tempAdminPassword = null;
                        } catch (error) {
                            await test.step(this.workerInfo.project.name + ': Error removing temporary admin user: ' + error, async () => {});
                        }
                    }
                });
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
