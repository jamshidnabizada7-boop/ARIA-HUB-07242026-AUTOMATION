import { test, expect } from '@playwright/test';

test('Opportunity Matcher flow', async ({ page }) => {
  await page.goto('/opportunity-matcher');

  // Wait until we see "Tell us about yourself"
  await expect(page.getByRole('heading', { name: 'Tell us about yourself' })).toBeVisible();

  // Step 1: Age
  const ageInput = page.locator('input#age');
  await ageInput.waitFor({ state: 'visible' });
  await ageInput.focus();
  await ageInput.fill('25');

  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 2: Target Country
  await expect(page.getByRole('heading', { name: 'Destination' })).toBeVisible();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Germany' }).click();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 3: Education
  await expect(page.getByRole('heading', { name: 'Background' })).toBeVisible();
  await page.getByText("Master's Degree", { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Step 4: Goal
  await expect(page.getByRole('heading', { name: 'Your Goal' })).toBeVisible();
  await page.getByText('Scholarship', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Find Matches' })).toBeEnabled();
  await page.getByRole('button', { name: 'Find Matches' }).click();

  // Step 5: Loading (Analyze Profile)
  await expect(page.getByRole('heading', { name: 'Analyzing Profile...' })).toBeVisible();

  // Step 6: Results
  await expect(page.getByRole('heading', { name: 'Your Top Matches' })).toBeVisible({ timeout: 5000 });

  // Verify CTA exists
  await expect(page.getByRole('link', { name: 'Get Application Help' })).toBeVisible();
});
