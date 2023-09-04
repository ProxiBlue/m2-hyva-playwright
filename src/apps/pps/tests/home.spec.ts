import { test, describe } from "../fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/home.locator";
import {expect} from "@playwright/test";

describe("Home", () => {

    test('Can perform search from homepage', async ({homePage, isMobile }) => {
        await homePage.navigateTo();
        await homePage.canSearchFromHomepage(isMobile);
    });
});
