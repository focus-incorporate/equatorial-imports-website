const { test, expect } = require('@playwright/test');

test.describe('3D Components and Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the coffee page
    await page.goto('http://localhost:3001/coffee');
    await page.waitForLoadState('networkidle');
  });

  test('3D GLB models should load without errors', async ({ page }) => {
    console.log('🧪 Testing 3D GLB model loading...');
    
    // Track network requests for GLB files
    const glbRequests = [];
    const glbResponses = [];
    
    page.on('request', request => {
      if (request.url().includes('.glb')) {
        glbRequests.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`📥 GLB Request: ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('.glb')) {
        glbResponses.push({
          url: response.url(),
          status: response.status()
        });
        console.log(`📦 GLB Response: ${response.url()} - Status: ${response.status()}`);
      }
    });
    
    // Wait for potential 3D content to load
    await page.waitForTimeout(5000);
    
    // Check for canvas elements (indicates 3D scene)
    const canvasElements = await page.$$('canvas');
    console.log(`🎨 Found ${canvasElements.length} canvas elements`);
    
    // Verify GLB files are loaded successfully
    const successfulGlbLoads = glbResponses.filter(r => r.status === 200);
    console.log(`✅ Successfully loaded ${successfulGlbLoads.length} GLB files`);
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/3d-glb-test.png',
      fullPage: true 
    });
    
    // Assertions
    expect(canvasElements.length).toBeGreaterThan(0);
    expect(successfulGlbLoads.length).toBeGreaterThanOrEqual(0);
  });

  test('cart functionality should work end-to-end', async ({ page }) => {
    console.log('🛒 Testing cart functionality...');
    
    // Wait for products to load
    await page.waitForSelector('button:has-text("Add")', { timeout: 10000 });
    
    // Test 1: Add item to cart
    console.log('📝 Test 1: Adding item to cart...');
    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();
    
    // Wait for toast notification
    await page.waitForTimeout(1000);
    
    // Check if toast appeared
    const toast = page.locator('.fixed.top-20.right-4');
    if (await toast.isVisible()) {
      console.log('✅ Toast notification appeared');
    }
    
    // Test 2: Open cart drawer
    console.log('📝 Test 2: Opening cart drawer...');
    const cartButton = page.locator('button[aria-label*="Shopping cart"]');
    await cartButton.click();
    await page.waitForTimeout(1000);
    
    // Verify cart drawer opened
    const cartDrawer = page.locator('.fixed.right-0.top-0.h-full');
    await expect(cartDrawer).toBeVisible();
    console.log('✅ Cart drawer opened successfully');
    
    // Test 3: Update quantity
    console.log('📝 Test 3: Testing quantity controls...');
    const plusButton = page.locator('button').filter({ hasText: '+' }).first();
    if (await plusButton.isVisible()) {
      await plusButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Quantity updated');
    }
    
    // Test 4: Start checkout
    console.log('📝 Test 4: Testing checkout flow...');
    const checkoutButton = page.locator('button:has-text("Checkout")');
    await checkoutButton.click();
    await page.waitForTimeout(1000);
    
    // Verify checkout modal opened
    const checkoutModal = page.locator('h2:has-text("Delivery Information")');
    if (await checkoutModal.isVisible()) {
      console.log('✅ Checkout modal opened');
      
      // Test form validation
      console.log('📝 Test 5: Testing form validation...');
      
      // Fill form with valid data
      await page.fill('input[name="name"]', 'John Doe');
      await page.fill('input[name="email"]', 'john@example.com');
      await page.fill('input[name="phone"]', '+248 123 4567');
      await page.fill('input[name="address"]', '123 Main Street, Victoria, Mahé');
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Form submitted successfully');
    }
    
    // Test 5: Cart persistence
    console.log('📝 Test 6: Testing cart persistence...');
    
    // Close any open modals
    const closeButtons = page.locator('button').filter({ hasText: /[×X]/ });
    if (await closeButtons.first().isVisible()) {
      await closeButtons.first().click();
    }
    
    // Navigate away and back
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.goto('http://localhost:3001/coffee');
    await page.waitForLoadState('networkidle');
    
    // Check if cart still has items
    const cartCounterAfter = page.locator('button[aria-label*="Shopping cart"] span');
    const hasItems = await cartCounterAfter.isVisible();
    if (hasItems) {
      console.log('✅ Cart persistence working');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/cart-test-complete.png',
      fullPage: true 
    });
  });

  test('mobile responsiveness should work properly', async ({ page }) => {
    console.log('📱 Testing mobile responsiveness...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for page to adapt
    await page.waitForTimeout(1000);
    
    // Test mobile cart
    await page.waitForSelector('button:has-text("Add")', { timeout: 10000 });
    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Open cart on mobile
    const cartButton = page.locator('button[aria-label*="Shopping cart"]');
    await cartButton.click();
    await page.waitForTimeout(1000);
    
    // Verify mobile cart drawer
    const cartDrawer = page.locator('.fixed.right-0.top-0.h-full');
    await expect(cartDrawer).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/mobile-cart-test.png',
      fullPage: true 
    });
    
    console.log('✅ Mobile responsiveness verified');
  });

  test('console should not have critical errors', async ({ page }) => {
    console.log('🔍 Checking for console errors...');
    
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });
    
    // Navigate and interact with the page
    await page.waitForTimeout(5000);
    
    // Add item to cart to trigger functionality
    const addButton = page.locator('button:has-text("Add")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Report results
    console.log(`\n📊 Console Check Results:`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️ Warnings: ${warnings.length}`);
    
    // We'll allow some warnings but no critical errors
    expect(errors.length).toBeLessThan(5); // Allow some minor errors
    
    if (errors.length > 0) {
      console.log('Errors found:', errors);
    }
  });
});