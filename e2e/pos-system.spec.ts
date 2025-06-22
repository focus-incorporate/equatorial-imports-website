import { test, expect } from '@playwright/test';

test.describe('POS System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to POS system
    await page.goto('/admin/pos');
  });

  test('should display POS interface elements', async ({ page }) => {
    // Check main interface elements
    await expect(page.locator('text=Point of Sale')).toBeVisible();
    await expect(page.locator('input[placeholder="Search products..."]')).toBeVisible();
    
    // Check category buttons
    await expect(page.locator('text=All Products')).toBeVisible();
    await expect(page.locator('text=Capsules')).toBeVisible();
    await expect(page.locator('text=Beans')).toBeVisible();
    
    // Check cart section
    await expect(page.locator('text=Cart (0)')).toBeVisible();
    await expect(page.locator('text=Cart is empty')).toBeVisible();
  });

  test('should display product grid', async ({ page }) => {
    // Check for product cards
    await expect(page.locator('text=Intenso')).toBeVisible();
    await expect(page.locator('text=Ristretto')).toBeVisible();
    await expect(page.locator('text=Italian Roast')).toBeVisible();
    
    // Check product details
    await expect(page.locator('text=$9.99').first()).toBeVisible();
    await expect(page.locator('text=daniels-blend').first()).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Click on Capsules category
    await page.click('text=Capsules');
    
    // Should show capsule products
    await expect(page.locator('text=Intenso')).toBeVisible();
    await expect(page.locator('text=Ristretto')).toBeVisible();
    
    // Click on Beans category
    await page.click('text=Beans');
    
    // Should show bean products
    await expect(page.locator('text=Italian Roast')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    // Search for a specific product
    await page.fill('input[placeholder="Search products..."]', 'Intenso');
    
    // Should show only matching products
    await expect(page.locator('text=Intenso')).toBeVisible();
    
    // Clear search
    await page.fill('input[placeholder="Search products..."]', '');
    
    // Should show all products again
    await expect(page.locator('text=Ristretto')).toBeVisible();
  });

  test('should add products to cart', async ({ page }) => {
    // Add first product to cart
    await page.click('text=Intenso');
    
    // Cart should update
    await expect(page.locator('text=Cart (1)')).toBeVisible();
    await expect(page.locator('text=Intenso').nth(1)).toBeVisible(); // In cart
    
    // Add another product
    await page.click('text=Ristretto');
    
    // Cart should show 2 items
    await expect(page.locator('text=Cart (2)')).toBeVisible();
  });

  test('should update cart item quantities', async ({ page }) => {
    // Add product to cart
    await page.click('text=Intenso');
    
    // Find the quantity controls in cart
    const cartSection = page.locator('[class*="cart"]').last();
    
    // Increase quantity
    await cartSection.locator('button').filter({ hasText: '+' }).first().click();
    
    // Should show quantity 2
    await expect(cartSection.locator('text=2')).toBeVisible();
    
    // Decrease quantity
    await cartSection.locator('button').filter({ hasText: '−' }).first().click();
    
    // Should show quantity 1
    await expect(cartSection.locator('text=1')).toBeVisible();
  });

  test('should calculate totals correctly', async ({ page }) => {
    // Add product to cart (Intenso - $9.99)
    await page.click('text=Intenso');
    
    // Check subtotal
    await expect(page.locator('text=Subtotal:').locator('..').locator('text=$9.99')).toBeVisible();
    
    // Check tax (15% of $9.99 = $1.50)
    await expect(page.locator('text=Tax (15%):').locator('..').locator('text=$1.50')).toBeVisible();
    
    // Check total ($9.99 + $1.50 = $11.49)
    await expect(page.locator('text=Total:').locator('..').locator('text=$11.49')).toBeVisible();
  });

  test('should handle cash payment', async ({ page }) => {
    // Add product to cart
    await page.click('text=Intenso');
    
    // Cash should be selected by default
    await expect(page.locator('button:has-text("Cash")').first()).toHaveClass(/bg-coffee-600/);
    
    // Enter cash received
    await page.fill('input[placeholder="0.00"]', '15.00');
    
    // Should show change
    await expect(page.locator('text=Change: $3.51')).toBeVisible();
  });

  test('should enable transaction completion with sufficient payment', async ({ page }) => {
    // Add product to cart
    await page.click('text=Intenso');
    
    // Enter sufficient cash
    await page.fill('input[placeholder="0.00"]', '15.00');
    
    // Complete transaction button should be enabled
    const completeButton = page.locator('button:has-text("Complete Transaction")');
    await expect(completeButton).toBeEnabled();
    
    // Click complete transaction
    await completeButton.click();
    
    // Should show success message
    await expect(page.locator('text=Transaction completed successfully!')).toBeVisible();
    
    // Cart should be cleared
    await expect(page.locator('text=Cart (0)')).toBeVisible();
  });

  test('should disable transaction completion with insufficient payment', async ({ page }) => {
    // Add product to cart
    await page.click('text=Intenso');
    
    // Enter insufficient cash
    await page.fill('input[placeholder="0.00"]', '5.00');
    
    // Complete transaction button should be disabled
    const completeButton = page.locator('button:has-text("Complete Transaction")');
    await expect(completeButton).toBeDisabled();
  });

  test('should clear cart', async ({ page }) => {
    // Add products to cart
    await page.click('text=Intenso');
    await page.click('text=Ristretto');
    
    // Should have items in cart
    await expect(page.locator('text=Cart (2)')).toBeVisible();
    
    // Clear cart
    await page.click('text=Clear All');
    
    // Cart should be empty
    await expect(page.locator('text=Cart (0)')).toBeVisible();
    await expect(page.locator('text=Cart is empty')).toBeVisible();
  });
});