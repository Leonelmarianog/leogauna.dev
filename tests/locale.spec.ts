import { expect, test } from '@playwright/test';

/**
 * Copy unique to each Locale (the spec's Further Notes), plus short words that
 * would show a partial leak. The name, LinkedIn and GitHub are the same in both.
 */
const copy = {
  en: [
    'Hi! I’m',
    'I’m a full-stack developer based in Argentina with 5+ years of experience in tech. I like building things, making them work, and figuring out why when they don’t. I’m very meticulous and organized, with a strong focus on quality.',
    'Download CV ↓',
    'Email',
    'developer',
    'experience',
  ],
  es: [
    '¡Hola! Soy',
    'Soy desarrollador full-stack en Argentina, con más de 5 años de experiencia en tecnología. Me gusta construir cosas, hacer que funcionen y descubrir por qué no lo hacen. Soy muy meticuloso y organizado, con un fuerte enfoque en la calidad.',
    'Descargar CV ↓',
    'Correo',
    'desarrollador',
    'experiencia',
  ],
};

for (const [path, other] of [
  ['/', 'es'],
  ['/es/', 'en'],
] as const) {
  test(`${path} has no copy from the ${other} Locale`, async ({ page }) => {
    await page.goto(path);
    const text = await page.locator('main').innerText();
    expect(text).toContain('Leonel Gauna.');
    for (const line of copy[other]) expect(text).not.toContain(line);
  });
}

test.describe('Spanish home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/es/');
  });

  test('shows the Spanish greeting, name, summary and buttons', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText('¡Hola! Soy');
    await expect(heading).toContainText('Leonel Gauna.');
    await expect(
      page.getByText(
        'Soy desarrollador full-stack en Argentina, con más de 5 años de experiencia en tecnología. Me gusta construir cosas, hacer que funcionen y descubrir por qué no lo hacen. Soy muy meticuloso y organizado, con un fuerte enfoque en la calidad.',
      ),
    ).toBeVisible();
    for (const name of ['Descargar CV ↓', 'LinkedIn ↗', 'GitHub ↗', 'Correo']) {
      await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
    }
  });

  test('has the Spanish head tags', async ({ page }) => {
    const title = 'Leonel Gauna · Desarrollador Full-Stack';
    const description =
      'Leonel Gauna, desarrollador full-stack con más de 5 años de experiencia.';
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      description,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://leogauna.dev/es/',
    );
  });
});

for (const path of ['/', '/es/']) {
  test(`${path} lists both Locales and x-default as hreflang alternates`, async ({ page }) => {
    await page.goto(path);
    const alternates = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((links) =>
        links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]),
      );
    expect(alternates.sort()).toEqual([
      ['en', 'https://leogauna.dev/'],
      ['es', 'https://leogauna.dev/es/'],
      ['x-default', 'https://leogauna.dev/'],
    ]);
  });
}

test.describe('language toggle', () => {
  const cases = [
    { from: '/', to: '/es/', label: 'ES', name: 'Ver en español', lang: 'es' },
    { from: '/es/', to: '/', label: 'EN', name: 'View in English', lang: 'en' },
  ];

  for (const { from, to, label, name, lang } of cases) {
    test(`on ${from} names the other Locale in that Locale`, async ({ page }) => {
      await page.goto(from);
      const link = page.getByRole('link', { name, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveText(label);
      await expect(link).toHaveAttribute('href', to);
      await expect(link).toHaveAttribute('lang', lang);
      await expect(link).toHaveAttribute('hreflang', lang);
    });

    test(`on ${from} sits in the top corner`, async ({ page }) => {
      await page.goto(from);
      const box = (await page.getByRole('link', { name, exact: true }).boundingBox())!;
      const viewport = page.viewportSize()!;
      expect(box.y).toBeLessThan(viewport.height * 0.15);
      expect(box.x + box.width).toBeGreaterThan(viewport.width * 0.85);
    });

    test(`on ${from} navigates to ${to}`, async ({ page }) => {
      await page.goto(from);
      await page.getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(to);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });
  }

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    for (const { from, to, name, lang } of cases) {
      test(`on ${from} still navigates to ${to}`, async ({ page }) => {
        await page.goto(from);
        await page.getByRole('link', { name, exact: true }).click();
        await expect(page).toHaveURL(to);
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
      });
    }
  });
});
