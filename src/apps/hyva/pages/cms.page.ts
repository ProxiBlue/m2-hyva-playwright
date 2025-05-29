import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "../locators/cms.locator";
import { CMSData } from "@hyva/interfaces/CMSData";
import { loadJsonData } from "@utils/functions/file";

// Default CMS data structure
const defaultData: CMSData = {
  default: {
    header_title: "",
    page_title_text: "",
    wrong_page_url: "",
    error_page_title: "",
    cms_titles: []
  }
};

// Load the CMS data using the utility function
let data = loadJsonData<CMSData>('cms.data.json', 'hyva', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
}

export default class CMSPage extends BasePage<CMSData> {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to the base page class
    }

    async navigateTo() {
        await test.step(
            this.workerInfo.project.name + ": Go to " + (process.env.url || ''),
            //@ts-ignore
            async () => await this.page.goto(process.env.url || '', { ignoreHTTPSErrors: true })
        );
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToWrongPage() {
        // @ts-ignore
        await test.step(
            this.workerInfo.project.name + ": Go to " + process.env.url + (this.data.default.wrong_page_url || '/404'),
            //@ts-ignore
            async () => await this.page.goto(process.env.url + (this.data.default.wrong_page_url || '/404'), { ignoreHTTPSErrors: true })
        );
        await this.page.waitForLoadState('domcontentloaded');
    }

    async checkErrorPage() {
        await this.page.waitForSelector(locators.pageTitle);
        const errorPageTitle = await this.page.locator(locators.pageTitle).textContent();
        expect(errorPageTitle).toContain(this.data.default.error_page_title);
    }

    async openDefaultCMSPages() {
        await this.navigateTo();
        const allLinks = await this.page.locator(locators.cmsDefaultPages).all();
        expect(allLinks.length).toBeGreaterThan(0);

        // Filter out links with target="_blank" or href starting with "tel:"
        const cmsLinks = [];
        for (const link of allLinks) {
            const target = await link.getAttribute('target');
            const href = await link.getAttribute('href');
            if (target !== '_blank' && href && !href.startsWith('tel') &&
                !href.startsWith('#') && !href.includes('__store')) {
                cmsLinks.push(link);
            }

        }

        if (cmsLinks.length > 0) {
            cmsLinks.pop();
        }

        expect(cmsLinks.length).toBeGreaterThan(0);
        for (let i = 0; i < cmsLinks.length; i++) {
            const link = cmsLinks[i];
            await link.click();
            await this.page.waitForLoadState('domcontentloaded');

            // Check if the page has breadcrumbs
            const hasBreadcrumbs = await this.page.locator(locators.breadcrumbs).count() > 0;

            if (hasBreadcrumbs) {
                // Check breadcrumbs text
                const breadcrumbText = await this.page.locator(locators.breadcrumbs).textContent();
                expect(breadcrumbText).toContain(this.data.default.cms_titles?.[i] || '');
            } else {
                // If no breadcrumbs, check h1 title instead
                const hasH1 = await this.page.locator(locators.title).count() > 0;
                expect(hasH1).toBeTruthy();
                const h1Text = await this.page.locator(locators.title).textContent();
                expect(h1Text).toContain(this.data.default.cms_titles?.[i] || '');
            }

            // Navigate back to the homepage for the next link
            await this.navigateTo();
        }
    }
}
