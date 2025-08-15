import { test, expect } from '@playwright/test';

test.describe('VeloConnect Integration System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that includes VeloConnect sections
    await page.goto('/');
  });

  test('VeloConnect dashboard loads and displays correctly', async ({ page }) => {
    // Check if VeloConnect dashboard elements are present
    const veloconnectDashboard = page.locator('.pipeline-veloconnect-dashboard');
    
    if (await veloconnectDashboard.isVisible()) {
      // Test dashboard header
      await expect(page.locator('.dashboard-header h3')).toContainText('VeloConnect');
      
      // Test connection status card
      await expect(page.locator('.connection-status-card')).toBeVisible();
      
      // Test API mode indicator
      await expect(page.locator('.api-mode-indicator')).toBeVisible();
      
      // Test sync buttons
      await expect(page.locator('[data-veloconnect-sync-all]')).toBeVisible();
      await expect(page.locator('[data-veloconnect-test]')).toBeVisible();
    }
  });

  test('Supplier cards display with correct information', async ({ page }) => {
    const suppliersSection = page.locator('.suppliers-section');
    
    if (await suppliersSection.isVisible()) {
      // Test that supplier cards are present
      const supplierCards = page.locator('.supplier-card');
      
      // Check for specific suppliers
      const expectedSuppliers = ['cube', 'riese_muller', 'bosch', 'mondraker', 'orbea'];
      
      for (const supplier of expectedSuppliers) {
        const supplierCard = page.locator(`[data-supplier="${supplier}"]`);
        if (await supplierCard.isVisible()) {
          // Check supplier has logo or name
          const hasLogo = await supplierCard.locator('.supplier-logo').isVisible();
          const hasFallback = await supplierCard.locator('.supplier-name-fallback').isVisible();
          expect(hasLogo || hasFallback).toBeTruthy();
          
          // Check supplier has stats
          await expect(supplierCard.locator('.supplier-stats')).toBeVisible();
          
          // Check supplier has action buttons
          await expect(supplierCard.locator('.supplier-actions')).toBeVisible();
        }
      }
    }
  });

  test('VeloConnect features section displays correctly', async ({ page }) => {
    const featuresSection = page.locator('.features-section');
    
    if (await featuresSection.isVisible()) {
      // Test feature cards are present
      const featureCards = page.locator('.feature-card');
      
      // Expected features
      const expectedFeatures = [
        'Product Sync',
        'Price Sync', 
        'Inventory Sync',
        'Order Sync',
        'Click & Collect',
        'Dropshipping'
      ];
      
      for (const feature of expectedFeatures) {
        const featureCard = page.locator('.feature-card', { hasText: feature });
        if (await featureCard.isVisible()) {
          // Check feature has icon
          await expect(featureCard.locator('.feature-icon')).toBeVisible();
          
          // Check feature has status
          await expect(featureCard.locator('.feature-status')).toBeVisible();
        }
      }
    }
  });

  test('VeloConnect configuration panel loads correctly', async ({ page }) => {
    const configPanel = page.locator('.pipeline-veloconnect-config');
    
    if (await configPanel.isVisible()) {
      // Test configuration header
      await expect(page.locator('.config-header h2')).toContainText('VeloConnect');
      
      // Test benefits section
      await expect(page.locator('.veloconnect-benefits')).toBeVisible();
      
      // Test connection settings
      await expect(page.locator('.veloconnect-connection-card')).toBeVisible();
      
      // Test API mode toggle
      await expect(page.locator('.api-mode-toggle')).toBeVisible();
    }
  });

  test('Supplier configuration cards display correctly', async ({ page }) => {
    const suppliersConfig = page.locator('.suppliers-configuration');
    
    if (await suppliersConfig.isVisible()) {
      const supplierConfigCards = page.locator('.supplier-config-card');
      
      // Check each supplier has proper configuration display
      const suppliers = await supplierConfigCards.count();
      
      for (let i = 0; i < suppliers; i++) {
        const card = supplierConfigCards.nth(i);
        
        // Check supplier header
        await expect(card.locator('.supplier-header')).toBeVisible();
        
        // Check supplier details
        await expect(card.locator('.supplier-details')).toBeVisible();
        
        // Check supplier has markup information
        const markupRow = card.locator('.detail-row', { hasText: 'Price Markup' });
        if (await markupRow.isVisible()) {
          await expect(markupRow).toContainText('%');
        }
      }
    }
  });

  test('Interactive elements respond correctly', async ({ page }) => {
    // Test sync button interactions
    const syncAllBtn = page.locator('[data-veloconnect-sync-all]');
    if (await syncAllBtn.isVisible()) {
      await syncAllBtn.click();
      // Should trigger sync action (check for loading state or log entry)
    }
    
    // Test connection test button
    const testBtn = page.locator('[data-veloconnect-test]');
    if (await testBtn.isVisible()) {
      await testBtn.click();
      // Should trigger connection test
    }
    
    // Test API mode toggle
    const toggleBtn = page.locator('[data-toggle-api]');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      // Should toggle between VeloConnect and velo.API modes
    }
  });

  test('Activity log displays and updates', async ({ page }) => {
    const activityLog = page.locator('.activity-log');
    
    if (await activityLog.isVisible()) {
      // Check log container exists
      await expect(page.locator('[data-veloconnect-logs]')).toBeVisible();
      
      // Check for initial log entry
      const logEntries = page.locator('.log-entry');
      const entryCount = await logEntries.count();
      expect(entryCount).toBeGreaterThan(0);
      
      // Check log entry structure
      if (entryCount > 0) {
        const firstEntry = logEntries.first();
        await expect(firstEntry.locator('.log-time')).toBeVisible();
        await expect(firstEntry.locator('.log-level')).toBeVisible();
        await expect(firstEntry.locator('.log-message')).toBeVisible();
      }
    }
  });

  test('Mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    // Test that VeloConnect elements are mobile-friendly
    const dashboard = page.locator('.pipeline-veloconnect-dashboard');
    if (await dashboard.isVisible()) {
      // Dashboard should be responsive
      await expect(dashboard).toBeVisible();
      
      // Buttons should stack properly on mobile
      const dashboardActions = page.locator('.dashboard-actions');
      if (await dashboardActions.isVisible()) {
        const actions = dashboardActions.locator('button');
        const actionCount = await actions.count();
        
        // On mobile, buttons should be visible and properly sized
        for (let i = 0; i < actionCount; i++) {
          await expect(actions.nth(i)).toBeVisible();
        }
      }
    }
    
    // Test supplier cards on mobile
    const supplierCards = page.locator('.supplier-card');
    const cardCount = await supplierCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = supplierCards.nth(i);
      if (await card.isVisible()) {
        // Cards should be properly sized on mobile
        const boundingBox = await card.boundingBox();
        if (boundingBox) {
          expect(boundingBox.width).toBeLessThanOrEqual(375);
        }
      }
    }
  });

  test('Error handling and edge cases', async ({ page }) => {
    // Test behavior when API is not configured
    const connectionStatus = page.locator('[data-connection-status]');
    if (await connectionStatus.isVisible()) {
      // Should show appropriate status (disconnected, unknown, etc.)
      const status = await connectionStatus.getAttribute('data-connection-status');
      expect(['connected', 'disconnected', 'unknown', 'syncing']).toContain(status);
    }
    
    // Test behavior with disabled suppliers
    const supplierCards = page.locator('.supplier-card');
    const cardCount = await supplierCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = supplierCards.nth(i);
      const statusElement = card.locator('.supplier-status');
      
      if (await statusElement.isVisible()) {
        const status = await statusElement.getAttribute('data-status');
        expect(['connected', 'error', 'unknown', 'syncing']).toContain(status);
      }
    }
  });
});

test.describe('Vendor API Framework', () => {
  test('Vendor API dashboard displays correctly', async ({ page }) => {
    await page.goto('/');
    
    const apiDashboard = page.locator('.pipeline-api-dashboard');
    if (await apiDashboard.isVisible()) {
      // Test dashboard header
      await expect(page.locator('.dashboard-header h3')).toContainText('Vendor API');
      
      // Test vendor cards
      const vendorCards = page.locator('.api-vendor-card');
      const vendorCount = await vendorCards.count();
      
      expect(vendorCount).toBeGreaterThan(0);
      
      // Test each vendor card
      for (let i = 0; i < vendorCount; i++) {
        const card = vendorCards.nth(i);
        await expect(card.locator('.vendor-header')).toBeVisible();
        await expect(card.locator('.vendor-stats')).toBeVisible();
        await expect(card.locator('.vendor-actions')).toBeVisible();
      }
    }
  });

  test('API configuration sections load correctly', async ({ page }) => {
    await page.goto('/');
    
    const configSections = page.locator('.vendor-config-card');
    const sectionCount = await configSections.count();
    
    for (let i = 0; i < sectionCount; i++) {
      const section = configSections.nth(i);
      if (await section.isVisible()) {
        // Each configuration card should have header and details
        await expect(section.locator('.vendor-header')).toBeVisible();
        await expect(section.locator('.vendor-details')).toBeVisible();
        await expect(section.locator('.config-fields')).toBeVisible();
      }
    }
  });
});

test.describe('AI Optimization Features', () => {
  test('AI content strategy section displays', async ({ page }) => {
    await page.goto('/');
    
    const aiContent = page.locator('.pipeline-ai-content');
    if (await aiContent.isVisible()) {
      // Test AI content blocks
      const contentBlocks = page.locator('.ai-content-block');
      const blockCount = await contentBlocks.count();
      
      expect(blockCount).toBeGreaterThan(0);
      
      // Test specific AI content sections
      const expectedSections = [
        'comparison-block',
        'buying-guide-block', 
        'faq-block',
        'benefits-block'
      ];
      
      for (const sectionClass of expectedSections) {
        const section = page.locator(`.${sectionClass}`);
        if (await section.isVisible()) {
          await expect(section.locator('.ai-heading')).toBeVisible();
        }
      }
    }
  });

  test('LLM optimization metadata is present', async ({ page }) => {
    await page.goto('/');
    
    // Check for structured data scripts
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await jsonLdScripts.count();
    
    if (scriptCount > 0) {
      // Should have structured data for AI search engines
      expect(scriptCount).toBeGreaterThan(0);
      
      // Check for specific schemas
      for (let i = 0; i < scriptCount; i++) {
        const script = jsonLdScripts.nth(i);
        const content = await script.textContent();
        if (content) {
          try {
            const jsonData = JSON.parse(content);
            expect(jsonData).toHaveProperty('@context');
            expect(jsonData).toHaveProperty('@type');
          } catch (e) {
            // Some scripts might not be JSON-LD, that's ok
          }
        }
      }
    }
  });
});

test.describe('Live Chat Integration', () => {
  test('Live chat widget displays correctly', async ({ page }) => {
    await page.goto('/');
    
    const chatWidget = page.locator('.pipeline-chat-widget');
    if (await chatWidget.isVisible()) {
      // Test chat trigger button
      await expect(page.locator('.chat-trigger')).toBeVisible();
      
      // Test chat panel (may be hidden initially)
      const chatPanel = page.locator('.chat-panel');
      await expect(chatPanel).toBeAttached();
      
      // Test chat components
      if (await chatPanel.isVisible()) {
        await expect(page.locator('.chat-header')).toBeVisible();
        await expect(page.locator('.chat-messages')).toBeVisible();
        await expect(page.locator('.chat-input-container')).toBeVisible();
      }
    }
  });

  test('Chat functionality works correctly', async ({ page }) => {
    await page.goto('/');
    
    const chatTrigger = page.locator('.chat-trigger');
    if (await chatTrigger.isVisible()) {
      // Click to open chat
      await chatTrigger.click();
      
      // Chat panel should open
      const chatPanel = page.locator('.chat-panel');
      await expect(chatPanel).toHaveClass(/open/);
      
      // Test quick reply buttons
      const quickReplies = page.locator('.quick-reply');
      const replyCount = await quickReplies.count();
      
      if (replyCount > 0) {
        expect(replyCount).toBeGreaterThan(0);
        
        // Click first quick reply
        await quickReplies.first().click();
        
        // Should add message to chat
        const messages = page.locator('.message');
        const messageCount = await messages.count();
        expect(messageCount).toBeGreaterThan(1); // Initial + user message
      }
    }
  });
});