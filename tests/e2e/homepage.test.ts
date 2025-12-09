import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Kasrah Games/);

    // Check header
    await expect(page.getByRole('heading', { name: 'Kasrah Games' })).toBeVisible();

    // Check navigation
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Games' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  test('should have hero section', async ({ page }) => {
    await page.goto('/');

    // Check hero title
    await expect(page.getByRole('heading', { name: /Play Amazing/ })).toBeVisible();

    // Check call-to-action buttons
    await expect(page.getByRole('link', { name: 'Browse Games' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Join Free' })).toBeVisible();
  });

  test('should have featured games section', async ({ page }) => {
    await page.goto('/');

    // Check section title
    await expect(page.getByRole('heading', { name: 'Featured Games' })).toBeVisible();

    // Check view all link
    await expect(page.getByRole('link', { name: 'View All Featured' })).toBeVisible();
  });

  test('should have categories section', async ({ page }) => {
    await page.goto('/');

    // Check section title
    await expect(page.getByRole('heading', { name: 'Browse Categories' })).toBeVisible();

    // Check category cards (at least some should exist)
    const categoryCards = page.locator('a[href*="category="]');
    await expect(categoryCards.first()).toBeVisible();
  });

  test('should have popular games section', async ({ page }) => {
    await page.goto('/');

    // Check section title
    await expect(page.getByRole('heading', { name: 'Popular Games' })).toBeVisible();

    // Check view all link
    await expect(page.getByRole('link', { name: 'View All' })).toBeVisible();
  });

  test('should have recent reviews section', async ({ page }) => {
    await page.goto('/');

    // Check section title
    await expect(page.getByRole('heading', { name: 'Recent Reviews' })).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    await page.goto('/');

    // Check footer content
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByText('©', { exact: false })).toBeVisible();

    // Check footer links
    await expect(page.getByRole('link', { name: 'All Games' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About Us' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  test('should navigate to games page', async ({ page }) => {
    await page.goto('/');

    // Click games link
    await page.getByRole('link', { name: 'Games' }).click();

    // Verify navigation
    await expect(page).toHaveURL(/.*games/);
    await expect(page.getByRole('heading', { name: 'Browse Games' })).toBeVisible();
  });

  test('should search for games', async ({ page }) => {
    await page.goto('/');

    // Find search input
    const searchInput = page.getByPlaceholder('Search for games');
    await searchInput.fill('puzzle');

    // Submit search
    await searchInput.press('Enter');

    // Verify search results page
    await expect(page).toHaveURL(/.*search=puzzle/);
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile menu button
    await expect(page.getByLabel('Open menu')).toBeVisible();

    // Check hero section is visible
    await expect(page.getByRole('heading', { name: /Play Amazing/ })).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check navigation is visible
    await expect(page.getByRole('link', { name: 'Games' })).toBeVisible();

    // Check grid layout
    const gameCards = page.locator('[class*="grid"]');
    await expect(gameCards).toBeVisible();
  });
});
