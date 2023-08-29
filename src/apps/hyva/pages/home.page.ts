import type { Page, TestInfo } from "@playwright/test";
import { test, expect } from "../fixtures";
import * as data from "../data/home.data.json";
import * as actions from "@utils/base/web/actions";
import * as locators from "../locators/home.locator";

export default class HomePage {
    constructor(public page: Page, public workerInfo: TestInfo) {}

    async navigateTo() {
        await actions.navigateTo(this.page, process.env.URL, this.workerInfo);
        const url = this.page.url();

        await test.step(
            this.workerInfo.project.name +
            ": Check if URL contains " +
            data.urlContains,
            async () => expect(url).toContain(data.urlContains)
        );
    }

    async verifyPageTitle() {
        const titleText = await actions.getInnerText(
            this.page,
            locators.title,
            this.workerInfo
        );
        await expect(titleText).toEqual(data["page_title_text"]);
    }

    async verifyDomTitle() {
        await actions.verifyPageTitle(this.page, data["header_title"], this.workerInfo);
    }

    async verifyHasProducts() {
        await actions.verifyPageTitle(this.page, data["header_title"], this.workerInfo);
    }

}
