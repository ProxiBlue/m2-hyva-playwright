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
    workerInfo.project.name + ": Type text: " + text,
    async () => await page.type(locator, text)
  );

export const fill = async (
  page: Page,
  locator: string,
  text: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Enter text: " + text,
    async () => await page.fill(locator, text)
  );

export const getInnerText = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Get innertext from " + locator,
    async () => await page.innerText(locator)
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
    async () => await expect(page).toHaveTitle(title)
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
    async () => await page.locator(locator).click()
  );

export const clickFirstElement = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Click first element " + locator,
    async () => await page.locator(locator).first().click()
  );

export const clickLastElement = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Click last element " + locator,
    async () => await page.locator(locator).last().click()
  );

export const javascriptClick = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Click element " + locator,
    async () =>
      await page.$eval(locator, (element: HTMLElement) => element.click())
  );

export const boundingBoxClick = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) => {
  await test.step(
    workerInfo.project.name + ": Click element " + locator,
    async () => {
      const elementHandle = await page.$(locator);
      const box = await elementHandle.boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
  );
};

export const dragAndDrop = async (
  page: Page,
  dragElementLocator: string,
  dropElementLocator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name +
      ": Drag element from " +
      dragElementLocator +
      " to " +
      dropElementLocator,
    async () => await page.dragAndDrop(dragElementLocator, dropElementLocator)
  );

export const select = async (
  page: Page,
  locator: string,
  option: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Select element " + option + " in " + locator,
    async () => await page.locator(locator).type(option)
  );

export const getTextFromElements = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Get text from element(s) " + locator,
    async () =>
      await page.$eval(locator, (elements) =>
        Array.isArray(elements)
          ? elements.map((item) => item.textContent.trim())
          : elements.textContent.trim()
      )
  );

export const keyPress = async (
  page: Page,
  locator: string,
  key: string,
  workerInfo: TestInfo
) => {
  await test.step(
    workerInfo.project.name + ": Press " + key + " on " + locator,
    async () => await page.press(locator, key)
  );
};

export const getElementValue = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Get value from " + locator,
    async () =>
      await page.$eval(locator, (element: HTMLInputElement) => element.value)
  );

export const getElementAttributes = async (
  page: Page,
  locator: string,
  attribute: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name +
      ": Get " +
      attribute +
      " attribute from " +
      locator,
    async () => await page.getAttribute(locator, attribute)
  );

export const scrollToElement = async (
  page: Page,
  locator: string,
  workerInfo: TestInfo
) =>
  await test.step(
    workerInfo.project.name + ": Scroll to element " + locator,
    async () => await page.locator(locator).scrollIntoViewIfNeeded()
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
