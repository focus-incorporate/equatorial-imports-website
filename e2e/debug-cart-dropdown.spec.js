const { test, expect } = require('@playwright/test');

test('Debug Cart Dropdown Issue', async ({ page }) => {
  console.log('🔍 Debugging cart dropdown issue...');
  
  // Listen for console logs to catch our debug message
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    console.log(`Browser Console: ${msg.type()}: ${msg.text()}`);
  });
  
  // Go to home page first
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Navigate to coffee page to add items
  console.log('📝 Step 1: Navigate to coffee page...');
  await page.goto('http://localhost:3000/coffee');
  await page.waitForLoadState('networkidle');
  
  // Wait for products to load
  await page.waitForSelector('button:has-text("Add")', { timeout: 10000 });
  console.log('✅ Products loaded');
  
  // Add an item to cart
  console.log('📝 Step 2: Add item to cart...');
  const addButton = page.locator('button:has-text("Add")').first();
  await addButton.click();
  
  // Wait for toast or cart update
  await page.waitForTimeout(2000);
  
  // Check if cart counter appears
  const cartButton = page.locator('button[aria-label*="Shopping cart"]');
  const cartExists = await cartButton.isVisible();
  console.log('✅ Cart button visible:', cartExists);
  
  if (cartExists) {
    const cartText = await cartButton.textContent();
    console.log('🛒 Cart button text:', cartText);
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'test-results/before-cart-click.png' });
    
    // Test clicking the cart button
    console.log('📝 Step 3: Click cart button...');
    await cartButton.click();
    
    // Wait for potential drawer to appear
    await page.waitForTimeout(1000);
    
    // Check if cart drawer appeared
    const cartDrawer = page.locator('.fixed.right-0.top-0.h-full');
    const drawerVisible = await cartDrawer.isVisible();
    console.log('🚪 Cart drawer visible:', drawerVisible);
    
    // Check for backdrop
    const backdrop = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
    const backdropVisible = await backdrop.isVisible();
    console.log('🌫️ Backdrop visible:', backdropVisible);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'test-results/after-cart-click.png' });
    
    // Check all elements with z-index issues
    const allFixed = await page.locator('.fixed').all();
    console.log(`🔍 Found ${allFixed.length} fixed position elements`);
    
    for (let i = 0; i < allFixed.length; i++) {
      const element = allFixed[i];
      const className = await element.getAttribute('class');
      const isVisible = await element.isVisible();
      console.log(`  ${i + 1}. Fixed element visible: ${isVisible}, classes: ${className}`);
    }
    
    // Check if cart items are in the DOM but hidden
    const cartItems = page.locator('[class*="cart"]');
    const itemCount = await cartItems.count();
    console.log(`🛒 Cart-related elements in DOM: ${itemCount}`);
    
    // Check computed styles of cart drawer
    if (await cartDrawer.count() > 0) {
      const styles = await cartDrawer.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          zIndex: computed.zIndex,
          transform: computed.transform,
          position: computed.position
        };
      });
      console.log('🎨 Cart drawer computed styles:', styles);
    }
    
  } else {
    console.log('❌ Cart button not found - cart may not be working');
  }
  
  // Log all console messages
  console.log('\n📋 Browser Console Messages:');
  consoleLogs.forEach(log => console.log(`  ${log}`));
  
  // Final screenshot
  await page.screenshot({ path: 'test-results/final-debug.png', fullPage: true });
  
  console.log('🔍 Debug test completed');
});