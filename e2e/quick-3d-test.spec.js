const { test, expect } = require('@playwright/test');

test('Quick 3D and Cart Test', async ({ page }) => {
  console.log('🧪 Quick 3D and Cart Test...');
  
  // Go to coffee page
  await page.goto('http://localhost:3001/coffee');
  
  // Wait a reasonable amount of time
  await page.waitForTimeout(3000);
  
  // Check for canvas (3D)
  const canvas = await page.$('canvas');
  console.log('🎨 Canvas found:', canvas !== null);
  
  // Check for products
  const products = await page.$$('button:has-text("Add")');
  console.log('🛒 Products found:', products.length);
  
  if (products.length > 0) {
    // Test adding to cart
    await products[0].click();
    await page.waitForTimeout(1000);
    
    // Check if cart button shows count
    const cartButton = await page.$('button[aria-label*="Shopping cart"]');
    if (cartButton) {
      const cartText = await cartButton.textContent();
      console.log('🛒 Cart button text:', cartText);
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/quick-test.png', fullPage: true });
  
  console.log('✅ Quick test completed');
});