import { test, expect } from '@playwright/test';

test.describe('Area Selection Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Wait for GeoJSON data to load (postcode areas should appear)
    await page.waitForTimeout(2000); // Allow time for data and map to fully initialize
  });

  test('selects a single postcode area', async ({ page }) => {
    // Find and click a postcode area on the map
    const postcodeArea = page.locator('.leaflet-interactive').first();
    await postcodeArea.click();

    // Wait for selection to update
    await page.waitForTimeout(500);

    // Verify the selection panel shows "1 area selected"
    await expect(page.getByText('1 area selected')).toBeVisible();

    // Verify the area appears in the selection list
    const selectionPanel = page.locator('text=area selected').locator('..').locator('..');
    await expect(selectionPanel).toBeVisible();
  });

  test('selects multiple postcode areas', async ({ page }) => {
    // Click multiple areas
    const areas = page.locator('.leaflet-interactive');
    const count = await areas.count();

    if (count >= 3) {
      await areas.nth(0).click();
      await page.waitForTimeout(300);
      await areas.nth(1).click();
      await page.waitForTimeout(300);
      await areas.nth(2).click();
      await page.waitForTimeout(300);

      // Verify selection count
      await expect(page.getByText('3 areas selected')).toBeVisible();
    }
  });

  test('deselects an area by clicking it again', async ({ page }) => {
    // Select an area
    const area = page.locator('.leaflet-interactive').first();
    await area.click();
    await page.waitForTimeout(500);

    // Verify it's selected
    await expect(page.getByText('1 area selected')).toBeVisible();

    // Click the same area again to deselect
    await area.click();
    await page.waitForTimeout(500);

    // Verify it's deselected
    await expect(page.getByText('No areas selected')).toBeVisible();
  });

  test('removes individual area from selection panel', async ({ page }) => {
    // Select two areas
    const areas = page.locator('.leaflet-interactive');
    await areas.nth(0).click();
    await page.waitForTimeout(300);
    await areas.nth(1).click();
    await page.waitForTimeout(500);

    // Verify 2 areas selected
    await expect(page.getByText('2 areas selected')).toBeVisible();

    // Click the remove button (✕) on the first area in the list
    const removeButton = page.getByRole('button', { name: /Remove/ }).first();
    await removeButton.click();
    await page.waitForTimeout(500);

    // Verify count decreased to 1
    await expect(page.getByText('1 area selected')).toBeVisible();
  });

  test('clears all selections with Clear All button', async ({ page }) => {
    // Select multiple areas
    const areas = page.locator('.leaflet-interactive');
    const count = await areas.count();

    if (count >= 2) {
      await areas.nth(0).click();
      await page.waitForTimeout(300);
      await areas.nth(1).click();
      await page.waitForTimeout(500);

      // Verify areas are selected
      await expect(page.getByText(/\d+ areas? selected/)).toBeVisible();

      // Click Clear All button
      await page.getByRole('button', { name: 'Clear All Selections' }).click();
      await page.waitForTimeout(500);

      // Verify all selections cleared
      await expect(page.getByText('No areas selected')).toBeVisible();

      // Verify Clear All button is no longer visible
      await expect(page.getByRole('button', { name: 'Clear All Selections' })).not.toBeVisible();
    }
  });

  test('selections persist across tab changes', async ({ page }) => {
    // Select an area
    const area = page.locator('.leaflet-interactive').first();
    await area.click();
    await page.waitForTimeout(500);

    // Verify selection
    await expect(page.getByText('1 area selected')).toBeVisible();

    // Switch to Word Cloud tab
    const wordCloudTab = page.getByRole('button', { name: /Word Cloud/i });
    if (await wordCloudTab.isVisible()) {
      await wordCloudTab.click();
      await page.waitForTimeout(500);

      // Switch back to Selections tab
      const selectionsTab = page.getByRole('button', { name: /Selections/i });
      await selectionsTab.click();
      await page.waitForTimeout(500);

      // Verify selection persists
      await expect(page.getByText('1 area selected')).toBeVisible();
    }
  });

  test('selected areas are visually highlighted on map', async ({ page }) => {
    // Get the initial style/color of an area
    const area = page.locator('.leaflet-interactive').first();
    const initialFill = await area.getAttribute('fill');

    // Click to select it
    await area.click();
    await page.waitForTimeout(500);

    // Get the new style/color
    const selectedFill = await area.getAttribute('fill');

    // The fill color should change when selected
    expect(selectedFill).not.toBe(initialFill);
  });
});
