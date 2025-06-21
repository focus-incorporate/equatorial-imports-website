const { test, expect } = require('@playwright/test');

test('Test Cart Slide Animation', async ({ page }) => {
  console.log('🎬 Testing cart slide animation...');
  
  // Go to coffee page
  await page.goto('http://localhost:3000/coffee');
  await page.waitForTimeout(2000);
  
  // Add item to cart
  console.log('Adding item to cart...');
  const addButton = await page.$('button:has-text("Add")');
  await addButton.click();
  await page.waitForTimeout(1000);
  
  // Take screenshot before opening cart
  await page.screenshot({ path: 'test-results/before-cart-open.png' });
  
  // Click cart button
  console.log('Opening cart drawer...');
  const cartButton = await page.$('button[aria-label*="Shopping cart"]');
  await cartButton.click();
  
  // Wait for animation
  await page.waitForTimeout(500);
  
  // Take screenshot after opening cart
  await page.screenshot({ path: 'test-results/after-cart-open.png' });
  
  // Check if drawer is visible and properly positioned
  const drawer = await page.$('.absolute.right-0.top-0.h-full');
  const drawerVisible = await drawer.isVisible();
  console.log('✅ Cart drawer visible:', drawerVisible);
  
  // Check if backdrop is visible
  const backdrop = await page.$('.absolute.inset-0.bg-black.bg-opacity-50');
  const backdropVisible = await backdrop.isVisible();
  console.log('✅ Backdrop visible:', backdropVisible);
  
  // Test closing by clicking backdrop
  console.log('Testing close by clicking backdrop...');
  await backdrop.click();
  await page.waitForTimeout(500);
  
  // Take screenshot after closing
  await page.screenshot({ path: 'test-results/after-cart-close.png' });
  
  console.log('🎬 Cart slide animation test completed');
});