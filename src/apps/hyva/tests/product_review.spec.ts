import { test, describe, expect } from "@hyva/fixtures";
import { loadLocators, loadJsonData } from "@utils/functions/file";
import { shouldSkipTest } from "@utils/functions/test-skip";

const pageLocators = loadLocators('locators/page.locator', 'hyva');

interface ReviewData {
    default: {
        review_submitted_message?: string;
    };
}

const defaultData: ReviewData = {
    default: {
        review_submitted_message: "You submitted your review for moderation.",
    }
};

let data = loadJsonData<ReviewData>('review.data.json', 'hyva', defaultData);
if (data && !data.default) {
    data = { default: data as any };
}

describe("Product review test suite", () => {

    test.setTimeout(90000);

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
    });

    test("Leave a product review", async ({ page }) => {
        // Check if review form exists
        const reviewForm = page.locator('#review-form, form[action*="review/product/post"]');
        if (!(await reviewForm.isVisible({ timeout: 5000 }).catch(() => false))) {
            // Scroll to reviews section to trigger lazy load
            const reviewSection = page.locator('#customer-review-list, #reviews, [id*="review"]');
            if (await reviewSection.count() > 0) {
                await reviewSection.first().scrollIntoViewIfNeeded();
                await page.waitForTimeout(1000);
            }
        }

        // Check for star rating radio buttons
        const starRating = page.getByRole('radio', { name: /star/ });
        if (!(await starRating.first().isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No review form available on this product page');
        }

        // Select 4-star rating by clicking the parent container (Alpine.js intercepts clicks)
        const fourStarContainer = page.getByRole('radio', { name: '4 stars' }).locator('..');
        await fourStarContainer.click();
        await page.waitForTimeout(300);

        // Verify the radio is checked
        const isChecked = await page.getByRole('radio', { name: '4 stars' }).isChecked();
        if (!isChecked) {
            // Fallback: force click the radio directly
            await page.getByRole('radio', { name: '4 stars' }).click({ force: true });
            await page.waitForTimeout(300);
        }

        // Fill review fields
        const timestamp = Date.now();
        await page.getByRole('textbox', { name: 'Nickname' }).fill('TestUser' + timestamp);
        await page.getByRole('textbox', { name: 'Summary' }).fill('Test Review ' + timestamp);
        await page.getByRole('textbox', { name: 'Review' }).fill('This is an automated test review for quality assurance purposes. Product quality is excellent.');

        // Submit review
        await page.getByRole('button', { name: 'Submit Review' }).click();

        // Wait for response (AJAX or page reload)
        await page.waitForTimeout(3000);

        // Verify success message - Hyva shows this inline within the review form, not as .message.success
        const successMessage = data.default.review_submitted_message || 'You submitted your review for moderation.';

        // Check for standard Magento message first, then inline message
        const standardMsg = page.locator(pageLocators.message_success);
        const inlineMsg = page.getByText(successMessage);

        await expect(
            standardMsg.or(inlineMsg),
            'Review submission success message should be visible'
        ).toBeVisible({ timeout: 15000 });
    });

    test("Change number of reviews shown", async ({ page }) => {
        // Check if review list with pagination exists
        const reviewList = page.locator('#customer-review-list, .review-list, [id*="review"]');
        if (await reviewList.count() > 0) {
            await reviewList.first().scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
        }

        const itemsPerPageSelect = page.getByRole('combobox', { name: 'Show items per page' });
        if (!(await itemsPerPageSelect.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip(true, 'No review pagination controls available');
        }

        // Change to show 20 items per page
        await itemsPerPageSelect.selectOption({ label: '20' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Verify the URL contains the limit parameter
        const currentUrl = page.url();
        expect(currentUrl).toContain('limit=20');
    });
});
