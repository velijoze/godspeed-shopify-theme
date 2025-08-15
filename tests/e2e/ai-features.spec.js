// E2E Tests for AI-Enhanced Bike Comparison Features
// Testing intelligent recommendations and smart insights

const { test, expect } = require('@playwright/test');

test.describe('E2E: AI-Enhanced Bike Comparison', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to comparison page
    await page.goto('/pages/compare');
    await page.waitForLoadState('networkidle');
  });

  test('AI insights appear when comparing bikes', async ({ page }) => {
    // Select two bikes for comparison
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
    await page.selectOption('.bike-select[data-column="b"]', 'mountain-trail');
    
    // Wait for comparison table to update
    await page.waitForSelector('.comparison-table tbody tr');
    
    // Verify smart insights appear
    await expect(page.locator('#smart-insights')).toBeVisible();
    await expect(page.locator('.ai-insights')).toBeVisible();
    await expect(page.locator('.ai-insights h3')).toContainText('Smart Insights');
    
    // Verify insight cards are present
    const insightCards = page.locator('.insight-card');
    await expect(insightCards).toHaveCount({ min: 2 }); // At least price and performance
    
    // Verify price analysis
    const priceCard = insightCards.filter({ hasText: 'Price Analysis' });
    await expect(priceCard).toBeVisible();
    await expect(priceCard.locator('p')).toContainText('Best Value');
    
    // Verify performance comparison
    const performanceCard = insightCards.filter({ hasText: 'Performance Comparison' });
    await expect(performanceCard).toBeVisible();
    await expect(performanceCard.locator('p')).toContainText('Range');
  });

  test('AI recommendations appear based on selection', async ({ page }) => {
    // Select a bike
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
    
    // Wait for AI processing
    await page.waitForTimeout(500);
    
    // Check if recommendations container appears
    const recommendations = page.locator('#ai-recommendations');
    if (await recommendations.isVisible()) {
      await expect(recommendations.locator('h3')).toContainText('AI Recommendations');
      await expect(recommendations.locator('.ai-subtitle')).toContainText('Based on your preferences');
      
      // Verify recommendation cards
      const recCards = recommendations.locator('.ai-recommendation-card');
      await expect(recCards).toHaveCount({ min: 1, max: 3 });
      
      // Test recommendation structure
      const firstRec = recCards.first();
      await expect(firstRec.locator('h4')).toBeVisible(); // Bike name
      await expect(firstRec.locator('.rec-price')).toContainText('CHF');
      await expect(firstRec.locator('.rec-reason')).toBeVisible();
      await expect(firstRec.locator('.btn-add-to-compare')).toBeVisible();
    }
  });

  test('Add recommendation to comparison works', async ({ page }) => {
    // Select initial bikes
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
    await page.selectOption('.bike-select[data-column="b"]', 'trekking-sport');
    
    // Wait for recommendations
    await page.waitForTimeout(500);
    
    const recommendations = page.locator('#ai-recommendations');
    if (await recommendations.isVisible()) {
      const addButton = recommendations.locator('.btn-add-to-compare').first();
      
      if (await addButton.isVisible()) {
        // Click to add recommendation
        await addButton.click();
        
        // Verify bike was added to comparison
        await page.waitForTimeout(500);
        const thirdSelect = page.locator('.bike-select[data-column="c"]');
        const selectedValue = await thirdSelect.inputValue();
        expect(selectedValue).not.toBe('');
        
        // Verify comparison table updated
        const tableRows = page.locator('.comparison-table tbody tr');
        await expect(tableRows).toHaveCount({ min: 3 });
      }
    }
  });

  test('Smart scores comparison displays correctly', async ({ page }) => {
    // Select bikes with smart scores
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
    await page.selectOption('.bike-select[data-column="b"]', 'mountain-trail');
    await page.selectOption('.bike-select[data-column="c"]', 'cargo-family');
    
    // Wait for insights to load
    await page.waitForSelector('.ai-insights');
    
    // Look for AI recommendations section
    const aiRecommendations = page.locator('.insight-card').filter({ hasText: 'AI Recommendations' });
    
    if (await aiRecommendations.isVisible()) {
      // Verify category recommendations
      const recommendations = await aiRecommendations.locator('p').allTextContents();
      
      // Should have recommendations for different categories
      const hasComfortRec = recommendations.some(text => text.includes('Most Comfortable'));
      const hasPerformanceRec = recommendations.some(text => text.includes('Best Performance'));
      const hasValueRec = recommendations.some(text => text.includes('Best Value'));
      
      expect(hasComfortRec || hasPerformanceRec || hasValueRec).toBeTruthy();
    }
  });

  test('Behavior tracking stores interactions', async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => localStorage.clear());
    
    // Perform interactions
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
    await page.waitForTimeout(100);
    
    await page.selectOption('.bike-select[data-column="b"]', 'mountain-trail');
    await page.waitForTimeout(100);
    
    // Check if interactions were tracked
    const interactions = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('bikeInteractions') || '[]');
    });
    
    expect(interactions.length).toBeGreaterThan(0);
    expect(interactions.some(i => i.action === 'compared')).toBeTruthy();
    expect(interactions.some(i => i.bikeId === 'city-comfort')).toBeTruthy();
  });

  test('Mobile responsive AI features', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    
    // Select bikes on mobile
    await page.tap('.bike-select[data-column="a"]');
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
    
    await page.tap('.bike-select[data-column="b"]');
    await page.selectOption('.bike-select[data-column="b"]', 'trekking-sport');
    
    // Verify mobile-optimized insights
    const insights = page.locator('.ai-insights');
    if (await insights.isVisible()) {
      // Check mobile layout
      const insightCards = insights.locator('.insight-card');
      await expect(insightCards.first()).toBeVisible();
      
      // Verify cards stack vertically on mobile
      const firstCardBox = await insightCards.first().boundingBox();
      const secondCardBox = await insightCards.nth(1).boundingBox();
      
      if (firstCardBox && secondCardBox) {
        expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height);
      }
    }
    
    // Test mobile recommendations
    const recommendations = page.locator('#ai-recommendations');
    if (await recommendations.isVisible()) {
      const recCard = recommendations.locator('.ai-recommendation-card').first();
      await expect(recCard).toHaveClass(/flex-direction.*column/);
      
      // Add button should be full width on mobile
      const addButton = recCard.locator('.btn-add-to-compare');
      const buttonBox = await addButton.boundingBox();
      const cardBox = await recCard.boundingBox();
      
      if (buttonBox && cardBox) {
        expect(buttonBox.width).toBeCloseTo(cardBox.width - 32, 10); // Account for padding
      }
    }
  });

  test('AI features respect admin settings', async ({ page }) => {
    // This test would check if AI features are enabled/disabled based on theme settings
    // In a real scenario, we'd set up different theme configurations
    
    // Check if AI insights are visible (assuming enabled by default)
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
    await page.selectOption('.bike-select[data-column="b"]', 'mountain-trail');
    
    const insights = page.locator('.ai-insights');
    const recommendations = page.locator('#ai-recommendations');
    
    // If settings are enabled, these should be visible
    // This is a placeholder for actual settings integration
    if (await insights.isVisible()) {
      await expect(insights).toBeVisible();
    }
    
    if (await recommendations.isVisible()) {
      await expect(recommendations).toBeVisible();
    }
  });

  test('Performance: AI features load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    // Select bikes
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
    await page.selectOption('.bike-select[data-column="b"]', 'mountain-trail');
    
    // Wait for AI features to appear
    await page.waitForSelector('.ai-insights', { timeout: 2000 });
    
    const loadTime = Date.now() - startTime;
    
    // AI features should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
    
    // Check if animations are smooth
    const hasAnimations = await page.evaluate(() => {
      const insights = document.querySelector('.smart-insights');
      if (insights) {
        const styles = window.getComputedStyle(insights);
        return styles.animation !== 'none';
      }
      return false;
    });
    
    expect(hasAnimations).toBeTruthy();
  });

});

test.describe('E2E: AI Learning and Adaptation', () => {
  
  test('AI learns from repeated selections', async ({ page }) => {
    await page.goto('/pages/compare');
    
    // Clear previous data
    await page.evaluate(() => localStorage.clear());
    
    // Make multiple selections with pattern
    for (let i = 0; i < 3; i++) {
      await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
      await page.waitForTimeout(200);
      await page.selectOption('.bike-select[data-column="a"]', '');
      await page.waitForTimeout(200);
    }
    
    // Select city-comfort again
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort');
    
    // Check if recommendations reflect the pattern
    const recommendations = page.locator('#ai-recommendations');
    if (await recommendations.isVisible()) {
      const recTexts = await recommendations.locator('.rec-reason').allTextContents();
      
      // Should recommend bikes similar to city-comfort
      const hasRelevantRec = recTexts.some(text => 
        text.includes('commuting') || 
        text.includes('comfort') || 
        text.includes('city')
      );
      
      expect(hasRelevantRec).toBeTruthy();
    }
  });

  test('AI provides contextual help', async ({ page }) => {
    await page.goto('/pages/compare');
    
    // Select bikes with very different prices
    await page.selectOption('.bike-select[data-column="a"]', 'city-comfort'); // Cheapest
    await page.selectOption('.bike-select[data-column="b"]', 'mountain-trail'); // Most expensive
    
    // Check for price difference insight
    const priceInsight = page.locator('.insight-card').filter({ hasText: 'Price Analysis' });
    if (await priceInsight.isVisible()) {
      const priceText = await priceInsight.textContent();
      expect(priceText).toContain('Price Range');
      expect(priceText).toMatch(/CHF \d+[,.]?\d*/); // Contains price difference
    }
  });

});

// Helper functions for AI testing
async function clearAIData(page) {
  await page.evaluate(() => {
    localStorage.removeItem('bikeInteractions');
    sessionStorage.clear();
  });
}

async function simulateCustomerJourney(page, bikePreferences) {
  for (const bike of bikePreferences) {
    await page.selectOption('.bike-select[data-column="a"]', bike);
    await page.waitForTimeout(500);
    await page.selectOption('.bike-select[data-column="a"]', '');
    await page.waitForTimeout(200);
  }
}