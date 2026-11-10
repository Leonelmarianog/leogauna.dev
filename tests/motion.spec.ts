import { expect, test, type Locator, type Page } from '@playwright/test';

/** The elements that reveal on page load, in the order they appear. */
function revealedElements(page: Page) {
  return {
    greeting: page.getByText('Hi! I’m', { exact: true }),
    name: page.getByText('Leonel Gauna.', { exact: true }),
    summary: page.getByRole('paragraph'),
    buttons: page.getByRole('list').getByRole('link'),
  };
}

async function allRevealedElements(page: Page) {
  const { greeting, name, summary, buttons } = revealedElements(page);
  await expect(buttons).toHaveCount(4);
  return [greeting, name, summary, ...(await buttons.all())];
}

/** The timing of the animations that move or fade this element, or an ancestor or descendant of it. */
function revealTimings(locator: Locator) {
  return locator.evaluate((el) =>
    document
      .getAnimations()
      .filter((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        return target && (target.contains(el) || el.contains(target));
      })
      .map((animation) => {
        const effect = animation.effect as KeyframeEffect;
        const { delay, duration } = effect.getTiming();
        // A CSS animation applies its timing function to each keyframe, not to the whole effect.
        const [{ easing }] = effect.getKeyframes();
        return { delay: Number(delay), duration: Number(duration), easing };
      }),
  );
}

/** Holds every animation on the page at its first frame. */
async function holdAnimationsAtStart(page: Page) {
  await page.evaluate(() =>
    document.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = 0;
    }),
  );
}

/** Waits until every animation on the page, including the reveals, has finished. */
async function waitForAnimations(page: Page) {
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
}

/** The element's opacity, faded by the element and every ancestor. */
function effectiveOpacity(locator: Locator) {
  return locator.evaluate((el) => {
    let opacity = 1;
    for (let node: Element | null = el; node; node = node.parentElement) {
      opacity *= Number(getComputedStyle(node).opacity);
    }
    return opacity;
  });
}

/**
 * Every revealed element ends fully visible: not clipped, not off screen, and not faded by the
 * element or any ancestor. Retries, so it also waits for a reveal that is still playing.
 */
async function expectAllFullyVisible(page: Page) {
  for (const element of await allRevealedElements(page)) {
    await expect(element).toBeInViewport({ ratio: 1 });
    await expect.poll(() => effectiveOpacity(element)).toBe(1);
  }
}

test.describe('the reveal', () => {
  test('plays on page load, staggered from the greeting to the last button', async ({ page }) => {
    await page.goto('/');
    const delays = [];
    for (const element of await allRevealedElements(page)) {
      const [timing] = await revealTimings(element);
      expect(timing).toMatchObject({ duration: 900, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' });
      delays.push(timing.delay);
    }
    expect(delays).toEqual([...delays].sort((a, b) => a - b));
    expect(new Set(delays).size).toBe(delays.length);
  });

  test('starts with the greeting and name behind their masks and the rest faded out', async ({
    page,
  }) => {
    await page.goto('/');
    await holdAnimationsAtStart(page);
    const { greeting, name, summary, buttons } = revealedElements(page);
    await expect(greeting).not.toBeInViewport();
    await expect(name).not.toBeInViewport();
    for (const element of [summary, ...(await buttons.all())]) {
      expect(await effectiveOpacity(element)).toBe(0);
    }
  });

  test('ends with every element fully visible', async ({ page }) => {
    await page.goto('/');
    await waitForAnimations(page);
    await expectAllFullyVisible(page);
  });

  test('plays again after a Locale switch', async ({ page }) => {
    await page.goto('/');
    await waitForAnimations(page);
    await page.getByRole('link', { name: 'Ver en español', exact: true }).click();
    await expect(page).toHaveURL('/es/');
    expect(await revealTimings(page.getByText('Leonel Gauna.', { exact: true }))).toHaveLength(1);
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows every element fully visible immediately, with no reveal', async ({ page }) => {
    await page.goto('/');
    for (const element of await allRevealedElements(page)) {
      expect(await revealTimings(element)).toEqual([]);
    }
    await expectAllFullyVisible(page);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('ends with every element fully visible', async ({ page }) => {
    // The reveal is CSS only, so it still plays: this waits for it to end.
    await page.goto('/');
    await expectAllFullyVisible(page);
  });
});

test.describe('on hover', () => {
  /** The light Theme's colors, from the spec. */
  const textColor = 'rgb(28, 20, 8)';
  const filledTextColor = 'rgb(255, 188, 23)';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAnimations(page);
  });

  test('the CV button lifts with a light shadow', async ({ page }) => {
    const cv = page.getByRole('link', { name: 'Download CV ↓', exact: true });
    await cv.hover();
    await expect(cv).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -3, -3)');
    await expect(cv).toHaveCSS('box-shadow', 'rgb(255, 243, 204) 3px 3px 0px 0px');
  });

  for (const name of ['LinkedIn ↗', 'GitHub ↗', 'Email']) {
    test(`the ${name} button fills with the text color`, async ({ page }) => {
      const button = page.getByRole('link', { name, exact: true });
      await button.hover();
      await expect(button).toHaveCSS('background-color', textColor);
      await expect(button).toHaveCSS('color', filledTextColor);
    });
  }

  const cornerControls = [
    { control: 'language toggle', role: 'link', name: 'Ver en español' },
    { control: 'theme toggle', role: 'button', name: 'Switch to dark theme' },
  ] as const;

  for (const { control, role, name } of cornerControls) {
    test(`the ${control} fills with the text color`, async ({ page }) => {
      const locator = page.getByRole(role, { name, exact: true });
      await locator.hover();
      await expect(locator).toHaveCSS('background-color', textColor);
      await expect(locator).toHaveCSS('color', filledTextColor);
    });
  }
});
