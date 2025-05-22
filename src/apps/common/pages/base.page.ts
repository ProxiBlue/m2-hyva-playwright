import { Page, TestInfo, test, expect } from "@playwright/test";
import * as actions from "@utils/base/web/actions";

export default class BasePage<T extends { default: { url?: string; header_title?: string; page_title_text?: string } } = any> {
    constructor(public page: Page, public workerInfo: TestInfo, public data: T, public locators: any) {}

    async navigateTo() {
        const url = this.data.default.url || '';
        const headerTitle = this.data.default.header_title || '';
        const pageTitleText = this.data.default.page_title_text || '';

        await actions.navigateTo(this.page, process.env.URL + url, this.workerInfo);
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
        const titleText = await actions.getInnerText(
            this.page,
            this.locators.title,
            this.workerInfo
        );
        let match = this.data.default.page_title_text || '';
        expect(titleText.toString().toLowerCase()).toEqual(match.toString().toLowerCase());
    }

    async verifyDomTitle() {
        await this.page.waitForLoadState('domcontentloaded');
        const headerTitle = this.data.default.header_title || '';
        await actions.verifyPageTitle(this.page, headerTitle, this.workerInfo);
    }

    get pageData() {
        return this.data;
    }
}
