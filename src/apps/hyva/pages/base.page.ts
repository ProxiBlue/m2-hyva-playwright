import type { Page, TestInfo } from "@playwright/test";
import { test, expect } from "@hyva/fixtures";
import * as actions from "@utils/base/web/actions";


export default class BasePage {
    constructor(public page: Page, public workerInfo: TestInfo, public data: any, public locators: any) {}

    async navigateTo() {
        await actions.navigateTo(this.page, process.env.URL + this.data.url, this.workerInfo);
        await this.page.waitForLoadState('domcontentloaded');
        const url = this.page.url();

        await test.step(
            this.workerInfo.project.name +
            ": verify Page Title " +
            this.data.header_title,
            async () => this.verifyPageTitle()
        );

        await test.step(
            this.workerInfo.project.name +
            ": verify DOM Title " +
            this.data.page_title_text,
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
        let match = this.data.page_title_text;
        expect(titleText.toString().toLowerCase()).toEqual(match.toString().toLowerCase());
    }

    async verifyDomTitle() {
        await this.page.waitForLoadState('domcontentloaded');
        await actions.verifyPageTitle(this.page, this.data.header_title, this.workerInfo);
    }
}
