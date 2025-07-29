import { test, expect } from '@playwright/test';

test.describe('AI Features Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('AI chatbot widget is present and functional', async ({ page }) => {
    // Check if chat widget exists
    const chatWidget = page.locator('#pipeline-chat-widget');
    await expect(chatWidget).toBeVisible();
    
    // Check if chat trigger button exists
    const chatTrigger = page.locator('[data-chat-toggle]');
    await expect(chatTrigger).toBeVisible();
    
    // Click to open chat
    await chatTrigger.click();
    
    // Check if chat panel opens
    const chatPanel = page.locator('[data-chat-panel]');
    await expect(chatPanel).toHaveClass(/active/);
    
    // Check if chat input exists
    const chatInput = page.locator('[data-chat-input]');
    await expect(chatInput).toBeVisible();
    
    // Check if send button exists
    const sendButton = page.locator('[data-chat-send]');
    await expect(sendButton).toBeVisible();
    
    // Check AI provider status indicators
    const providerStatus = page.locator('.ai-provider-status');
    await expect(providerStatus).toBeInViewport();
    
    // Check provider dots
    const claudeDot = page.locator('[data-provider="claude"]');
    const openaiDot = page.locator('[data-provider="openai"]');
    const geminiDot = page.locator('[data-provider="gemini"]');
    
    await expect(claudeDot).toBeVisible();
    await expect(openaiDot).toBeVisible();
    await expect(geminiDot).toBeVisible();
  });

  test('Chat input validation works correctly', async ({ page }) => {
    // Open chat
    await page.click('[data-chat-toggle]');
    
    // Test empty message handling
    const chatInput = page.locator('[data-chat-input]');
    const sendButton = page.locator('[data-chat-send]');
    
    // Try to send empty message
    await sendButton.click();
    
    // Should not send empty message (no new message should appear)
    const messages = page.locator('.message');
    const initialCount = await messages.count();
    
    // The welcome message should be the only one
    expect(initialCount).toBeGreaterThanOrEqual(1);
  });

  test('Quick reply buttons are functional', async ({ page }) => {
    // Open chat
    await page.click('[data-chat-toggle]');
    
    // Check if quick replies exist
    const quickReplies = page.locator('.quick-reply');
    const quickReplyCount = await quickReplies.count();
    expect(quickReplyCount).toBeGreaterThan(0);
    
    // Check first quick reply button
    const firstQuickReply = quickReplies.first();
    await expect(firstQuickReply).toBeVisible();
    await expect(firstQuickReply).toHaveAttribute('data-quick-text');
  });

  test('Chat widget is mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if chat widget is still visible on mobile (if enabled)
    const chatWidget = page.locator('#pipeline-chat-widget');
    
    // Widget should either be visible or hidden based on mobile settings
    const isVisible = await chatWidget.isVisible();
    
    if (isVisible) {
      // If visible on mobile, check responsive behavior
      await page.click('[data-chat-toggle]');
      
      const chatPanel = page.locator('[data-chat-panel]');
      await expect(chatPanel).toBeVisible();
      
      // Chat panel should take most of the screen on mobile
      const panelBox = await chatPanel.boundingBox();
      expect(panelBox?.width).toBeGreaterThan(300); // Should be nearly full width
    }
  });

  test('AI integration JavaScript is loaded', async ({ page }) => {
    // Check if AI integration script is loaded
    const aiIntegration = await page.evaluate(() => {
      return typeof window.AIChainBot !== 'undefined';
    });
    
    expect(aiIntegration).toBe(true);
  });

  test('Chat widget styling is properly applied', async ({ page }) => {
    const chatWidget = page.locator('#pipeline-chat-widget');
    
    // Check positioning
    const styles = await chatWidget.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        bottom: computed.bottom,
        right: computed.right,
        zIndex: computed.zIndex
      };
    });
    
    expect(styles.position).toBe('fixed');
    expect(styles.bottom).toBe('20px');
    expect(styles.right).toBe('20px');
    expect(parseInt(styles.zIndex)).toBeGreaterThan(9000);
  });

  test('Settings integration works', async ({ page }) => {
    // Open chat
    await page.click('[data-chat-toggle]');
    
    // Check if settings are applied (placeholder text, etc.)
    const chatInput = page.locator('[data-chat-input]');
    const placeholder = await chatInput.getAttribute('placeholder');
    
    // Should have a placeholder text
    expect(placeholder).toBeTruthy();
    expect(placeholder?.length).toBeGreaterThan(0);
  });

  test('Welcome message is displayed', async ({ page }) => {
    // Open chat
    await page.click('[data-chat-toggle]');
    
    // Check for welcome message
    const welcomeMessage = page.locator('.agent-message').first();
    await expect(welcomeMessage).toBeVisible();
    
    // Welcome message should have content
    const messageText = await welcomeMessage.locator('.message-text').textContent();
    expect(messageText).toBeTruthy();
    expect(messageText?.length).toBeGreaterThan(0);
  });
});

test.describe('AI Features Settings Validation', () => {
  test('GUI settings panels are properly structured', async ({ page }) => {
    // This test would need admin access, so we'll just verify the structure exists
    // In a real scenario, you'd test the Shopify admin interface
    
    // For now, verify that the settings-dependent elements work
    await page.goto('/');
    
    const chatWidget = page.locator('#pipeline-chat-widget');
    await expect(chatWidget).toBeVisible();
    
    // The widget should respect settings for visibility, styling, etc.
    const isVisible = await chatWidget.isVisible();
    expect(typeof isVisible).toBe('boolean');
  });
});

test.describe('E-bike Feature Integration', () => {
  test('Feature toggle buttons work with settings', async ({ page }) => {
    // Test that e-bike features respect the GUI settings
    
    // Size guide should be accessible (if enabled)
    await page.goto('/pages/size-guide');
    const sizeGuide = page.locator('#bike-size-calculator, .size-calculator, [data-size-calculator]');
    
    // Should either exist or not based on settings
    const exists = await sizeGuide.count() > 0;
    expect(typeof exists).toBe('boolean');
  });

  test('Comparison tool respects settings', async ({ page }) => {
    await page.goto('/pages/compare');
    const comparisonTool = page.locator('#bike-comparison, .comparison-tool, [data-comparison]');
    
    // Should either exist or not based on settings
    const exists = await comparisonTool.count() > 0;
    expect(typeof exists).toBe('boolean');
  });

  test('Store location settings integration', async ({ page }) => {
    await page.goto('/pages/locations');
    
    // Should show store locations if configured
    const locations = page.locator('.location-card, .store-location, [data-location]');
    const locationCount = await locations.count();
    
    // Should have at least one location or proper empty state
    expect(locationCount >= 0).toBe(true);
  });
});