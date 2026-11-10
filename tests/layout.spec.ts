import { expect, test, type Locator, type Page } from '@playwright/test';
import type { Theme } from '../src/theme/preference';

/** The target viewports from the spec. 640×360 is 1280×720 at 200% zoom. */
const targetViewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
  { width: 568, height: 320 },
  { width: 640, height: 360 },
];

const paths = ['/', '/es/'];

// The layout is measured at rest: during the reveal, the staggered buttons sit at different heights.
test.use({ reducedMotion: 'reduce' });
const themes: Theme[] = ['light', 'dark'];

async function scrollDimensions(page: Page) {
  return page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
  }));
}

/** The buttons, in order, by their position on the page. */
async function buttonBoxes(page: Page) {
  const links = page.getByRole('list').getByRole('link');
  await expect(links).toHaveCount(4);
  return Promise.all((await links.all()).map(async (link) => (await link.boundingBox())!));
}

/** The box of an element's text, not of the element. */
function textBox(locator: Locator) {
  return locator.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect().toJSON() as DOMRect;
  });
}

/** The corner controls must never cover the name. The short greeting may sit beside them. */
async function expectControlsClearOfName(page: Page) {
  const name = await textBox(page.getByText('Leonel Gauna.'));
  const controls = [
    page.getByRole('link', { name: /^(Ver en español|View in English)$/ }),
    page.getByRole('button'),
  ];
  for (const control of controls) {
    const box = (await control.boundingBox())!;
    const overlaps =
      box.x < name.right &&
      box.x + box.width > name.left &&
      box.y < name.bottom &&
      box.y + box.height > name.top;
    expect(overlaps).toBe(false);
  }
}

function rowCount(boxes: { y: number }[]) {
  return new Set(boxes.map((box) => Math.round(box.y))).size;
}

function columnCount(boxes: { x: number }[]) {
  return new Set(boxes.map((box) => Math.round(box.x))).size;
}

for (const viewport of targetViewports) {
  test.describe(`at ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });

    for (const path of paths) {
      for (const theme of themes) {
        test(`${path} in the ${theme} Theme does not scroll`, async ({ page }) => {
          await page.addInitScript((theme) => localStorage.setItem('theme', theme), theme);
          await page.goto(path);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

          const size = await scrollDimensions(page);
          expect(size.scrollHeight).toBeLessThanOrEqual(size.innerHeight);
          expect(size.scrollWidth).toBeLessThanOrEqual(size.innerWidth);
        });
      }

      test(`${path} keeps the corner controls clear of the name`, async ({ page }) => {
        await page.goto(path);
        await expectControlsClearOfName(page);
      });

      test(`${path} keeps every button label on one line inside its button`, async ({ page }) => {
        await page.goto(path);
        for (const link of await page.getByRole('list').getByRole('link').all()) {
          const text = await textBox(link);
          const box = (await link.boundingBox())!;
          const lineHeight = parseFloat(
            await link.evaluate((el) => getComputedStyle(el).lineHeight),
          );
          expect(text.height).toBeLessThan(lineHeight * 1.5);
          expect(text.left).toBeGreaterThanOrEqual(box.x);
          expect(text.right).toBeLessThanOrEqual(box.x + box.width);
        }
      });
    }
  });
}

test.describe('the buttons', () => {
  // Short screens wide enough for the row keep it.
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 844, height: 390 },
    { width: 640, height: 360 },
  ]) {
    test.describe(`on a ${viewport.width}×${viewport.height} screen`, () => {
      test.use({ viewport });

      test('sit in one row', async ({ page }) => {
        await page.goto('/es/');
        expect(rowCount(await buttonBoxes(page))).toBe(1);
      });
    });
  }

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 360, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test.describe(`on a ${viewport.width}×${viewport.height} phone`, () => {
      test.use({ viewport });

      test('stack in one column of equal widths', async ({ page }) => {
        await page.goto('/es/');
        const boxes = await buttonBoxes(page);
        expect(rowCount(boxes)).toBe(4);
        expect(columnCount(boxes)).toBe(1);
        expect(new Set(boxes.map((box) => Math.round(box.width))).size).toBe(1);
      });
    });
  }

  test.describe('on a short 568×320 screen', () => {
    test.use({ viewport: { width: 568, height: 320 } });

    test('form a 2×2 grid', async ({ page }) => {
      await page.goto('/es/');
      const boxes = await buttonBoxes(page);
      expect(rowCount(boxes)).toBe(2);
      expect(columnCount(boxes)).toBe(2);
    });
  });
});

test.describe('beyond the target viewports', () => {
  // 1280×720 at 400% zoom: the page may scroll, but must not clip or overlap content.
  test.use({ viewport: { width: 320, height: 180 } });

  for (const path of paths) {
    test(`${path} scrolls so every button can be reached`, async ({ page }) => {
      await page.goto(path);
      const size = await scrollDimensions(page);
      expect(size.scrollWidth).toBeLessThanOrEqual(size.innerWidth);

      for (const box of await buttonBoxes(page)) {
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(size.scrollHeight);
      }
      await expectControlsClearOfName(page);
    });
  }
});

test.describe('below the minimum width', () => {
  // A folded Galaxy Fold: narrower than the 20rem the page needs.
  test.use({ viewport: { width: 280, height: 653 } });

  for (const path of paths) {
    test(`${path} keeps its 20rem width and scrolls sideways instead of squeezing`, async ({
      page,
    }) => {
      await page.goto(path);
      const size = await scrollDimensions(page);
      expect(size.scrollWidth).toBe(320);
      expect((await textBox(page.getByText('Leonel Gauna.'))).height).toBeLessThan(60);
      await expectControlsClearOfName(page);
    });
  }
});
