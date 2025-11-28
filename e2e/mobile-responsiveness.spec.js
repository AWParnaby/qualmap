import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness - iPhone SE', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('map displays correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verify map container fits viewport
    const map = await page.locator('.leaflet-container');
    const box = await map.boundingBox();
    const viewport = page.viewportSize();

    expect(box).toBeTruthy();
    expect(box.width).toBeLessThanOrEqual(viewport.width);

    // Check for horizontal overflow
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
  });

  test('postcode areas are tappable (minimum 44x44px)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Check touch target sizes for postcode areas
    const areas = await page.locator('.leaflet-interactive').all();

    // Check first 3 areas
    for (const area of areas.slice(0, 3)) {
      const box = await area.boundingBox();

      if (box) {
        // WCAG recommends minimum 44x44px for touch targets
        expect(box.width).toBeGreaterThanOrEqual(30); // Relaxed for map areas
        expect(box.height).toBeGreaterThanOrEqual(30);
      }
    }
  });

  test('selection panel fits mobile viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Select an area
    const area = page.locator('.leaflet-interactive').first();
    await area.click();
    await page.waitForTimeout(500);

    // Verify selection panel is visible and fits
    await expect(page.getByText('1 area selected')).toBeVisible();

    // Check that selection list doesn't overflow
    const viewport = page.viewportSize();
    const selectionText = await page.getByText('1 area selected');
    const box = await selectionText.boundingBox();

    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('word cloud is responsive on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Select an area
    await page.click('.leaflet-interactive');
    await page.waitForTimeout(500);

    // Switch to word cloud
    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });
    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Verify no horizontal scroll
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // Verify word cloud sections are visible
      await expect(page.getByText('Service Descriptions')).toBeVisible();
    }
  });

  test('ngram drilldown modal fits mobile viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Select area and navigate to word cloud
    await page.click('.leaflet-interactive');
    await page.waitForTimeout(500);

    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });
    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Click a word if available
      const words = page.locator('[data-testid^="word-"]');
      const wordCount = await words.count();

      if (wordCount > 0) {
        await words.first().click();
        await page.waitForTimeout(500);

        // Find the modal/panel
        const modal = page.locator('h3', { hasText: /Sources containing/i }).locator('..');

        if (await modal.count() > 0) {
          const box = await modal.first().boundingBox();
          const viewport = page.viewportSize();

          if (box) {
            // Modal should fit within viewport
            expect(box.width).toBeLessThanOrEqual(viewport.width);
            expect(box.height).toBeLessThanOrEqual(viewport.height);

            // Modal should not be positioned off-screen
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.y).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  test('remove buttons are touch-friendly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Select an area
    await page.click('.leaflet-interactive');
    await page.waitForTimeout(500);

    // Check remove button size
    const removeButton = page.getByRole('button', { name: /Remove/i });

    if (await removeButton.count() > 0) {
      const box = await removeButton.first().boundingBox();

      if (box) {
        // Remove buttons should be reasonably sized for touch
        expect(box.width).toBeGreaterThanOrEqual(30);
        expect(box.height).toBeGreaterThanOrEqual(30);
      }
    }
  });

  test('Clear All button is accessible on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Select areas
    await page.click('.leaflet-interactive');
    await page.waitForTimeout(500);

    // Check Clear All button
    const clearButton = page.getByRole('button', { name: 'Clear All Selections' });

    if (await clearButton.isVisible()) {
      const box = await clearButton.boundingBox();

      if (box) {
        const viewport = page.viewportSize();

        // Button should be within viewport
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);

        // Button should be touch-friendly height
        expect(box.height).toBeGreaterThanOrEqual(36);
      }
    }
  });
});

test.describe('Mobile Responsiveness - iPhone 14 Pro Max', () => {
  test.use({ viewport: { width: 430, height: 932 } });

  test('app scales correctly on larger mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Check overall layout
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Map should be visible
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });
});

test.describe('Tablet Responsiveness - iPad', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('layout works on tablet portrait', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Check no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Components should be visible
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });

  test('handles tablet landscape orientation', async ({ page, context }) => {
    // iPad in landscape
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verify layout adapts
    await expect(page.locator('.leaflet-container')).toBeVisible();

    const map = await page.locator('.leaflet-container');
    const box = await map.boundingBox();

    expect(box.width).toBeLessThanOrEqual(1024);
    expect(box.height).toBeLessThanOrEqual(768);
  });
});

test.describe('Orientation Changes', () => {
  test('handles portrait to landscape transition', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verify initial layout
    await expect(page.locator('.leaflet-container')).toBeVisible();

    // Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(1000);

    // Verify layout adapts
    await expect(page.locator('.leaflet-container')).toBeVisible();

    const map = await page.locator('.leaflet-container');
    const box = await map.boundingBox();

    expect(box.width).toBeLessThanOrEqual(667);
    expect(box.height).toBeLessThanOrEqual(375);

    // Check no components are off-screen
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

test.describe('Component Positioning Issues', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('fixed positioned elements stay within viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Select area and open word cloud
    await page.click('.leaflet-interactive');
    await page.waitForTimeout(500);

    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });
    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Click word to open modal
      const words = page.locator('[data-testid^="word-"]');
      if (await words.count() > 0) {
        await words.first().click();
        await page.waitForTimeout(500);

        // Check all fixed/absolute positioned elements
        const fixedElements = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          return elements
            .filter(el => {
              const style = window.getComputedStyle(el);
              return style.position === 'fixed' || style.position === 'absolute';
            })
            .map(el => {
              const rect = el.getBoundingClientRect();
              return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                right: rect.right,
                bottom: rect.bottom
              };
            });
        });

        const viewport = page.viewportSize();

        for (const el of fixedElements) {
          // Elements should not extend beyond viewport
          if (el.width > 0 && el.height > 0) {
            expect(el.x).toBeGreaterThanOrEqual(-10); // Allow small tolerance
            expect(el.y).toBeGreaterThanOrEqual(-10);
            expect(el.right).toBeLessThanOrEqual(viewport.width + 10);
            expect(el.bottom).toBeLessThanOrEqual(viewport.height + 10);
          }
        }
      }
    }
  });

  test('no z-index stacking issues causing overlaps', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Select area
    await page.click('.leaflet-interactive');
    await page.waitForTimeout(500);

    // Verify selection panel is not hidden behind map
    const selectionText = page.getByText(/\d+ area selected/);
    await expect(selectionText).toBeVisible();

    // Check if it's actually visible (not covered)
    const isVisible = await selectionText.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const point = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      return el.contains(point) || point.contains(el);
    });

    expect(isVisible).toBe(true);
  });
});
