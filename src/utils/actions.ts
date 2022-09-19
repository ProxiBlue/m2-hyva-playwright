import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";

export const pressEnter = async (page: Page, workerInfo: TestInfo) =>
  await test.step(
    workerInfo.project.name + ": Press enter",
    async () => await page.keyboard.press("Enter")
  );

export const pressEnterOnElement = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Press enter on " + locator,
    async () => await page.locator(locator).press("Enter")
  );

export const type = async (
  page: Page,
  locator: string,
  text: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Enter text: " + text,
    async () => await page.type(locator, text)
  );

export const getInnerText = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Get innertext from " + locator,
    async () => page.innerText(locator)
  );

export const navigateTo = async (
  page: Page,
  url: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Go to " + url,
    async () => await page.goto(url)
  );

export const verifyPageTitle = async (
  page: Page,
  title: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Verify page title is '" + title + "'",
    async () => expect(page).toHaveTitle(title)
  );

export const verifyElementExists = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Verify element exists " + locator,
    async () => await expect(page.locator(locator)).toHaveCount(1)
  );

export const verifyElementDoesNotExists = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Verify element does not exist " + locator,
    async () => await expect(page.locator(locator)).toHaveCount(0)
  );

export const verifyElementIsVisible = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Verify element is visible " + locator,
    async () => expect(await page.locator(locator).isVisible()).toBe(true)
  );

export const verifyElementIsEnabled = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Verify element is enabled " + locator,
    async () => expect(await page.locator(locator).isEnabled()).toBe(true)
  );

export const clickElement = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Click element " + locator,
    async () => {
      await page.locator(locator).click();
      // const button = await page.$(locator);
      // await button.evaluate((node: HTMLElement) => {
      //   node.click();
      // });
    }
  );

export const getElementCoordinates = async (page: Page, locator: string) =>
  await page.locator(locator).boundingBox();

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const waitForAnimationEnd = (page: Page, selector: string) =>
  page
    .locator(selector)
    .evaluate((element) =>
      Promise.all(
        element.getAnimations().map((animation) => animation.finished)
      )
    );

export const elementHasClass = async (
  page: Page,
  locator: string,
  className: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Check if element has class " + className,
    async () =>
      Object.values(await page.$eval(locator, (el) => el.classList)).indexOf(
        className
      ) > -1
        ? true
        : false
  );
