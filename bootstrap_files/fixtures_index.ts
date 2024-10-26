import { test as testBase } from "@common/fixtures";

type pages = {

};

const testPages = testBase.extend<pages>({

});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
