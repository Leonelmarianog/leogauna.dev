import { expect, test } from '@playwright/test';
import { site } from '../src/data/site';

test.describe('English home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the greeting, name and summary', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText('Hi! I’m');
    await expect(heading).toContainText('Leonel Gauna.');
    await expect(
      page.getByText(
        'I’m a full-stack developer based in Argentina with 5+ years of experience in tech. I like building things, making them work, and figuring out why they don’t. I’m very meticulous and organized, with a strong focus on quality.',
      ),
    ).toBeVisible();
  });

  test('shows the four buttons', async ({ page }) => {
    for (const name of ['Download CV ↓', 'LinkedIn ↗', 'GitHub ↗', 'Email']) {
      await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
    }
  });

  test('has the English head tags and no OG image', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Leonel Gauna · Full-Stack Developer');
    const description = 'Leonel Gauna, full-stack developer with 5+ years of experience.';
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Leonel Gauna · Full-Stack Developer',
    );
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      description,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
  });

  test('links point to the site data targets', async ({ page }) => {
    const cv = page.getByRole('link', { name: 'Download CV ↓' });
    await expect(cv).toHaveAttribute('href', site.cvUrl);
    await expect(cv).toHaveAttribute('download', site.cvFileName);

    const github = page.getByRole('link', { name: 'GitHub ↗' });
    await expect(github).toHaveAttribute('href', site.githubUrl);
    expect(site.githubUrl).toBe('https://github.com/Leonelmarianog');

    const linkedin = page.getByRole('link', { name: 'LinkedIn ↗' });
    await expect(linkedin).toHaveAttribute('href', site.linkedinUrl);

    for (const external of [github, linkedin]) {
      await expect(external).toHaveAttribute('target', '_blank');
      await expect(external).toHaveAttribute('rel', /\bnoopener\b/);
      await expect(external).toHaveAttribute('rel', /\bnoreferrer\b/);
    }

    await expect(page.getByRole('link', { name: 'Email', exact: true })).toHaveAttribute(
      'href',
      `mailto:${site.email}`,
    );
  });

  test('downloads the CV as a PDF named Leonel-Gauna-CV.pdf', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download CV ↓' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Leonel-Gauna-CV.pdf');

    const response = await page.request.get(site.cvUrl);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  test('uses the light Theme colors', async ({ page }) => {
    const styles = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const heading = getComputedStyle(document.querySelector('h1')!);
      return { background: body.backgroundImage, color: heading.color };
    });
    expect(styles.background).toContain('linear-gradient');
    expect(styles.background).toContain('rgb(255, 188, 23)');
    expect(styles.background).toContain('rgb(255, 138, 31)');
    expect(styles.color).toBe('rgb(28, 20, 8)');
  });

  test('loads Space Grotesk from the site itself', async ({ page, baseURL }) => {
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts]
        .filter((font) => font.status === 'loaded')
        .map((font) => font.family);
    });
    expect(loaded.some((family) => family.startsWith('Space Grotesk'))).toBe(true);

    const fontFiles = await page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((url) => /\.(woff2?|ttf|otf)(\?|$)/.test(url)),
    );
    expect(fontFiles.length).toBeGreaterThan(0);
    for (const url of fontFiles) expect(new URL(url).origin).toBe(new URL(baseURL!).origin);
  });

  test('makes no requests to third parties', async ({ page, baseURL }) => {
    const origins = new Set<string>();
    page.on('request', (request) => origins.add(new URL(request.url()).origin));
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    expect([...origins]).toEqual([new URL(baseURL!).origin]);
  });

  test('centers the content on the screen', async ({ page }) => {
    const viewport = page.viewportSize()!;
    const box = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
    const centerX = box.x + box.width / 2;
    expect(Math.abs(centerX - viewport.width / 2)).toBeLessThan(viewport.width * 0.1);
    expect(box.y).toBeGreaterThan(0);
  });
});
