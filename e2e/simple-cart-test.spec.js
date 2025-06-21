const { test, expect } = require('@playwright/test');

test('Simple Cart Test', async ({ page }) => {
  console.log('🧪 Simple cart test...');
  
  // Listen for console logs
  page.on('console', msg => {
    console.log(`Browser: ${msg.type()}: ${msg.text()}`);
  });
  
  // Go to coffee page
  await page.goto('http://localhost:3000/coffee');
  await page.waitForTimeout(3000);
  
  // Try to add item
  console.log('Adding item to cart...');
  const addButton = await page.$('button:has-text("Add")');
  if (addButton) {
    await addButton.click();
    await page.waitForTimeout(2000);
    
    // Check cart button
    const cartButton = await page.$('button[aria-label*="Shopping cart"]');
    console.log('Cart button found:', cartButton !== null);
    
    if (cartButton) {
      const ariaLabel = await cartButton.getAttribute('aria-label');
      console.log('Cart aria-label:', ariaLabel);
      
      // Try clicking cart
      await cartButton.click();
      await page.waitForTimeout(1000);
      
      // Check for cart drawer
      const drawer = await page.$('.fixed.right-0.top-0.h-full');
      console.log('Cart drawer found:', drawer !== null);
    }
  }
  
  await page.screenshot({ path: 'test-results/simple-test.png' });
});