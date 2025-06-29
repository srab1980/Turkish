import { test, expect } from '@playwright/test';

test.describe('Admin Panel E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin panel
    await page.goto('http://localhost:3001');
  });

  test('should load the home page successfully', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/Turkish Learning Platform/);
    
    // Check for main navigation elements
    await expect(page.getByText('Turkish Learning Platform')).toBeVisible();
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
  });

  test('should navigate through main sections', async ({ page }) => {
    // Test navigation to Users page
    await page.click('text=Users');
    await expect(page).toHaveURL(/.*\/users/);
    await expect(page.getByText('User Management')).toBeVisible();

    // Test navigation to Analytics page
    await page.click('text=Analytics');
    await expect(page).toHaveURL(/.*\/analytics/);
    await expect(page.getByText('Analytics Overview')).toBeVisible();

    // Test navigation to Content pages
    await page.click('text=Content');
    await page.click('text=Courses');
    await expect(page).toHaveURL(/.*\/content\/courses/);
    await expect(page.getByText('Course Management')).toBeVisible();
  });

  test('should display user data correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/users');
    
    // Wait for the page to load
    await expect(page.getByText('User Management')).toBeVisible();
    
    // Check for user data (mock data)
    await expect(page.getByText('Ahmet Yılmaz')).toBeVisible();
    await expect(page.getByText('Sarah Johnson')).toBeVisible();
    await expect(page.getByText('Fatma Özkan')).toBeVisible();
  });

  test('should display analytics data', async ({ page }) => {
    await page.goto('http://localhost:3001/analytics');
    
    // Wait for analytics to load
    await expect(page.getByText('Analytics Overview')).toBeVisible();
    
    // Check for metric cards
    await expect(page.getByText('Total Users')).toBeVisible();
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('Total Courses')).toBeVisible();
    await expect(page.getByText('Completion Rate')).toBeVisible();
    
    // Check for metric values
    await expect(page.getByText('1,250')).toBeVisible();
    await expect(page.getByText('890')).toBeVisible();
  });

  test('should navigate to content management pages', async ({ page }) => {
    // Test Lessons page
    await page.goto('http://localhost:3001/content/lessons');
    await expect(page.getByText('Lessons')).toBeVisible();
    await expect(page.getByText('Basic Greetings')).toBeVisible();

    // Test Vocabulary page
    await page.goto('http://localhost:3001/content/vocabulary');
    await expect(page.getByText('Vocabulary')).toBeVisible();
    await expect(page.getByText('Merhaba')).toBeVisible();

    // Test Exercises page
    await page.goto('http://localhost:3001/content/exercises');
    await expect(page.getByText('Exercises')).toBeVisible();
    await expect(page.getByText('Greeting Vocabulary Quiz')).toBeVisible();

    // Test Grammar page
    await page.goto('http://localhost:3001/content/grammar');
    await expect(page.getByText('Grammar Rules')).toBeVisible();
    await expect(page.getByText('Present Tense (-iyor)')).toBeVisible();
  });

  test('should navigate to AI tools pages', async ({ page }) => {
    // Test Content Import page
    await page.goto('http://localhost:3001/ai-tools/import');
    await expect(page.getByText('Content Import')).toBeVisible();
    await expect(page.getByText('Upload Istanbul Book PDFs')).toBeVisible();

    // Test Exercise Generator page
    await page.goto('http://localhost:3001/ai-tools/exercises');
    await expect(page.getByText('AI Exercise Generator')).toBeVisible();
    await expect(page.getByText('Configuration')).toBeVisible();

    // Test Content Review page
    await page.goto('http://localhost:3001/ai-tools/review');
    await expect(page.getByText('Content Review')).toBeVisible();
    await expect(page.getByText('Pending Review')).toBeVisible();
  });

  test('should navigate to system configuration pages', async ({ page }) => {
    // Test System Config page
    await page.goto('http://localhost:3001/system/config');
    await expect(page.getByText('System Configuration')).toBeVisible();
    await expect(page.getByText('General Settings')).toBeVisible();

    // Test Feature Flags page
    await page.goto('http://localhost:3001/system/features');
    await expect(page.getByText('Feature Flags')).toBeVisible();
    await expect(page.getByText('AI Content Generation')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('http://localhost:3001/users');
    
    // Test search input
    const searchInput = page.getByPlaceholder('Search users...');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('Ahmet');
    // In a real app, this would filter results
    await expect(searchInput).toHaveValue('Ahmet');
  });

  test('should handle filter functionality', async ({ page }) => {
    await page.goto('http://localhost:3001/content/lessons');
    
    // Test course filter
    const courseFilter = page.getByRole('combobox').first();
    await expect(courseFilter).toBeVisible();
    
    await courseFilter.selectOption('1'); // Turkish for Beginners
    // In a real app, this would filter lessons
  });

  test('should display responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001');
    
    // Mobile menu should be visible
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // Desktop navigation should be visible
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Users')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('http://localhost:3001/non-existent-page');
    await expect(page.getByText('404')).toBeVisible();
  });

  test('should maintain state across navigation', async ({ page }) => {
    // Navigate to analytics
    await page.goto('http://localhost:3001/analytics');
    await expect(page.getByText('Analytics Overview')).toBeVisible();
    
    // Navigate to users and back
    await page.click('text=Users');
    await expect(page).toHaveURL(/.*\/users/);
    
    await page.click('text=Analytics');
    await expect(page).toHaveURL(/.*\/analytics/);
    await expect(page.getByText('Analytics Overview')).toBeVisible();
  });

  test('should load all pages without errors', async ({ page }) => {
    const pages = [
      '/',
      '/users',
      '/content/courses',
      '/content/lessons',
      '/content/exercises',
      '/content/vocabulary',
      '/content/grammar',
      '/analytics',
      '/ai-tools/import',
      '/ai-tools/exercises',
      '/ai-tools/review',
      '/system/config',
      '/system/features'
    ];

    for (const pagePath of pages) {
      await page.goto(`http://localhost:3001${pagePath}`);
      
      // Check that page loads without errors
      await expect(page.locator('body')).toBeVisible();
      
      // Check that there's no error message
      await expect(page.getByText('Error')).not.toBeVisible();
      await expect(page.getByText('404')).not.toBeVisible();
    }
  });
});
