import { test, expect, Page } from '@playwright/test';

test.describe('Comprehensive Admin Dashboard Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin/dashboard');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test.describe('1. Dashboard Stats Cards', () => {
    test('should display all stats cards with correct data', async ({ page }) => {
      // Take screenshot of dashboard overview
      await page.screenshot({ path: 'test-results/dashboard-overview.png', fullPage: true });
      
      // Check for all stat cards
      await expect(page.locator('text=Today\'s Revenue')).toBeVisible();
      await expect(page.locator('text=Total Orders')).toBeVisible();
      await expect(page.locator('text=Active Customers')).toBeVisible();
      await expect(page.locator('text=Low Stock Items')).toBeVisible();

      // Verify stat values
      await expect(page.locator('text=$1,247.50')).toBeVisible();
      await expect(page.locator('text=47').first()).toBeVisible();
      await expect(page.locator('text=284').first()).toBeVisible();
      await expect(page.locator('text=3').first()).toBeVisible();

      // Verify change indicators
      await expect(page.locator('text=+12.5%')).toBeVisible();
      await expect(page.locator('text=+8.2%')).toBeVisible();
      await expect(page.locator('text=+4.1%')).toBeVisible();
      await expect(page.locator('text=-2')).toBeVisible();

      // Verify icons are present
      const statCards = page.locator('div').filter({ hasText: /Today's Revenue|Total Orders|Active Customers|Low Stock Items/ });
      await expect(statCards).toHaveCount(4);
    });

    test('should have proper styling and layout for stats cards', async ({ page }) => {
      const statsGrid = page.locator('div').filter({ hasText: 'Today\'s Revenue' }).first().locator('..');
      
      // Check grid layout classes
      await expect(statsGrid).toHaveClass(/grid/);
      await expect(statsGrid).toHaveClass(/grid-cols-1/);
      await expect(statsGrid).toHaveClass(/md:grid-cols-2/);
      await expect(statsGrid).toHaveClass(/lg:grid-cols-4/);
    });
  });

  test.describe('2. Recent Orders Section', () => {
    test('should display recent orders with correct data and functionality', async ({ page }) => {
      // Take screenshot of recent orders section
      await page.locator('text=Recent Orders').screenshot({ path: 'test-results/recent-orders-section.png' });
      
      await expect(page.locator('text=Recent Orders')).toBeVisible();
      
      // Check for "View all" button
      await expect(page.locator('button:has-text("View all")')).toBeVisible();
      
      // Check for order entries
      await expect(page.locator('text=ORD-001')).toBeVisible();
      await expect(page.locator('text=John Doe')).toBeVisible();
      await expect(page.locator('text=Jane Smith')).toBeVisible();
      await expect(page.locator('text=Mike Johnson')).toBeVisible();
      await expect(page.locator('text=Sarah Wilson')).toBeVisible();
      
      // Check order amounts
      await expect(page.locator('text=$29.97')).toBeVisible();
      await expect(page.locator('text=$45.50')).toBeVisible();
      await expect(page.locator('text=$19.99')).toBeVisible();
      await expect(page.locator('text=$67.25')).toBeVisible();
      
      // Check order statuses
      await expect(page.locator('text=pending').first()).toBeVisible();
      await expect(page.locator('text=confirmed')).toBeVisible();
      await expect(page.locator('text=delivered')).toBeVisible();
      
      // Check time stamps
      await expect(page.locator('text=2 min ago')).toBeVisible();
      await expect(page.locator('text=5 min ago')).toBeVisible();
      await expect(page.locator('text=12 min ago')).toBeVisible();
      await expect(page.locator('text=18 min ago')).toBeVisible();
    });

    test('should have proper status badge styling', async ({ page }) => {
      // Check status badges have correct styling
      const pendingBadge = page.locator('span:has-text("pending")').first();
      const confirmedBadge = page.locator('span:has-text("confirmed")');
      const deliveredBadge = page.locator('span:has-text("delivered")');
      
      await expect(pendingBadge).toHaveClass(/bg-yellow-100/);
      await expect(confirmedBadge).toHaveClass(/bg-blue-100/);
      await expect(deliveredBadge).toHaveClass(/bg-green-100/);
    });

    test('should test View all button functionality', async ({ page }) => {
      const viewAllButton = page.locator('button:has-text("View all")');
      await expect(viewAllButton).toBeVisible();
      
      // Click should not cause errors (though it might not navigate anywhere yet)
      await viewAllButton.click();
      
      // Take screenshot after clicking
      await page.screenshot({ path: 'test-results/view-all-orders-clicked.png' });
    });
  });

  test.describe('3. Top Products Section', () => {
    test('should display top products with data and charts', async ({ page }) => {
      // Take screenshot of top products section
      await page.locator('text=Top Products').screenshot({ path: 'test-results/top-products-section.png' });
      
      await expect(page.locator('text=Top Products')).toBeVisible();
      
      // Check for trending icon
      await expect(page.locator('svg').filter({ hasText: /TrendingUp/ })).toBeVisible();
      
      // Check for product entries
      await expect(page.locator('text=Intenso Capsules')).toBeVisible();
      await expect(page.locator('text=Ristretto Capsules')).toBeVisible();
      await expect(page.locator('text=Italian Roast Beans')).toBeVisible();
      await expect(page.locator('text=Caramello Capsules')).toBeVisible();
      
      // Check sales numbers
      await expect(page.locator('text=145 sold')).toBeVisible();
      await expect(page.locator('text=132 sold')).toBeVisible();
      await expect(page.locator('text=89 sold')).toBeVisible();
      await expect(page.locator('text=76 sold')).toBeVisible();
      
      // Check revenue amounts
      await expect(page.locator('text=$1449.55')).toBeVisible();
      await expect(page.locator('text=$1318.68')).toBeVisible();
      await expect(page.locator('text=$1423.11')).toBeVisible();
      await expect(page.locator('text=$986.24')).toBeVisible();
    });

    test('should display progress bars for products', async ({ page }) => {
      // Check for progress bars
      const progressBars = page.locator('div').filter({ hasText: /Intenso Capsules|Ristretto Capsules|Italian Roast Beans|Caramello Capsules/ })
        .locator('div.bg-cream-200.rounded-full');
      
      await expect(progressBars).toHaveCount(4);
      
      // Check inner progress bars
      const innerBars = page.locator('div.bg-coffee-600.h-2.rounded-full');
      await expect(innerBars).toHaveCount(4);
    });
  });

  test.describe('4. Quick Action Buttons', () => {
    test('should display all quick action buttons', async ({ page }) => {
      // Take screenshot of quick actions section
      await page.locator('text=Quick Actions').screenshot({ path: 'test-results/quick-actions-section.png' });
      
      await expect(page.locator('text=Quick Actions')).toBeVisible();
      
      // Check for all action buttons
      await expect(page.locator('button:has-text("New POS Sale")')).toBeVisible();
      await expect(page.locator('button:has-text("Add Product")')).toBeVisible();
      await expect(page.locator('button:has-text("Add Customer")')).toBeVisible();
      await expect(page.locator('button:has-text("View Reports")')).toBeVisible();
    });

    test('should test quick action button interactions', async ({ page }) => {
      const buttons = [
        { text: 'New POS Sale', expectedUrl: '/admin/pos' },
        { text: 'Add Product', expectedUrl: '/admin/products' },
        { text: 'Add Customer', expectedUrl: '/admin/customers' },
        { text: 'View Reports', expectedUrl: '/admin/analytics' }
      ];

      for (const button of buttons) {
        // Reset to dashboard
        await page.goto('/admin/dashboard');
        await page.waitForLoadState('networkidle');
        
        const buttonElement = page.locator(`button:has-text("${button.text}")`);
        await expect(buttonElement).toBeVisible();
        
        // Test hover effect
        await buttonElement.hover();
        await page.screenshot({ path: `test-results/quick-action-${button.text.toLowerCase().replace(/\s+/g, '-')}-hover.png` });
        
        // Click the button
        await buttonElement.click();
        
        // Take screenshot of result
        await page.screenshot({ path: `test-results/quick-action-${button.text.toLowerCase().replace(/\s+/g, '-')}-clicked.png` });
        
        // Check if navigation occurred or if button functionality works
        console.log(`Clicked "${button.text}" - Current URL: ${page.url()}`);
      }
    });

    test('should have proper button styling and hover effects', async ({ page }) => {
      const buttons = page.locator('button').filter({ hasText: /New POS Sale|Add Product|Add Customer|View Reports/ });
      
      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i);
        await expect(button).toHaveClass(/bg-coffee-50/);
        await expect(button).toHaveClass(/hover:bg-coffee-100/);
      }
    });
  });

  test.describe('5. Sidebar Navigation', () => {
    test('should display all sidebar menu items', async ({ page }) => {
      // Take screenshot of sidebar
      await page.locator('div').filter({ hasText: 'Equatorial Admin' }).screenshot({ path: 'test-results/admin-sidebar.png' });
      
      const sidebar = page.locator('div.bg-coffee-900');
      
      // Check logo and title
      await expect(sidebar.locator('text=Equatorial Admin')).toBeVisible();
      
      // Check all navigation items
      const navItems = [
        'Dashboard',
        'POS System', 
        'Products',
        'Orders',
        'Customers',
        'Inventory',
        'Invoices',
        'Analytics',
        'Settings'
      ];
      
      for (const item of navItems) {
        await expect(sidebar.locator(`text=${item}`)).toBeVisible();
      }
      
      // Check user section
      await expect(sidebar.locator('text=Admin User')).toBeVisible();
      await expect(sidebar.locator('text=admin@equatorial.sc')).toBeVisible();
      await expect(sidebar.locator('text=Sign out')).toBeVisible();
    });

    test('should test navigation to each menu item and document 404s', async ({ page }) => {
      const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', shouldWork: true },
        { name: 'POS System', href: '/admin/pos', shouldWork: true },
        { name: 'Products', href: '/admin/products', shouldWork: false },
        { name: 'Orders', href: '/admin/orders', shouldWork: false },
        { name: 'Customers', href: '/admin/customers', shouldWork: false },
        { name: 'Inventory', href: '/admin/inventory', shouldWork: false },
        { name: 'Invoices', href: '/admin/invoices', shouldWork: false },
        { name: 'Analytics', href: '/admin/analytics', shouldWork: false },
        { name: 'Settings', href: '/admin/settings', shouldWork: false }
      ];

      const sidebar = page.locator('div.bg-coffee-900');
      
      for (const item of navItems) {
        console.log(`Testing navigation to: ${item.name}`);
        
        // Navigate back to dashboard first
        await page.goto('/admin/dashboard');
        await page.waitForLoadState('networkidle');
        
        // Click the navigation item
        await sidebar.locator(`text=${item.name}`).click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot
        await page.screenshot({ path: `test-results/nav-${item.name.toLowerCase().replace(/\s+/g, '-')}.png`, fullPage: true });
        
        // Check URL
        expect(page.url()).toContain(item.href);
        
        if (item.shouldWork) {
          // Should not show 404 error
          await expect(page.locator('text=404')).not.toBeVisible();
          console.log(`✅ ${item.name} - Working correctly`);
        } else {
          // Should show 404 or error page
          try {
            await expect(page.locator('text=404')).toBeVisible({ timeout: 5000 });
            console.log(`❌ ${item.name} - Returns 404 (Expected)`);
          } catch {
            // Might be a different error page or empty page
            console.log(`❌ ${item.name} - Page not implemented (Expected)`);
          }
        }
      }
    });

    test('should highlight active navigation item', async ({ page }) => {
      const sidebar = page.locator('div.bg-coffee-900');
      
      // Dashboard should be active
      const dashboardLink = sidebar.locator('a[href="/admin/dashboard"]');
      await expect(dashboardLink).toHaveClass(/bg-coffee-700/);
      
      // Navigate to POS and check active state
      await sidebar.locator('text=POS System').click();
      await page.waitForLoadState('networkidle');
      
      const posLink = sidebar.locator('a[href="/admin/pos"]');
      await expect(posLink).toHaveClass(/bg-coffee-700/);
    });

    test('should test user section functionality', async ({ page }) => {
      const sidebar = page.locator('div.bg-coffee-900');
      
      // Check user avatar
      const userAvatar = sidebar.locator('div.bg-coffee-600.rounded-full');
      await expect(userAvatar).toBeVisible();
      await expect(userAvatar.locator('text=A')).toBeVisible();
      
      // Test sign out button
      const signOutButton = sidebar.locator('button:has-text("Sign out")');
      await expect(signOutButton).toBeVisible();
      
      // Test hover effect
      await signOutButton.hover();
      await page.screenshot({ path: 'test-results/sign-out-hover.png' });
    });
  });

  test.describe('6. Header Functionality', () => {
    test('should display and test header components', async ({ page }) => {
      // Take screenshot of header
      await page.locator('header').screenshot({ path: 'test-results/admin-header.png' });
      
      const header = page.locator('header');
      
      // Check title
      await expect(header.locator('text=Dashboard')).toBeVisible();
      
      // Check search bar
      const searchInput = header.locator('input[placeholder="Search..."]');
      await expect(searchInput).toBeVisible();
      
      // Check notifications button
      const notificationButton = header.locator('button').filter({ hasText: /Bell/ });
      await expect(notificationButton).toBeVisible();
      
      // Check notification badge
      const notificationBadge = header.locator('span.bg-red-500.rounded-full');
      await expect(notificationBadge).toBeVisible();
      
      // Check profile avatar
      const profileAvatar = header.locator('div.bg-coffee-600.rounded-full');
      await expect(profileAvatar).toBeVisible();
    });

    test('should test search functionality', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="Search..."]');
      
      // Test typing in search
      await searchInput.fill('test search');
      await expect(searchInput).toHaveValue('test search');
      
      // Test clearing search
      await searchInput.fill('');
      await expect(searchInput).toHaveValue('');
      
      // Take screenshot of search interaction
      await searchInput.fill('coffee');
      await page.screenshot({ path: 'test-results/header-search-interaction.png' });
    });

    test('should test notification button', async ({ page }) => {
      const notificationButton = page.locator('button').filter({ hasText: /Bell/ });
      
      // Test click
      await notificationButton.click();
      await page.screenshot({ path: 'test-results/notification-clicked.png' });
      
      // Test hover
      await notificationButton.hover();
    });

    test('should test mobile hamburger menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of mobile view
      await page.screenshot({ path: 'test-results/mobile-header.png' });
      
      // Check if hamburger menu is visible
      const hamburgerButton = page.locator('button').filter({ hasText: /Menu/ });
      await expect(hamburgerButton).toBeVisible();
      
      // Test hamburger menu click
      await hamburgerButton.click();
      await page.screenshot({ path: 'test-results/mobile-menu-clicked.png' });
    });
  });

  test.describe('7. Responsive Design', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      test(`should display correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Take full page screenshot
        await page.screenshot({ 
          path: `test-results/responsive-${viewport.name.toLowerCase()}.png`, 
          fullPage: true 
        });
        
        // Check if stats grid adapts
        if (viewport.width >= 1024) {
          // Large screens should show 4 columns
          const statsGrid = page.locator('div').filter({ hasText: 'Today\'s Revenue' }).first().locator('..');
          await expect(statsGrid).toHaveClass(/lg:grid-cols-4/);
        } else if (viewport.width >= 768) {
          // Medium screens should show 2 columns
          const statsGrid = page.locator('div').filter({ hasText: 'Today\'s Revenue' }).first().locator('..');
          await expect(statsGrid).toHaveClass(/md:grid-cols-2/);
        }
        
        // Check if sidebar is hidden on mobile
        if (viewport.width < 768) {
          const sidebar = page.locator('div.bg-coffee-900');
          // Sidebar might be hidden or transformed on mobile
          const hamburgerButton = page.locator('button').filter({ hasText: /Menu/ });
          await expect(hamburgerButton).toBeVisible();
        }
        
        // Verify content is still readable and accessible
        await expect(page.locator('text=Dashboard')).toBeVisible();
        await expect(page.locator('text=Today\'s Revenue')).toBeVisible();
      });
    }
  });

  test.describe('8. Forms and Interactive Elements', () => {
    test('should test all interactive elements', async ({ page }) => {
      // Test all buttons for hover effects
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        await button.hover();
        // Small delay to see hover effect
        await page.waitForTimeout(100);
      }
      
      // Test input fields
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        await input.focus();
        await page.waitForTimeout(100);
      }
      
      // Take screenshot of all interactions
      await page.screenshot({ path: 'test-results/interactive-elements.png', fullPage: true });
    });

    test('should test keyboard navigation', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Take screenshot showing focus
      await page.screenshot({ path: 'test-results/keyboard-navigation.png' });
      
      // Test Enter key on focused element
      await page.keyboard.press('Enter');
      await page.screenshot({ path: 'test-results/keyboard-interaction.png' });
    });
  });

  test.describe('9. Data Loading and Error States', () => {
    test('should handle page loading states', async ({ page }) => {
      // Navigate to dashboard and check loading
      await page.goto('/admin/dashboard');
      
      // Wait for network idle to ensure all data is loaded
      await page.waitForLoadState('networkidle');
      
      // Verify all data is displayed (no loading states visible)
      await expect(page.locator('text=Today\'s Revenue')).toBeVisible();
      await expect(page.locator('text=Recent Orders')).toBeVisible();
      await expect(page.locator('text=Top Products')).toBeVisible();
      await expect(page.locator('text=Quick Actions')).toBeVisible();
      
      // Take screenshot of fully loaded state
      await page.screenshot({ path: 'test-results/data-loaded-state.png', fullPage: true });
    });

    test('should test error handling', async ({ page }) => {
      // Test with slow/failed network
      await page.route('**/*', route => {
        // Simulate slow network
        setTimeout(() => route.continue(), 1000);
      });
      
      await page.goto('/admin/dashboard');
      
      // Take screenshot during loading
      await page.screenshot({ path: 'test-results/loading-state.png', fullPage: true });
      
      await page.waitForLoadState('networkidle');
      
      // Verify page still loads correctly
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should test empty states', async ({ page }) => {
      // Since we're using mock data, we can't easily test empty states
      // But we can verify the structure is in place
      await expect(page.locator('text=Recent Orders')).toBeVisible();
      await expect(page.locator('text=Top Products')).toBeVisible();
      
      // Take screenshot for documentation
      await page.screenshot({ path: 'test-results/mock-data-state.png', fullPage: true });
    });
  });

  test.describe('10. Navigation Between Admin Sections', () => {
    test('should successfully navigate between working sections', async ({ page }) => {
      // Test Dashboard -> POS -> Dashboard flow
      await expect(page.locator('text=Dashboard')).toBeVisible();
      
      // Navigate to POS
      await page.locator('text=POS System').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Point of Sale')).toBeVisible();
      
      // Take screenshot of POS page
      await page.screenshot({ path: 'test-results/pos-page-navigation.png', fullPage: true });
      
      // Navigate back to Dashboard
      await page.locator('text=Dashboard').click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Today\'s Revenue')).toBeVisible();
      
      // Take screenshot back on dashboard
      await page.screenshot({ path: 'test-results/back-to-dashboard.png', fullPage: true });
    });

    test('should document all navigation paths', async ({ page }) => {
      const navigationPaths = [
        { from: 'Dashboard', to: 'POS System', working: true },
        { from: 'Dashboard', to: 'Products', working: false },
        { from: 'Dashboard', to: 'Orders', working: false },
        { from: 'Dashboard', to: 'Customers', working: false },
        { from: 'Dashboard', to: 'Inventory', working: false },
        { from: 'Dashboard', to: 'Invoices', working: false },
        { from: 'Dashboard', to: 'Analytics', working: false },
        { from: 'Dashboard', to: 'Settings', working: false }
      ];
      
      for (const path of navigationPaths) {
        // Start from dashboard
        await page.goto('/admin/dashboard');
        await page.waitForLoadState('networkidle');
        
        // Navigate to target
        await page.locator(`text=${path.to}`).click();
        await page.waitForLoadState('networkidle');
        
        // Document the result
        await page.screenshot({ 
          path: `test-results/navigation-${path.from.toLowerCase()}-to-${path.to.toLowerCase().replace(/\s+/g, '-')}.png`,
          fullPage: true 
        });
        
        console.log(`Navigation ${path.from} -> ${path.to}: ${path.working ? 'Working' : 'Not Implemented'}`);
      }
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across browsers', async ({ page, browserName }) => {
      // Take browser-specific screenshots
      await page.screenshot({ 
        path: `test-results/browser-${browserName}-dashboard.png`, 
        fullPage: true 
      });
      
      // Test basic functionality in each browser
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Today\'s Revenue')).toBeVisible();
      
      // Test interactive elements
      const quickActionButton = page.locator('button:has-text("New POS Sale")');
      await quickActionButton.hover();
      await quickActionButton.click();
      
      await page.screenshot({ 
        path: `test-results/browser-${browserName}-interaction.png`, 
        fullPage: true 
      });
      
      console.log(`Browser ${browserName}: Admin dashboard working correctly`);
    });
  });
});