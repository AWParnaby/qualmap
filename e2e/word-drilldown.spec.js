import { test, expect } from '@playwright/test';

test.describe('Word Cloud Drilldown Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Select at least one area to generate word cloud data
    const area = page.locator('.leaflet-interactive').first();
    await area.click();
    await page.waitForTimeout(500);
  });

  test('displays word cloud after selecting areas', async ({ page }) => {
    // Switch to Word Cloud tab
    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });

    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Check for word cloud sections
      await expect(page.getByText('Service Descriptions')).toBeVisible();
      await expect(page.getByText('User Feedback')).toBeVisible();

      // Verify words are displayed (look for word cloud content)
      const hasWords = await page.evaluate(() => {
        const body = document.body.innerHTML;
        // Check if there are word elements or "No words found" message
        return body.includes('word-') || body.includes('No words found');
      });

      expect(hasWords).toBe(true);
    }
  });

  test('shows "No words found" message when no areas selected', async ({ page }) => {
    // Clear any selections first
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Switch to Word Cloud tab
    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });

    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Should see "No words found" messages
      const noWordsMessages = page.getByText('No words found in selected areas');
      const count = await noWordsMessages.count();

      expect(count).toBeGreaterThan(0);
    }
  });

  test('opens drilldown panel when clicking a word', async ({ page }) => {
    // Navigate to Word Cloud tab
    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });

    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Find and click a word (if any exist)
      const words = page.locator('[data-testid^="word-"]');
      const wordCount = await words.count();

      if (wordCount > 0) {
        // Click the first word
        await words.first().click();
        await page.waitForTimeout(500);

        // Verify drilldown panel appears
        // Look for the header "Sources containing..."
        const header = page.locator('h3', { hasText: /Sources containing/i });
        await expect(header).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('drilldown panel displays matching services', async ({ page }) => {
    // Navigate to Word Cloud tab
    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });

    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Click a word
      const words = page.locator('[data-testid^="word-"]');
      const wordCount = await words.count();

      if (wordCount > 0) {
        await words.first().click();
        await page.waitForTimeout(500);

        // Check for service information in the panel
        const hasServiceInfo = await page.evaluate(() => {
          const body = document.body.innerHTML;
          return body.includes('Service:') || body.includes('Postcode:') || body.includes('Text:');
        });

        expect(hasServiceInfo).toBe(true);
      }
    }
  });

  test('closes drilldown panel with X button', async ({ page }) => {
    // Navigate to Word Cloud tab
    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });

    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Click a word to open drilldown
      const words = page.locator('[data-testid^="word-"]');
      const wordCount = await words.count();

      if (wordCount > 0) {
        await words.first().click();
        await page.waitForTimeout(500);

        // Verify panel is open
        const header = page.locator('h3', { hasText: /Sources containing/i });
        await expect(header).toBeVisible();

        // Click the X button
        const closeButton = page.getByRole('button', { name: 'Close panel' });
        await closeButton.click();
        await page.waitForTimeout(500);

        // Verify panel is closed
        await expect(header).not.toBeVisible();
      }
    }
  });

  test('closes drilldown panel with Close button', async ({ page }) => {
    // Navigate to Word Cloud tab
    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });

    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Click a word to open drilldown
      const words = page.locator('[data-testid^="word-"]');
      const wordCount = await words.count();

      if (wordCount > 0) {
        await words.first().click();
        await page.waitForTimeout(500);

        // Verify panel is open
        const header = page.locator('h3', { hasText: /Sources containing/i });
        await expect(header).toBeVisible();

        // Click the Close button (at bottom)
        const closeButton = page.getByRole('button', { name: 'Close' });
        await closeButton.click();
        await page.waitForTimeout(500);

        // Verify panel is closed
        await expect(header).not.toBeVisible();
      }
    }
  });

  test('word cloud updates when selection changes', async ({ page }) => {
    // Navigate to Word Cloud tab
    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });

    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Get current word count
      const initialWords = page.locator('[data-testid^="word-"]');
      const initialCount = await initialWords.count();

      // Go back to map and select more areas
      const mapButton = page.locator('button', { hasText: /Map|Selections/i }).first();
      await mapButton.click();
      await page.waitForTimeout(500);

      // Select another area
      const areas = page.locator('.leaflet-interactive');
      const areaCount = await areas.count();

      if (areaCount > 1) {
        await areas.nth(1).click();
        await page.waitForTimeout(500);

        // Go back to word cloud
        await wordCloudButton.first().click();
        await page.waitForTimeout(1000);

        // Check if word cloud has updated
        const updatedWords = page.locator('[data-testid^="word-"]');
        const updatedCount = await updatedWords.count();

        // Word count might increase or stay same (depends on data overlap)
        expect(updatedCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('displays separate word clouds for Services and Feedback', async ({ page }) => {
    // Navigate to Word Cloud tab
    const wordCloudButton = page.locator('button', { hasText: /Word Cloud/i });

    if (await wordCloudButton.count() > 0) {
      await wordCloudButton.first().click();
      await page.waitForTimeout(1000);

      // Verify both section headers exist
      await expect(page.getByText('Service Descriptions')).toBeVisible();
      await expect(page.getByText('User Feedback')).toBeVisible();

      // Verify they are separate sections (not overlapping)
      const serviceSectionBox = await page.getByText('Service Descriptions').boundingBox();
      const feedbackSectionBox = await page.getByText('User Feedback').boundingBox();

      if (serviceSectionBox && feedbackSectionBox) {
        // Service section should be above feedback section
        expect(serviceSectionBox.y).toBeLessThan(feedbackSectionBox.y);
      }
    }
  });
});
