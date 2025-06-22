import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin/dashboard');
  });

  test('should display dashboard stats cards', async ({ page }) => {
    // Check for stat cards
    await expect(page.getByText('Today\'s Revenue')).toBeVisible();
    await expect(page.getByText('Total Orders')).toBeVisible();
    await expect(page.getByText('Active Customers')).toBeVisible();
    await expect(page.getByText('Low Stock Items')).toBeVisible();

    // Check for stat values
    await expect(page.getByText('$1,247.50')).toBeVisible();
    await expect(page.getByText('47', { exact: true })).toBeVisible();
    await expect(page.getByText('284', { exact: true })).toBeVisible();
    await expect(page.getByText('3', { exact: true })).toBeVisible();
  });

  test('should display recent orders section', async ({ page }) => {
    await expect(page.getByText('Recent Orders')).toBeVisible();
    
    // Check for order entries
    await expect(page.getByText('ORD-001')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('pending').first()).toBeVisible();
  });

  test('should display top products section', async ({ page }) => {
    await expect(page.locator('text=Top Products')).toBeVisible();
    
    // Check for product entries
    await expect(page.locator('text=Intenso Capsules')).toBeVisible();
    await expect(page.locator('text=145 sold')).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    
    // Check for action buttons
    await expect(page.locator('text=New POS Sale')).toBeVisible();
    await expect(page.locator('text=Add Product')).toBeVisible();
    await expect(page.locator('text=Add Customer')).toBeVisible();
    await expect(page.locator('text=View Reports')).toBeVisible();
  });

  test('should have working sidebar navigation', async ({ page }) => {
    // Check sidebar items in navigation
    const sidebar = page.locator('[class*="coffee-900"]').first();
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('POS System')).toBeVisible();
    await expect(sidebar.getByText('Products')).toBeVisible();
    await expect(sidebar.getByText('Orders')).toBeVisible();
    await expect(sidebar.getByText('Customers')).toBeVisible();
    await expect(sidebar.getByText('Inventory')).toBeVisible();
    await expect(sidebar.getByText('Analytics')).toBeVisible();
  });

  test('should navigate to POS system', async ({ page }) => {
    // Click POS System in sidebar
    const sidebar = page.locator('[class*="coffee-900"]').first();
    await sidebar.getByText('POS System').click();
    await expect(page).toHaveURL('/admin/pos');
    await expect(page.getByText('Point of Sale')).toBeVisible();
  });
});