import { test, expect } from '@playwright/test';

test.describe('Coffee Page Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coffee');
    // Wait for page to load and 3D animations to render
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for 3D components to load
  });

  test('should load coffee page with main content', async ({ page }) => {
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Coffee Collection');
    
    // Check hero description
    await expect(page.locator('text=Discover our premium coffee imports')).toBeVisible();
    
    // Take screenshot of hero section
    await page.screenshot({ 
      path: 'test-results/coffee-page-hero.png',
      clip: { x: 0, y: 0, width: 1280, height: 600 }
    });
  });

  test('should display 3D falling beans animation', async ({ page }) => {
    // Check if canvas element for 3D animation exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Verify the FallingBeans component is present
    const fallingBeansContainer = page.locator('div').filter({ has: canvas });
    await expect(fallingBeansContainer).toBeVisible();
    
    // Take screenshot showing 3D animation
    await page.screenshot({ 
      path: 'test-results/coffee-page-3d-animation.png',
      fullPage: false
    });
  });

  test('should display Daniel\'s Blend section with products', async ({ page }) => {
    // Scroll to Daniel's Blend section
    await page.locator('text=Daniel\'s Blend').first().scrollIntoViewIfNeeded();
    
    // Check section heading
    await expect(page.locator('h2').filter({ hasText: 'Daniel\'s Blend' })).toBeVisible();
    
    // Check 5-star rating
    const stars = page.locator('.text-amber-400.fill-current');
    await expect(stars).toHaveCount(10); // 5 stars for Daniel's + 5 for Viaggio
    
    // Check product features
    await expect(page.locator('text=100% Aluminum Pods')).toBeVisible();
    await expect(page.locator('text=No Preservatives')).toBeVisible();
    await expect(page.locator('text=Recyclable')).toBeVisible();
    await expect(page.locator('text=Nespresso Compatible')).toBeVisible();
    
    // Check that product cards are visible
    const danielsProductCards = page.locator('[data-testid="product-card"]').or(page.locator('.coffee-shadow').first());
    await expect(danielsProductCards.first()).toBeVisible();
    
    // Take screenshot of Daniel's Blend section
    await page.screenshot({ 
      path: 'test-results/coffee-page-daniels-blend.png',
      clip: { x: 0, y: await page.locator('h2').filter({ hasText: 'Daniel\'s Blend' }).boundingBox().then(box => box?.y || 0) - 50, width: 1280, height: 800 }
    });
  });

  test('should display Viaggio Espresso section with products', async ({ page }) => {
    // Scroll to Viaggio Espresso section
    await page.locator('text=Viaggio Espresso').first().scrollIntoViewIfNeeded();
    
    // Check section heading
    await expect(page.locator('h2').filter({ hasText: 'Viaggio Espresso' })).toBeVisible();
    
    // Check product features
    await expect(page.locator('text=Sustainably Sourced')).toBeVisible();
    await expect(page.locator('text=Premium Origin')).toBeVisible();
    await expect(page.locator('text=Multi-System Compatible')).toBeVisible();
    await expect(page.locator('text=All Brewing Methods')).toBeVisible();
    
    // Check that product cards are visible
    const viaggioProductCards = page.locator('[data-testid="product-card"]').or(page.locator('.coffee-shadow'));
    await expect(viaggioProductCards.first()).toBeVisible();
    
    // Take screenshot of Viaggio Espresso section
    await page.screenshot({ 
      path: 'test-results/coffee-page-viaggio-espresso.png',
      clip: { x: 0, y: await page.locator('h2').filter({ hasText: 'Viaggio Espresso' }).boundingBox().then(box => box?.y || 0) - 50, width: 1280, height: 800 }
    });
  });

  test('should have functional filter system', async ({ page }) => {
    // Test intensity filter
    const intensityFilter = page.locator('select').first();
    await expect(intensityFilter).toBeVisible();
    
    // Test different intensity options
    await intensityFilter.selectOption('8-10');
    await page.waitForTimeout(1000); // Wait for filtering
    
    // Verify filtering works (check if products are still visible - basic test)
    const productCards = page.locator('[data-testid="product-card"]').or(page.locator('.coffee-shadow'));
    await expect(productCards.first()).toBeVisible();
    
    // Test roast level filter
    const roastFilter = page.locator('select').last();
    await expect(roastFilter).toBeVisible();
    
    await roastFilter.selectOption('dark');
    await page.waitForTimeout(1000);
    
    // Reset filters
    await intensityFilter.selectOption('all');
    await roastFilter.selectOption('all');
    
    // Take screenshot of filter section
    await page.screenshot({ 
      path: 'test-results/coffee-page-filters.png',
      clip: { x: 0, y: await page.locator('text=Filter Products').boundingBox().then(box => box?.y || 0) - 50, width: 1280, height: 300 }
    });
  });

  test('should display product cards with correct information', async ({ page }) => {
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Find first product card
    const firstProductCard = page.locator('.coffee-shadow').first();
    await expect(firstProductCard).toBeVisible();
    
    // Check if product card contains expected elements
    // Note: Without specific data-testid attributes, we'll check for common elements
    const productImage = firstProductCard.locator('img').first();
    await expect(productImage).toBeVisible();
    
    // Look for price elements (assuming they contain $)
    const priceElements = page.locator('text=/\\$\\d+\\.\\d+/');
    await expect(priceElements.first()).toBeVisible();
    
    // Look for intensity indicators
    const intensityElements = page.locator('text=/Intensity|intensity/i');
    await expect(intensityElements.first()).toBeVisible();
    
    // Take screenshot of product cards
    await page.screenshot({ 
      path: 'test-results/coffee-page-product-cards.png',
      clip: { x: 0, y: await firstProductCard.boundingBox().then(box => box?.y || 0), width: 1280, height: 400 }
    });
  });

  test('should have add to cart functionality', async ({ page }) => {
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Look for "Add to Cart" buttons
    const addToCartButton = page.locator('button').filter({ hasText: /Add to Cart|Add/ }).first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      
      // Check if cart icon shows updated count or if there's feedback
      const cartIcon = page.locator('[data-testid="cart-icon"]').or(page.locator('svg').filter({ hasText: /cart/i }));
      await expect(cartIcon).toBeVisible();
      
      // Take screenshot after adding to cart
      await page.screenshot({ 
        path: 'test-results/coffee-page-add-to-cart.png',
        fullPage: false
      });
    }
  });

  test('should display call-to-action section', async ({ page }) => {
    // Scroll to CTA section
    await page.locator('text=Ready to Order?').scrollIntoViewIfNeeded();
    
    // Check CTA heading
    await expect(page.locator('text=Ready to Order?')).toBeVisible();
    
    // Check CTA description
    await expect(page.locator('text=All products available for cash-on-delivery')).toBeVisible();
    
    // Check CTA buttons
    await expect(page.locator('text=Contact for Orders')).toBeVisible();
    await expect(page.locator('text=Bulk Pricing')).toBeVisible();
    
    // Take screenshot of CTA section
    await page.screenshot({ 
      path: 'test-results/coffee-page-cta-section.png',
      clip: { x: 0, y: await page.locator('text=Ready to Order?').boundingBox().then(box => box?.y || 0) - 50, width: 1280, height: 400 }
    });
  });

  test('should have proper responsive design elements', async ({ page }) => {
    // Check if main containers have responsive classes
    const mainContainer = page.locator('.max-w-7xl').first();
    await expect(mainContainer).toBeVisible();
    
    // Check grid layouts
    const gridContainer = page.locator('.grid').first();
    await expect(gridContainer).toBeVisible();
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-results/coffee-page-full.png',
      fullPage: true
    });
  });

  test('should handle filter combinations correctly', async ({ page }) => {
    // Test combining intensity and roast filters
    const intensityFilter = page.locator('select').first();
    const roastFilter = page.locator('select').last();
    
    // Apply both filters
    await intensityFilter.selectOption('5-7');
    await roastFilter.selectOption('medium');
    await page.waitForTimeout(1000);
    
    // Verify some products are still shown (basic check)
    const productCards = page.locator('.coffee-shadow');
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Take screenshot with filters applied
    await page.screenshot({ 
      path: 'test-results/coffee-page-filtered-results.png',
      fullPage: true
    });
  });
});