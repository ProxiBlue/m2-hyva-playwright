import { Page, TestInfo, test, expect } from "@playwright/test";
import * as actions from "@utils/base/web/actions";

export default class BasePage {
    constructor(public page: Page, public workerInfo: TestInfo, public data: any, public locators: any) {}

    async navigateTo() {
        await actions.navigateTo(this.page, process.env.URL + this.data.default.url, this.workerInfo);
        await this.page.waitForLoadState('domcontentloaded');
        const url = this.page.url();

        await test.step(
            this.workerInfo.project.name +
            ": verify Page Title " +
            this.data.default.header_title,
            async () => this.verifyPageTitle()
        );

        await test.step(
            this.workerInfo.project.name +
            ": verify DOM Title " +
            this.data.default.page_title_text,
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
        let match = this.data.default.page_title_text;
        expect(titleText.toString().toLowerCase()).toEqual(match.toString().toLowerCase());
    }

    async verifyDomTitle() {
        await this.page.waitForLoadState('domcontentloaded');
        await actions.verifyPageTitle(this.page, this.data.default.header_title, this.workerInfo);
    }

    get pageData() {
        return this.data;
    }
}
