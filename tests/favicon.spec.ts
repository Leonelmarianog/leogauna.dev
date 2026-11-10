import { expect, test } from '@playwright/test';

const favicons = [
  { type: 'image/svg+xml', href: '/favicon.svg', contentType: 'image/svg+xml' },
  { type: null, href: '/favicon.ico', contentType: 'image/x-icon' },
];

for (const path of ['/', '/es/']) {
  test(`${path} links the SVG favicon and the ICO fallback`, async ({ page }) => {
    await page.goto(path);
    const links = page.locator('link[rel="icon"]');
    await expect(links).toHaveCount(favicons.length);
    for (const [index, favicon] of favicons.entries()) {
      await expect(links.nth(index)).toHaveAttribute('href', favicon.href);
      if (favicon.type) await expect(links.nth(index)).toHaveAttribute('type', favicon.type);
    }
  });
}

for (const favicon of favicons) {
  test(`${favicon.href} is served as ${favicon.contentType}`, async ({ request }) => {
    const response = await request.get(favicon.href);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(favicon.contentType);
  });
}
