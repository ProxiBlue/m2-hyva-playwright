const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Go to homepage and search for a product
  await page.goto('https://pvcpipesupplies.ddev.site/');
  await page.waitForLoadState('networkidle');

  // Search for "valve"
  await page.fill('input[name="q"]', 'valve');
  await page.press('input[name="q"]', 'Enter');
  await page.waitForLoadState('networkidle');

  // Click on the first product
  const firstProduct = page.locator('.product-item').first();
  await firstProduct.locator('a').first().click();
  await page.waitForLoadState('networkidle');

  // Add to cart
  const addToCartButton = page.locator('button[type="submit"]:has-text("Add to Cart")');
  if (await addToCartButton.isVisible()) {
    await addToCartButton.click();
    await page.waitForTimeout(2000); // Wait for cart to update
  }

  // Navigate to cart page
  await page.goto('https://pvcpipesupplies.ddev.site/checkout/cart/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Extra wait for cart to fully load

  // Take screenshot
  await page.screenshot({
    path: 'cart-with-product-green-button.png',
    fullPage: true
  });

  console.log('Screenshot saved to cart-with-product-green-button.png');

  await browser.close();
})();
