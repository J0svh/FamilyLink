import { test, expect } from '@playwright/test';

test.describe('Critical Flow: Register → Create Circle → Share Location', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123';
  const testUsername = 'TestUser';

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[type="text"]', testUsername);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=FamilyLink')).toBeVisible();
  });

  test('should login with registered credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a circle', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Create circle
    await page.click('text=Crear círculo');
    await page.fill('input[placeholder="Nombre del círculo"]', 'Mi Familia');
    await page.click('button:has-text("Crear")');

    // Circle should appear in list
    await expect(page.locator('text=Mi Familia')).toBeVisible();
  });

  test('should navigate to map view', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Click on circle to go to map
    await page.click('text=Mi Familia');

    // Map should load
    await expect(page.locator('.maplibregl-map, [class*="map"]')).toBeVisible({ timeout: 10000 });
  });

  test('should share location on map', async ({ page, context }) => {
    // Mock geolocation
    await context.grantPermissions(['geolocation']);
    await page.goto('/login');

    // Set geolocation before navigating
    await context.setGeolocation({ latitude: 40.4168, longitude: -3.7038 });

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    await page.click('text=Mi Familia');

    // Wait for map to load
    await page.waitForTimeout(2000);

    // Click share location button
    const shareButton = page.locator('button:has-text("Compartir ubicación")');
    if (await shareButton.isVisible()) {
      await shareButton.click();
      // Should show success feedback
      await expect(page.locator('text=Ubicación compartida')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Auth Flow: Error Handling', () => {
  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid email or password, text=Email o contraseña incorrectos')).toBeVisible({ timeout: 5000 });
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login after logout', async ({ page }) => {
    // Register and login
    const email = `logout-test-${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[type="text"]', 'LogoutUser');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('text=Cerrar sesión');
    await expect(page).toHaveURL('/login');
  });
});
