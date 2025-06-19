import { test, expect } from '@playwright/test';

test.describe('Homepage Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with main hero section', async ({ page }) => {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check main heading text
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toContainText("Chasing the World's");
    await expect(mainHeading).toContainText("Finest Flavors");
    await expect(mainHeading).toContainText("to Seychelles");
    
    // Take screenshot of hero section
    await page.screenshot({ 
      path: 'test-results/homepage-hero-section.png',
      fullPage: false
    });
  });

  test('should display Equatorial Imports logo', async ({ page }) => {
    // Check logo is visible
    const logo = page.locator('img[alt="Equatorial Imports"]');
    await expect(logo).toBeVisible();
    
    // Verify logo src
    await expect(logo).toHaveAttribute('src', /equatorial-imports-logo\.png/);
  });

  test('should have functional navigation menu', async ({ page }) => {
    // Check navigation links
    const homeLink = page.locator('nav').locator('text=Home');
    const coffeeLink = page.locator('nav').locator('text=Coffee');
    const aboutLink = page.locator('nav').locator('text=About');
    const contactLink = page.locator('nav').locator('text=Contact');
    
    await expect(homeLink).toBeVisible();
    await expect(coffeeLink).toBeVisible();
    await expect(aboutLink).toBeVisible();
    await expect(contactLink).toBeVisible();
  });

  test('should navigate to coffee page via "Explore Our Coffee" button', async ({ page }) => {
    // Find and click the "Explore Our Coffee" button
    const exploreButton = page.locator('text=Explore Our Coffee').first();
    await expect(exploreButton).toBeVisible();
    
    await exploreButton.click();
    
    // Verify navigation to coffee page
    await expect(page).toHaveURL('/coffee');
  });

  test('should navigate to about page via "Our Story" button', async ({ page }) => {
    // Find and click the "Our Story" button
    const storyButton = page.locator('text=Our Story').first();
    await expect(storyButton).toBeVisible();
    
    await storyButton.click();
    
    // Verify navigation to about page
    await expect(page).toHaveURL('/about');
  });

  test('should display features section with quality assurance, global sourcing, and local trust', async ({ page }) => {
    // Scroll to features section
    await page.locator('text=Why Choose Equatorial Imports?').scrollIntoViewIfNeeded();
    
    // Check main features heading
    await expect(page.locator('text=Why Choose Equatorial Imports?')).toBeVisible();
    
    // Check Premium Quality feature
    const qualityFeature = page.locator('text=Premium Quality');
    await expect(qualityFeature).toBeVisible();
    await expect(page.locator('text=We source only the finest products')).toBeVisible();
    
    // Check Global Sourcing feature
    const globalFeature = page.locator('text=Global Sourcing');
    await expect(globalFeature).toBeVisible();
    await expect(page.locator('text=From Italian espresso to exotic flavors')).toBeVisible();
    
    // Check Seychelles Trusted feature
    const localFeature = page.locator('text=Seychelles Trusted');
    await expect(localFeature).toBeVisible();
    await expect(page.locator('text=Based in Seychelles, we understand local tastes')).toBeVisible();
    
    // Take screenshot of features section
    await page.screenshot({ 
      path: 'test-results/homepage-features-section.png',
      clip: { x: 0, y: await page.locator('text=Why Choose Equatorial Imports?').boundingBox().then(box => box?.y || 0), width: 1280, height: 600 }
    });
  });

  test('should display coffee preview section', async ({ page }) => {
    // Scroll to coffee preview section
    await page.locator('text=Our Coffee Collection').scrollIntoViewIfNeeded();
    
    // Check section heading
    await expect(page.locator('text=Our Coffee Collection')).toBeVisible();
    
    // Check Daniel's Blend preview
    const danielsBlend = page.locator('text=Daniel\'s Blend');
    await expect(danielsBlend).toBeVisible();
    await expect(page.locator('text=Premium Nespresso-compatible capsules')).toBeVisible();
    await expect(page.locator('text=5 Unique Blends • Intensities 5-12 • From $9.99')).toBeVisible();
    
    // Check Viaggio Espresso preview
    const viaggioEspresso = page.locator('text=Viaggio Espresso');
    await expect(viaggioEspresso).toBeVisible();
    await expect(page.locator('text=Premium coffee beans and capsules')).toBeVisible();
    await expect(page.locator('text=5 Premium Options • Beans & Capsules • From $11.99')).toBeVisible();
    
    // Check "Discover All Coffees" button
    const discoverButton = page.locator('text=Discover All Coffees');
    await expect(discoverButton).toBeVisible();
    
    // Take screenshot of coffee preview section
    await page.screenshot({ 
      path: 'test-results/homepage-coffee-preview.png',
      clip: { x: 0, y: await page.locator('text=Our Coffee Collection').boundingBox().then(box => box?.y || 0), width: 1280, height: 600 }
    });
  });

  test('should navigate to coffee page via "Discover All Coffees" button', async ({ page }) => {
    // Scroll to and click the "Discover All Coffees" button
    await page.locator('text=Discover All Coffees').scrollIntoViewIfNeeded();
    await page.locator('text=Discover All Coffees').click();
    
    // Verify navigation to coffee page
    await expect(page).toHaveURL('/coffee');
  });

  test('should have scroll indicator animation', async ({ page }) => {
    // Check for scroll indicator
    const scrollIndicator = page.locator('.animate-bounce');
    await expect(scrollIndicator).toBeVisible();
  });

  test('should have correct page title and meta description', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Equatorial Imports - Premium Coffee & Beverages/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Discover premium coffee imports in Seychelles/);
  });

  test('should take full page screenshot', async ({ page }) => {
    // Wait for all content to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Additional wait for animations
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-results/homepage-full-page.png',
      fullPage: true
    });
  });
});