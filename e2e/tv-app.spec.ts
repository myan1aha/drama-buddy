import { test, expect } from '@playwright/test';

test.describe('TV App — Drama Setup', () => {
  test('shows setup screen on first load', async ({ page }) => {
    await page.goto('/');
    // Should show drama title input
    await expect(page.getByPlaceholder(/剧名/)).toBeVisible();
  });

  test('can enter drama title and start watching', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/剧名/);
    await input.fill('Breaking Bad');

    const startBtn = page.getByRole('button', { name: /开始/ });
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    // Should transition to chat view
    await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 5000 });
  });

  test('setup button disabled without title', async ({ page }) => {
    await page.goto('/');

    const startBtn = page.getByRole('button', { name: /开始/ });
    await expect(startBtn).toBeDisabled();
  });
});

test.describe('TV App — Chat Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Quick setup
    await page.getByPlaceholder(/剧名/).fill('Better Call Saul');
    await page.getByRole('button', { name: /开始/ }).click();
    await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 5000 });
  });

  test('quick phrases are visible and clickable', async ({ page }) => {
    const quickBtns = page.locator('.quick-btn, .tv-quick-btn');
    await expect(quickBtns.first()).toBeVisible();

    // Click a quick phrase
    await quickBtns.first().click();

    // Should show user message in chat
    await expect(page.locator('.chat-panel-msg.user, .msg.user')).toBeVisible({ timeout: 5000 });
  });

  test('AI responds to messages (SSE streaming)', async ({ page }) => {
    const quickBtns = page.locator('.quick-btn, .tv-quick-btn');
    await quickBtns.first().click();

    // Wait for AI response (may take a few seconds)
    await expect(
      page.locator('.chat-panel-msg.assistant, .msg.assistant')
    ).toBeVisible({ timeout: 15000 });
  });
});
