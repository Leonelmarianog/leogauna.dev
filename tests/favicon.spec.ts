import { expect, test } from '@playwright/test';

const paths = ['/', '/es/'];

/**
 * The favicons in the order the layout links them. `linkType` is the `<link>`'s `type` attribute
 * (the ICO has none); `servedAs` is the Content-Type the server answers with.
 */
const favicons = [
  { href: '/favicon.svg', linkType: 'image/svg+xml', servedAs: 'image/svg+xml' },
  { href: '/favicon.ico', linkType: null, servedAs: 'image/x-icon' },
];

for (const path of paths) {
  test(`${path} links the SVG favicon and the ICO fallback`, async ({ page }) => {
    await page.goto(path);
    const links = page.locator('link[rel="icon"]');
    await expect(links).toHaveCount(favicons.length);
    for (const [index, favicon] of favicons.entries()) {
      await expect(links.nth(index)).toHaveAttribute('href', favicon.href);
      if (favicon.linkType) await expect(links.nth(index)).toHaveAttribute('type', favicon.linkType);
    }
  });
}

for (const favicon of favicons) {
  test(`${favicon.href} is served as ${favicon.servedAs}`, async ({ request }) => {
    const response = await request.get(favicon.href);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(favicon.servedAs);
  });
}
