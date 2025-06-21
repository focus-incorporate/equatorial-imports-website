const { test, expect } = require('@playwright/test');

test('Debug Checkout Issue', async ({ page }) => {
  console.log('🔍 Debugging checkout issue...');
  
  // Listen for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    console.log(`❌ Page Error: ${err.message}`);
    errors.push(err.message);
  });
  
  // Go to coffee page and add item
  await page.goto('http://localhost:3000/coffee');
  await page.waitForTimeout(2000);
  
  console.log('📝 Step 1: Adding item to cart...');
  const addButton = await page.$('button:has-text("Add")');
  await addButton.click();
  await page.waitForTimeout(1000);
  
  console.log('📝 Step 2: Opening cart...');
  const cartButton = await page.$('button[aria-label*="Shopping cart"]');
  await cartButton.click();
  await page.waitForTimeout(1000);
  
  // Take screenshot before checkout
  await page.screenshot({ path: 'test-results/before-checkout.png' });
  
  console.log('📝 Step 3: Clicking checkout button...');
  const checkoutButton = await page.$('button:has-text("Checkout")');
  
  if (checkoutButton) {
    try {
      await checkoutButton.click();
      await page.waitForTimeout(2000);
      
      // Check if checkout modal appeared
      const modal = await page.$('h2:has-text("Delivery Information")');
      const modalVisible = await modal?.isVisible();
      console.log('✅ Checkout modal visible:', modalVisible);
      
      // Take screenshot after checkout click
      await page.screenshot({ path: 'test-results/after-checkout-click.png' });
      
    } catch (error) {
      console.log(`❌ Error clicking checkout: ${error.message}`);
      await page.screenshot({ path: 'test-results/checkout-error.png' });
    }
  } else {
    console.log('❌ Checkout button not found');
  }
  
  // Report all errors
  console.log(`\n📊 Total errors found: ${errors.length}`);
  errors.forEach((error, i) => {
    console.log(`  ${i + 1}. ${error}`);
  });
  
  console.log('🔍 Checkout debug completed');
});