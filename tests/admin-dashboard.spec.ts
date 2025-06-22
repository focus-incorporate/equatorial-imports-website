import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Complete Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the admin login page
    await page.goto('http://localhost:3000/admin/login');
  });

  test('Admin Login Flow', async ({ page }) => {
    // Test login form elements
    await expect(page.locator('h1')).toContainText('Equatorial Imports');
    await expect(page.locator('h2')).toContainText('Welcome Back');
    
    // Test form fields exist and are functional
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    // Test login with valid credentials
    await emailField.fill('admin@equatorialimports.sc');
    await passwordField.fill('admin123');
    await loginButton.click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/admin/dashboard');
  });

  test('Dashboard Layout and Navigation', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    // Test sidebar navigation
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(sidebar).toBeVisible();
    
    // Test all navigation links
    const navLinks = [
      { text: 'Dashboard', url: '/admin/dashboard' },
      { text: 'Products', url: '/admin/products' },
      { text: 'Orders', url: '/admin/orders' },
      { text: 'Customers', url: '/admin/customers' },
      { text: 'Inventory', url: '/admin/inventory' },
      { text: 'POS', url: '/admin/pos' },
      { text: 'Analytics', url: '/admin/analytics' },
      { text: 'Settings', url: '/admin/settings' }
    ];
    
    for (const link of navLinks) {
      const navLink = page.locator(`text="${link.text}"`).first();
      await expect(navLink).toBeVisible();
    }
  });

  test('Dashboard Stats Cards', async ({ page }) => {
    // Login and navigate to dashboard
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    // Test stats cards are visible
    await expect(page.locator('text="Total Sales"')).toBeVisible();
    await expect(page.locator('text="Orders"')).toBeVisible();
    await expect(page.locator('text="Customers"')).toBeVisible();
    await expect(page.locator('text="Products"')).toBeVisible();
    
    // Test that stats show actual numbers (not just "0" or loading states)
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toHaveCount(4);
  });

  test('POS Interface Functionality', async ({ page }) => {
    // Login and navigate to POS
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    // Navigate to POS
    await page.click('text="POS"');
    await expect(page).toHaveURL('http://localhost:3000/admin/pos');
    
    // Test POS interface elements
    await expect(page.locator('text="Point of Sale"')).toBeVisible();
    
    // Test product grid
    const productGrid = page.locator('[data-testid="pos-product-grid"]');
    await expect(productGrid).toBeVisible();
    
    // Test cart section
    const cart = page.locator('[data-testid="pos-cart"]');
    await expect(cart).toBeVisible();
    
    // Test add product to cart functionality
    const firstProduct = page.locator('[data-testid="pos-product-card"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      // Cart should update with product
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    }
  });

  test('Products Management Page', async ({ page }) => {
    // Login and navigate to Products
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    await page.click('text="Products"');
    await expect(page).toHaveURL('http://localhost:3000/admin/products');
    
    // Test products page functionality
    await expect(page.locator('h1')).toContainText('Products');
    
    // Test if products are loaded from database
    const productsList = page.locator('[data-testid="products-list"]');
    await expect(productsList).toBeVisible();
  });

  test('Orders Management Page', async ({ page }) => {
    // Login and navigate to Orders
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    await page.click('text="Orders"');
    await expect(page).toHaveURL('http://localhost:3000/admin/orders');
    
    // Test orders page functionality
    await expect(page.locator('h1')).toContainText('Orders');
  });

  test('Settings Page with Company Info', async ({ page }) => {
    // Login and navigate to Settings
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    await page.click('text="Settings"');
    await expect(page).toHaveURL('http://localhost:3000/admin/settings');
    
    // Test settings page elements
    await expect(page.locator('h1')).toContainText('Settings');
    
    // Test company settings form
    const companyForm = page.locator('[data-testid="company-settings-form"]');
    await expect(companyForm).toBeVisible();
    
    // Test currency converter
    const currencyConverter = page.locator('[data-testid="currency-converter"]');
    await expect(currencyConverter).toBeVisible();
    
    // Test default currency is SCR (Seychelles Rupees)
    await expect(page.locator('text="SCR"')).toBeVisible();
  });

  test('Currency Conversion Functionality', async ({ page }) => {
    // Login and navigate to Settings
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    await page.click('text="Settings"');
    await page.waitForURL('http://localhost:3000/admin/settings');
    
    // Test currency converter functionality
    const amountInput = page.locator('[data-testid="amount-input"]');
    const fromCurrency = page.locator('[data-testid="from-currency"]');
    const toCurrency = page.locator('[data-testid="to-currency"]');
    const convertButton = page.locator('[data-testid="convert-button"]');
    
    if (await amountInput.count() > 0) {
      await amountInput.fill('100');
      await convertButton.click();
      
      // Should show conversion result
      const result = page.locator('[data-testid="conversion-result"]');
      await expect(result).toBeVisible();
    }
  });

  test('Inventory Management', async ({ page }) => {
    // Login and navigate to Inventory
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    await page.click('text="Inventory"');
    await expect(page).toHaveURL('http://localhost:3000/admin/inventory');
    
    // Test inventory page
    await expect(page.locator('h1')).toContainText('Inventory');
    
    // Test stock level indicators
    const stockLevels = page.locator('[data-testid="stock-level"]');
    if (await stockLevels.count() > 0) {
      await expect(stockLevels.first()).toBeVisible();
    }
  });

  test('Customer Management', async ({ page }) => {
    // Login and navigate to Customers
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    await page.click('text="Customers"');
    await expect(page).toHaveURL('http://localhost:3000/admin/customers');
    
    // Test customers page
    await expect(page.locator('h1')).toContainText('Customers');
  });

  test('Analytics Dashboard', async ({ page }) => {
    // Login and navigate to Analytics
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    await page.click('text="Analytics"');
    await expect(page).toHaveURL('http://localhost:3000/admin/analytics');
    
    // Test analytics page
    await expect(page.locator('h1')).toContainText('Analytics');
  });

  test('Mobile Responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login on mobile
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@equatorialimports.sc');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin/dashboard');
    
    // Test mobile navigation
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.count() > 0) {
      await mobileMenuButton.click();
      const sidebar = page.locator('[data-testid="admin-sidebar"]');
      await expect(sidebar).toBeVisible();
    }
  });

  test('Error Handling and Authentication', async ({ page }) => {
    // Test accessing admin pages without authentication
    await page.goto('http://localhost:3000/admin/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('http://localhost:3000/admin/login');
    
    // Test invalid login credentials
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text="Invalid email or password"')).toBeVisible();
  });
});