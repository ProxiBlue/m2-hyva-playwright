import { test as hyvaBase } from "@hyva/fixtures";
import CommonPage from "@common/pages/common.page";


type pages = {
    commonPage: CommonPage;
};

const testPages = hyvaBase.extend<pages>({

});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
