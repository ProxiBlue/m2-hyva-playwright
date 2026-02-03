const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://pvcpipesupplies.ddev.site/checkout/cart/');
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({
    path: 'cart-styling-verification.png',
    fullPage: true
  });

  console.log('Screenshot saved to cart-styling-verification.png');

  await browser.close();
})();
