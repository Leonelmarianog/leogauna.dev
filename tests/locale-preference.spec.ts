import { expect, test, type Page } from '@playwright/test';

async function chooseLocale(page: Page, name: 'Ver en español' | 'View in English') {
  await page.getByRole('link', { name, exact: true }).click();
}

test.describe('Locale preference', () => {
  test('a fresh visit to / does not redirect', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test.describe('with browser locale es-AR', () => {
    test.use({ locale: 'es-AR' });

    test('a fresh visit to / does not redirect', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL('/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });
  });

  test('after choosing ES, a later visit to / lands on /es/', async ({ page }) => {
    await page.goto('/');
    await chooseLocale(page, 'Ver en español');
    await expect(page).toHaveURL('/es/');

    await page.goto('/');
    await expect(page).toHaveURL('/es/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('after choosing EN on /es/, a later visit to / stays on /', async ({ page }) => {
    await page.goto('/');
    await chooseLocale(page, 'Ver en español');
    await expect(page).toHaveURL('/es/');
    await chooseLocale(page, 'View in English');
    await expect(page).toHaveURL('/');

    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('a visit to /es/ with Locale preference en stays on /es/', async ({ page }) => {
    // Simulate a returning visitor who chose English.
    await page.addInitScript(() => localStorage.setItem('locale', 'en'));
    await page.goto('/es/');
    await expect(page).toHaveURL('/es/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('the back button after a redirect does not bounce back to /', async ({ page }) => {
    await page.goto('/');
    await chooseLocale(page, 'Ver en español');
    await expect(page).toHaveURL('/es/');
    await page.goto('/favicon.svg');

    await page.goto('/');
    await expect(page).toHaveURL('/es/');
    await page.goBack();
    await expect(page).toHaveURL('/favicon.svg');
  });

  test.describe('when storage is blocked', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new DOMException('Storage is blocked', 'SecurityError');
          },
        });
      });
    });

    test('the language toggle still switches Locale in both directions', async ({ page }) => {
      const errors: Error[] = [];
      page.on('pageerror', (error) => errors.push(error));

      await page.goto('/');
      await chooseLocale(page, 'Ver en español');
      await expect(page).toHaveURL('/es/');
      await chooseLocale(page, 'View in English');
      await expect(page).toHaveURL('/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      expect(errors).toEqual([]);
    });
  });
});
