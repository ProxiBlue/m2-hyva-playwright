import { Page, TestInfo, test, expect } from "@playwright/test";

export default class BasePage<T extends { default: { url?: string; header_title?: string; page_title_text?: string } } = any> {
    constructor(public page: Page, public workerInfo: TestInfo, public data: any, public locators: any) {}

    async navigateTo(urlOverride:boolean|string = false) {
        const url = urlOverride || this.data.default.url || '';
        const headerTitle = this.data.default.header_title || '';
        const pageTitleText = this.data.default.page_title_text || '';

        await test.step(
            this.workerInfo.project.name + ": Go to " + process.env.url + url,
            async () => await this.page.goto(process.env.url + url, { ignoreHTTPSErrors: true })
        );
        await this.page.waitForLoadState('domcontentloaded');
        const pageUrl = this.page.url();

        await test.step(
            this.workerInfo.project.name +
            ": verify Page Title " +
            headerTitle,
            async () => this.verifyPageTitle()
        );

        await test.step(
            this.workerInfo.project.name +
            ": verify DOM Title " +
            pageTitleText,
            async () => this.verifyDomTitle()
        );
    }

    async verifyPageTitle() {
        await this.page.waitForLoadState('domcontentloaded');
        const titleText = await test.step(
            this.workerInfo.project.name + ": Get innertext from " + this.locators.title,
            async () => await this.page.innerText(this.locators.title)
        );
        let match = this.data.default.page_title_text || '';
        expect(titleText.toString().toLowerCase()).toEqual(match.toString().toLowerCase());
    }

    async verifyDomTitle() {
        await this.page.waitForLoadState('domcontentloaded');
        const headerTitle = this.data.default.header_title || '';
        await test.step(
            this.workerInfo.project.name + ": Verify page title is '" + headerTitle + "'",
            async () => await expect(this.page).toHaveTitle(headerTitle)
        );
    }

    get pageData() {
        return this.data;
    }
}
