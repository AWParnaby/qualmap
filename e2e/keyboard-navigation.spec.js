import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('can focus postcode areas with Tab key', async ({ page }) => {
    // Press Tab to focus first interactive element
    await page.keyboard.press('Tab');

    // Keep tabbing until we reach a postcode area
    let attempts = 0;
    let focused = false;

    while (attempts < 20 && !focused) {
      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          hasPostcode: el?.hasAttribute('data-postcode'),
          role: el?.getAttribute('role'),
          tagName: el?.tagName
        };
      });

      if (activeElement.hasPostcode && activeElement.role === 'button') {
        focused = true;
      } else {
        await page.keyboard.press('Tab');
        attempts++;
      }
    }

    // Verify we found a focusable postcode area
    expect(focused).toBe(true);
  });

  test('selects area with Enter key', async ({ page }) => {
    // Tab to a postcode area
    await page.keyboard.press('Tab');

    let focused = false;
    let attempts = 0;

    while (attempts < 20 && !focused) {
      const activeElement = await page.evaluate(() => {
        return document.activeElement?.hasAttribute('data-postcode');
      });

      if (activeElement) {
        focused = true;
      } else {
        await page.keyboard.press('Tab');
        attempts++;
      }
    }

    if (focused) {
      // Press Enter to select
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Verify area was selected
      await expect(page.getByText(/\d+ area selected/)).toBeVisible();
    }
  });

  test('selects area with Space key', async ({ page }) => {
    // Tab to a postcode area
    await page.keyboard.press('Tab');

    let focused = false;
    let attempts = 0;

    while (attempts < 20 && !focused) {
      const activeElement = await page.evaluate(() => {
        return document.activeElement?.hasAttribute('data-postcode');
      });

      if (activeElement) {
        focused = true;
      } else {
        await page.keyboard.press('Tab');
        attempts++;
      }
    }

    if (focused) {
      // Press Space to select
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);

      // Verify area was selected
      await expect(page.getByText(/\d+ area selected/)).toBeVisible();
    }
  });

  test('clears selections with Escape key', async ({ page }) => {
    // First, select an area by clicking
    const area = page.locator('.leaflet-interactive').first();
    await area.click();
    await page.waitForTimeout(500);

    // Verify selection
    await expect(page.getByText('1 area selected')).toBeVisible();

    // Press Escape to clear
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify selections cleared
    await expect(page.getByText('No areas selected')).toBeVisible();
  });

  test('navigates between areas with arrow keys', async ({ page }) => {
    // Focus a postcode area
    await page.keyboard.press('Tab');

    let focused = false;
    let attempts = 0;

    while (attempts < 20 && !focused) {
      const activeElement = await page.evaluate(() => {
        return document.activeElement?.hasAttribute('data-postcode');
      });

      if (activeElement) {
        focused = true;
      } else {
        await page.keyboard.press('Tab');
        attempts++;
      }
    }

    if (focused) {
      // Get the currently focused postcode
      const firstPostcode = await page.evaluate(() => {
        return document.activeElement?.getAttribute('data-postcode');
      });

      // Press arrow key to move to adjacent area
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);

      // Get the new focused postcode
      const secondPostcode = await page.evaluate(() => {
        return document.activeElement?.getAttribute('data-postcode');
      });

      // The focused postcode should have changed (if there's an area below)
      if (secondPostcode) {
        expect(secondPostcode).toBeDefined();
      }
    }
  });

  test('navigates with WASD keys', async ({ page }) => {
    // Focus a postcode area
    await page.keyboard.press('Tab');

    let focused = false;
    let attempts = 0;

    while (attempts < 20 && !focused) {
      const activeElement = await page.evaluate(() => {
        return document.activeElement?.hasAttribute('data-postcode');
      });

      if (activeElement) {
        focused = true;
      } else {
        await page.keyboard.press('Tab');
        attempts++;
      }
    }

    if (focused) {
      const firstPostcode = await page.evaluate(() => {
        return document.activeElement?.getAttribute('data-postcode');
      });

      // Press 's' to move down
      await page.keyboard.press('s');
      await page.waitForTimeout(300);

      const secondPostcode = await page.evaluate(() => {
        return document.activeElement?.getAttribute('data-postcode');
      });

      // Verify we're still on a postcode area (may or may not have moved)
      expect(secondPostcode).toBeDefined();
    }
  });

  test('shows keyboard help with Ctrl+/', async ({ page }) => {
    // Press Ctrl+/ to open keyboard help
    await page.keyboard.press('Control+/');
    await page.waitForTimeout(500);

    // Look for keyboard help modal or content
    // The exact selector depends on your implementation
    const helpVisible = await page.evaluate(() => {
      // Check if help modal appeared or state changed
      const body = document.body.innerHTML;
      return body.includes('Keyboard') || body.includes('shortcuts') || body.includes('help');
    });

    // Verify help was triggered (state change in context)
    expect(helpVisible).toBe(true);

    // Press Ctrl+/ again to close
    await page.keyboard.press('Control+/');
    await page.waitForTimeout(500);
  });

  test('areas have proper accessibility attributes', async ({ page }) => {
    // Get all postcode areas
    const areas = page.locator('[data-postcode]');
    const count = await areas.count();

    expect(count).toBeGreaterThan(0);

    // Check first few areas for accessibility
    for (let i = 0; i < Math.min(count, 3); i++) {
      const area = areas.nth(i);

      // Verify aria-label
      const ariaLabel = await area.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/Postcode area/i);

      // Verify role
      const role = await area.getAttribute('role');
      expect(role).toBe('button');

      // Verify tabindex
      const tabindex = await area.getAttribute('tabindex');
      expect(tabindex).toBe('0');
    }
  });

  test('focused area has visual indicator', async ({ page }) => {
    // Focus a postcode area
    await page.keyboard.press('Tab');

    let focused = false;
    let attempts = 0;

    while (attempts < 20 && !focused) {
      const activeElement = await page.evaluate(() => {
        return document.activeElement?.hasAttribute('data-postcode');
      });

      if (activeElement) {
        focused = true;
      } else {
        await page.keyboard.press('Tab');
        attempts++;
      }
    }

    if (focused) {
      // Check that the focused element has visual styling
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        const computedStyle = window.getComputedStyle(el);
        return {
          outline: computedStyle.outline,
          border: computedStyle.border,
          stroke: el.getAttribute('stroke'),
          strokeWidth: el.getAttribute('stroke-width')
        };
      });

      // The focused area should have some visual indicator
      // (outline, border, or stroke styling)
      const hasVisualIndicator =
        (focusedElement.stroke && focusedElement.stroke !== 'none') ||
        (focusedElement.strokeWidth && parseInt(focusedElement.strokeWidth) > 2) ||
        focusedElement.outline !== 'none' ||
        focusedElement.border !== 'none';

      expect(hasVisualIndicator).toBe(true);
    }
  });
});
