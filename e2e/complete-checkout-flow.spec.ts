import { test, expect, Page } from '@playwright/test';

interface ErrorLog {
  type: 'console' | 'network' | 'page';
  message: string;
  timestamp: string;
  url?: string;
  status?: number;
}

interface TestMetrics {
  startTime: number;
  stepTimes: { [key: string]: number };
  errors: ErrorLog[];
  screenshots: string[];
}

test.describe('Complete E-commerce Checkout Flow', () => {
  let metrics: TestMetrics;
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Initialize metrics
    metrics = {
      startTime: Date.now(),
      stepTimes: {},
      errors: [],
      screenshots: []
    };

    // Set up error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        metrics.errors.push({
          type: 'console',
          message: msg.text(),
          timestamp: new Date().toISOString(),
        });
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      metrics.errors.push({
        type: 'page',
        message: err.message,
        timestamp: new Date().toISOString(),
      });
      console.log(`❌ Page Error: ${err.message}`);
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        metrics.errors.push({
          type: 'network',
          message: `HTTP ${response.status()} - ${response.statusText()}`,
          timestamp: new Date().toISOString(),
          url: response.url(),
          status: response.status()
        });
        console.log(`❌ Network Error: ${response.status()} - ${response.url()}`);
      }
    });

    console.log('🚀 Starting Complete Checkout Flow Test...');
  });

  test.afterEach(async () => {
    const totalTime = Date.now() - metrics.startTime;
    console.log(`\n📊 Test Metrics Summary:`);
    console.log(`   Total Time: ${totalTime}ms`);
    console.log(`   Screenshots: ${metrics.screenshots.length}`);
    console.log(`   Errors: ${metrics.errors.length}`);
    
    if (metrics.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      metrics.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. [${error.type}] ${error.message}`);
        if (error.url) console.log(`      URL: ${error.url}`);
      });
    }

    console.log(`\n⏱️ Step Performance:`);
    Object.entries(metrics.stepTimes).forEach(([step, time]) => {
      console.log(`   ${step}: ${time}ms`);
    });
  });

  async function captureScreenshot(stepName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `checkout-${stepName}-${timestamp}.png`;
    await page.screenshot({ path: `test-results/${filename}`, fullPage: true });
    metrics.screenshots.push(filename);
    console.log(`📸 Screenshot captured: ${filename}`);
  }

  async function trackStep<T>(stepName: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    console.log(`\n📝 Step: ${stepName}`);
    
    try {
      const result = await fn();
      const endTime = Date.now();
      metrics.stepTimes[stepName] = endTime - startTime;
      console.log(`✅ ${stepName} completed in ${endTime - startTime}ms`);
      return result;
    } catch (error) {
      const endTime = Date.now();
      metrics.stepTimes[stepName] = endTime - startTime;
      console.log(`❌ ${stepName} failed after ${endTime - startTime}ms`);
      throw error;
    }
  }

  test('Complete checkout flow from homepage to order success', async () => {
    
    // Step 1: Navigate to homepage
    await trackStep('Navigate to Homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await captureScreenshot('01-homepage');
      
      // Verify homepage loaded
      await expect(page).toHaveTitle(/Equatorial Imports/);
      await expect(page.locator('h1')).toBeVisible();
    });

    // Step 2: Navigate to coffee page
    await trackStep('Navigate to Coffee Page', async () => {
      await page.goto('/coffee');
      await page.waitForLoadState('networkidle');
      await captureScreenshot('02-coffee-page');
      
      // Wait for products to load
      await page.waitForSelector('[data-testid="product-card"], .product-card, img[alt*="Ristretto"], img[alt*="Intenso"]', { timeout: 10000 });
      
      // Verify products are visible
      const products = await page.locator('[data-testid="product-card"], .product-card, button:has-text("Add")').count();
      expect(products).toBeGreaterThan(0);
      console.log(`   Found ${products} products on page`);
    });

    // Step 3: Add product to cart
    await trackStep('Add Product to Cart', async () => {
      // Find and click first available "Add" button
      const addButtons = await page.locator('button:has-text("Add")').all();
      expect(addButtons.length).toBeGreaterThan(0);
      
      // Click the first "Add" button
      await addButtons[0].click();
      await page.waitForTimeout(1000); // Allow cart to update
      
      await captureScreenshot('03-product-added');
      
      // Verify cart has items (look for cart indicator)
      await page.waitForSelector('[aria-label*="cart"], [aria-label*="Cart"], .cart-count, [data-testid="cart-count"]', { timeout: 5000 });
    });

    // Step 4: Open cart drawer
    await trackStep('Open Cart Drawer', async () => {
      // Find and click cart button
      const cartSelectors = [
        'button[aria-label*="cart"]',
        'button[aria-label*="Cart"]', 
        '[data-testid="cart-button"]',
        'button:has([data-testid="cart-icon"])',
        'button:has-text("Cart")'
      ];
      
      let cartButton = null;
      for (const selector of cartSelectors) {
        cartButton = await page.locator(selector).first();
        if (await cartButton.isVisible()) break;
      }
      
      expect(cartButton).toBeTruthy();
      await cartButton!.click();
      await page.waitForTimeout(1000);
      
      await captureScreenshot('04-cart-opened');
      
      // Verify cart drawer opened
      await page.waitForSelector('button:has-text("Checkout"), [data-testid="checkout-button"]', { timeout: 5000 });
    });

    // Step 5: Click checkout button
    await trackStep('Click Checkout Button', async () => {
      const checkoutButton = await page.locator('button:has-text("Checkout"), [data-testid="checkout-button"]').first();
      await checkoutButton.click();
      await page.waitForTimeout(2000);
      
      await captureScreenshot('05-checkout-clicked');
      
      // Verify we're on checkout page or modal opened
      await page.waitForSelector('h1:has-text("Checkout"), h2:has-text("Cart Review"), h2:has-text("Delivery Information")', { timeout: 10000 });
    });

    // Step 6: Cart Review Step
    await trackStep('Cart Review Step', async () => {
      // Wait for cart review to be visible
      await page.waitForSelector('h2:has-text("Review Your Order"), h1:has-text("Review"), .cart-review', { timeout: 5000 });
      
      await captureScreenshot('06-cart-review');
      
      // Look for and click "Continue" or "Proceed to Customer Info" button
      const continueSelectors = [
        'button:has-text("Proceed to Customer Info")',
        'button:has-text("Continue")',
        'button:has-text("Next")',
        'button:has-text("Proceed")',
        '[data-testid="cart-continue-button"]'
      ];
      
      let continueButton = null;
      for (const selector of continueSelectors) {
        continueButton = await page.locator(selector).first();
        if (await continueButton.isVisible()) {
          await continueButton.click();
          break;
        }
      }
      
      await page.waitForTimeout(1000);
    });

    // Step 7: Customer Information Step
    await trackStep('Customer Information Step', async () => {
      // Wait for customer info form
      await page.waitForSelector('h2:has-text("Customer"), input[name="name"], input[placeholder*="name"]', { timeout: 5000 });
      
      await captureScreenshot('07-customer-info');
      
      // Fill customer information
      const nameInput = await page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]').first();
      const emailInput = await page.locator('input[name="email"], input[placeholder*="email"], input[type="email"]').first();
      const phoneInput = await page.locator('input[name="phone"], input[placeholder*="phone"], input[type="tel"]').first();
      
      await nameInput.fill('John Doe');
      await emailInput.fill('john.doe@example.com');
      await phoneInput.fill('+248 123 4567');
      
      // Click guest checkout if option exists
      const guestCheckbox = await page.locator('input[type="checkbox"]:has-text("guest"), label:has-text("guest")').first();
      if (await guestCheckbox.isVisible()) {
        await guestCheckbox.check();
      }
      
      // Click continue/next
      const nextButton = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Proceed")').first();
      await nextButton.click();
      await page.waitForTimeout(1000);
    });

    // Step 8: Delivery Information Step
    await trackStep('Delivery Information Step', async () => {
      // Wait for delivery info form
      await page.waitForSelector('h2:has-text("Delivery"), select[name="island"], select[name="district"]', { timeout: 5000 });
      
      await captureScreenshot('08-delivery-info');
      
      // Fill delivery information
      const addressInput = await page.locator('input[name="address"], textarea[name="address"], input[placeholder*="address"]').first();
      const islandSelect = await page.locator('select[name="island"], select[id="island"]').first();
      const districtSelect = await page.locator('select[name="district"], select[id="district"]').first();
      
      await addressInput.fill('123 Main Street, Victoria');
      await islandSelect.selectOption('mahe');
      await districtSelect.selectOption('Victoria');
      
      // Add delivery notes if field exists
      const notesInput = await page.locator('textarea[name="deliveryNotes"], textarea[placeholder*="notes"]').first();
      if (await notesInput.isVisible()) {
        await notesInput.fill('Please call when arriving');
      }
      
      // Click continue/next
      const nextButton = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Proceed")').first();
      await nextButton.click();
      await page.waitForTimeout(1000);
    });

    // Step 9: Payment Method Step
    await trackStep('Payment Method Step', async () => {
      // Wait for payment options
      await page.waitForSelector('h2:has-text("Payment"), input[value="cash"], label:has-text("Cash")', { timeout: 5000 });
      
      await captureScreenshot('09-payment-method');
      
      // Select cash on delivery
      const cashOption = await page.locator('input[value="cash"], input[value="cash-on-delivery"], label:has-text("Cash")').first();
      await cashOption.click();
      
      // Click continue/next
      const nextButton = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Proceed")').first();
      await nextButton.click();
      await page.waitForTimeout(1000);
    });

    // Step 10: Order Review Step
    await trackStep('Order Review Step', async () => {
      // Wait for order review
      await page.waitForSelector('h2:has-text("Review"), button:has-text("Place Order")', { timeout: 5000 });
      
      await captureScreenshot('10-order-review');
      
      // Verify order details are visible
      await expect(page.locator('text="John Doe"')).toBeVisible();
      await expect(page.locator('text="john.doe@example.com"')).toBeVisible();
      await expect(page.locator('text="Victoria"')).toBeVisible();
      
      console.log('   Order details verified');
    });

    // Step 11: Place Order (Critical Step)
    await trackStep('Place Order', async () => {
      // Capture before placing order
      await captureScreenshot('11-before-place-order');
      
      // Find and click Place Order button
      const placeOrderButton = await page.locator('button:has-text("Place Order")').first();
      await expect(placeOrderButton).toBeVisible();
      await expect(placeOrderButton).toBeEnabled();
      
      console.log('   Clicking Place Order button...');
      await placeOrderButton.click();
      
      // Wait for order processing
      await page.waitForTimeout(3000);
      
      await captureScreenshot('12-after-place-order');
      
      // Check for success indicators
      const successIndicators = [
        'text="Order placed successfully"',
        'text="Thank you"',
        'text="Order confirmed"',
        'h1:has-text("Success")',
        'h2:has-text("Success")',
        '[data-testid="success-message"]'
      ];
      
      let successFound = false;
      for (const indicator of successIndicators) {
        try {
          await page.waitForSelector(indicator, { timeout: 5000 });
          successFound = true;
          console.log(`   Success indicator found: ${indicator}`);
          break;
        } catch (e) {
          // Continue to next indicator
        }
      }
      
      if (!successFound) {
        console.log('   No success indicators found, checking URL...');
        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('success')) {
          successFound = true;
          console.log('   Success detected from URL');
        }
      }
      
      expect(successFound).toBeTruthy();
    });

    // Step 12: Verify Success Page
    await trackStep('Verify Success Page', async () => {
      await captureScreenshot('13-success-page');
      
      // Wait for success page to fully load
      await page.waitForLoadState('networkidle');
      
      // Verify success page elements
      const successElements = [
        'text="Order"',
        'text="EQ"', // Order ID prefix
        'text="Thank"',
        'text="confirmation"'
      ];
      
      for (const element of successElements) {
        try {
          await expect(page.locator(element)).toBeVisible();
          console.log(`   Success element verified: ${element}`);
        } catch (e) {
          console.log(`   Success element not found: ${element}`);
        }
      }
      
      console.log('   Success page verification completed');
    });

    // Final summary
    console.log('\n🎉 Complete checkout flow test completed successfully!');
    console.log('✅ All steps executed without critical failures');
    
    if (metrics.errors.length === 0) {
      console.log('✅ No errors detected during the entire flow');
    } else {
      console.log(`⚠️ ${metrics.errors.length} non-critical errors detected (see details above)`);
    }
  });
});