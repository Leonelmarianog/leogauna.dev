import { expect, test, type Page } from '@playwright/test';
import type { Theme } from '../src/theme/preference';

/** The text color of each Theme, from the spec. */
const textColor = {
  light: 'rgb(28, 20, 8)',
  dark: 'rgb(255, 188, 23)',
};

async function expectTheme(page: Page, theme: Theme) {
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(page.locator('body')).toHaveCSS('color', textColor[theme]);
}

test.describe('Theme with no Theme preference', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test.describe(`and colorScheme ${colorScheme}`, () => {
      test.use({ colorScheme });

      test(`is ${colorScheme}`, async ({ page }) => {
        await page.goto('/');
        await expectTheme(page, colorScheme);
      });
    });
  }
});

test.describe('Theme with a dark Theme preference', () => {
  test('is dark before the body is parsed, so the first paint is dark', async ({ page }) => {
    // Simulate a returning visitor who chose dark, with a light operating system.
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
      // Record data-theme the moment <body> is inserted, before anything can paint.
      new MutationObserver((_, observer) => {
        if (!document.body) return;
        (window as any).themeAtBody = document.documentElement.dataset.theme ?? null;
        observer.disconnect();
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto('/');
    expect(await page.evaluate(() => (window as any).themeAtBody)).toBe('dark');
    await expectTheme(page, 'dark');
  });
});

test.describe('Theme without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const colorScheme of ['light', 'dark'] as const) {
    test.describe(`and colorScheme ${colorScheme}`, () => {
      test.use({ colorScheme });

      test(`is ${colorScheme}`, async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('body')).toHaveCSS('color', textColor[colorScheme]);
        await expect(page.getByRole('button')).toBeVisible();
      });
    });
  }
});

test.describe('theme toggle', () => {
  const cases = [
    { path: '/', toDark: 'Switch to dark theme', toLight: 'Switch to light theme' },
    { path: '/es/', toDark: 'Cambiar a tema oscuro', toLight: 'Cambiar a tema claro' },
  ];

  for (const { path, toDark, toLight } of cases) {
    test(`on ${path} switches the Theme and names the next action`, async ({ page }) => {
      await page.goto(path);
      await expectTheme(page, 'light');

      await page.getByRole('button', { name: toDark, exact: true }).click();
      await expectTheme(page, 'dark');

      await page.getByRole('button', { name: toLight, exact: true }).click();
      await expectTheme(page, 'light');
      await expect(page.getByRole('button', { name: toDark, exact: true })).toBeVisible();
    });
  }

  test('sits in the top corner next to the language toggle', async ({ page }) => {
    await page.goto('/');
    const box = (await page.getByRole('button', { name: 'Switch to dark theme' }).boundingBox())!;
    const link = (await page.getByRole('link', { name: 'Ver en español' }).boundingBox())!;
    expect(box.y).toBe(link.y);
    expect(Math.abs(box.x - link.x)).toBeLessThan(link.width * 2);
  });
});

test.describe('Theme preference', () => {
  test('survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
    await expectTheme(page, 'dark');

    await page.reload();
    await expectTheme(page, 'dark');
    await expect(
      page.getByRole('button', { name: 'Switch to light theme', exact: true }),
    ).toBeVisible();
  });

  test('survives a Locale switch', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
    await page.getByRole('link', { name: 'Ver en español', exact: true }).click();
    await expect(page).toHaveURL('/es/');

    await expectTheme(page, 'dark');
    await expect(
      page.getByRole('button', { name: 'Cambiar a tema claro', exact: true }),
    ).toBeVisible();
  });

  test.describe('with a dark operating system', () => {
    test.use({ colorScheme: 'dark' });

    test('of light wins over the operating system', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
      await page.reload();
      await expectTheme(page, 'light');
    });
  });
});
