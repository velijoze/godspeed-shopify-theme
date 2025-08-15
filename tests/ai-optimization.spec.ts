import { test, expect } from '@playwright/test';

test.describe('AI Traffic Optimization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Structured data for search engines is present', async ({ page }) => {
    // Check for JSON-LD structured data
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await jsonLdScripts.count();
    
    expect(scriptCount).toBeGreaterThan(0);
    
    // Validate structured data schemas
    const validSchemaTypes = [
      'ProductCatalog',
      'ExpertReview', 
      'InventoryStatus',
      'FAQPage',
      'BreadcrumbList',
      'LocalBusiness',
      'Store',
      'Product'
    ];
    
    let foundValidSchemas = 0;
    
    for (let i = 0; i < scriptCount; i++) {
      const script = jsonLdScripts.nth(i);
      const content = await script.textContent();
      
      if (content && content.trim().startsWith('{')) {
        try {
          const jsonData = JSON.parse(content);
          
          if (jsonData['@context'] && jsonData['@type']) {
            expect(jsonData['@context']).toBe('https://schema.org');
            
            if (validSchemaTypes.includes(jsonData['@type'])) {
              foundValidSchemas++;
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
    
    expect(foundValidSchemas).toBeGreaterThan(0);
  });

  test('AI-friendly meta tags are present', async ({ page }) => {
    // Check for AI-specific meta tags
    const aiMetaTags = [
      'ai-store-type',
      'ai-store-specialization', 
      'ai-customer-benefits',
      'ai-unique-selling-points'
    ];
    
    for (const tagName of aiMetaTags) {
      const metaTag = page.locator(`meta[name="${tagName}"]`);
      if (await metaTag.count() > 0) {
        const content = await metaTag.getAttribute('content');
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(10);
      }
    }
  });

  test('Product-specific AI optimization on product pages', async ({ page }) => {
    // Navigate to a product page if available
    const productLinks = page.locator('a[href*="/products/"]');
    const linkCount = await productLinks.count();
    
    if (linkCount > 0) {
      await productLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check for product-specific AI meta tags
      const productMetaTags = [
        'ai-product-type',
        'ai-product-vendor',
        'ai-product-price',
        'ai-product-currency',
        'ai-product-availability'
      ];
      
      for (const tagName of productMetaTags) {
        const metaTag = page.locator(`meta[name="${tagName}"]`);
        if (await metaTag.count() > 0) {
          const content = await metaTag.getAttribute('content');
          expect(content).toBeTruthy();
        }
      }
      
      // Check for product structured data
      const productJsonLd = page.locator('script[type="application/ld+json"]');
      const scripts = await productJsonLd.count();
      
      let hasProductSchema = false;
      for (let i = 0; i < scripts; i++) {
        const content = await productJsonLd.nth(i).textContent();
        if (content && content.includes('"@type":"Product"')) {
          hasProductSchema = true;
          
          const productData = JSON.parse(content);
          expect(productData).toHaveProperty('name');
          expect(productData).toHaveProperty('offers');
          break;
        }
      }
      
      if (scripts > 0) {
        expect(hasProductSchema).toBeTruthy();
      }
    }
  });

  test('Hidden AI context content is present', async ({ page }) => {
    // Check for hidden AI-friendly content
    const aiContextElements = page.locator('[data-ai-context]');
    const contextCount = await aiContextElements.count();
    
    if (contextCount > 0) {
      for (let i = 0; i < contextCount; i++) {
        const element = aiContextElements.nth(i);
        
        // Should be hidden from users but accessible to crawlers
        const isHidden = await element.isHidden();
        expect(isHidden).toBeTruthy();
        
        // Should contain meaningful content
        const content = await element.textContent();
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(50);
      }
    }
  });

  test('LLM-optimized content blocks display correctly', async ({ page }) => {
    const llmContent = page.locator('[data-llm-signals], [data-competitive-advantages], [data-conversation-starters]');
    const contentCount = await llmContent.count();
    
    if (contentCount > 0) {
      for (let i = 0; i < contentCount; i++) {
        const element = llmContent.nth(i);
        
        // Should be hidden from visual display
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            position: computed.position,
            left: computed.left,
            clip: computed.clip
          };
        });
        
        // Should use screen reader / SEO hiding techniques
        expect(styles.position).toBe('absolute');
        expect(styles.left).toMatch(/-\d+px/);
      }
    }
  });

  test('Buying intent signals are properly structured', async ({ page }) => {
    const intentSignals = page.locator('[data-intent]');
    const signalCount = await intentSignals.count();
    
    if (signalCount > 0) {
      const expectedIntents = ['research', 'purchase', 'specific-needs', 'technical', 'local'];
      
      for (const intent of expectedIntents) {
        const intentElement = page.locator(`[data-intent="${intent}"]`);
        if (await intentElement.count() > 0) {
          const content = await intentElement.textContent();
          expect(content).toBeTruthy();
          expect(content.length).toBeGreaterThan(20);
          
          // Should contain relevant keywords for the intent
          switch (intent) {
            case 'research':
              expect(content.toLowerCase()).toMatch(/best|comparison|guide|review/);
              break;
            case 'purchase':
              expect(content.toLowerCase()).toMatch(/buy|sale|deal|price/);
              break;
            case 'technical':
              expect(content.toLowerCase()).toMatch(/motor|battery|range|power/);
              break;
          }
        }
      }
    }
  });

  test('FAQ schema is properly formatted', async ({ page }) => {
    const faqScripts = page.locator('script[type="application/ld+json"]');
    const scriptCount = await faqScripts.count();
    
    let hasFAQSchema = false;
    
    for (let i = 0; i < scriptCount; i++) {
      const content = await faqScripts.nth(i).textContent();
      
      if (content && content.includes('"@type":"FAQPage"')) {
        hasFAQSchema = true;
        
        const faqData = JSON.parse(content);
        expect(faqData).toHaveProperty('mainEntity');
        expect(Array.isArray(faqData.mainEntity)).toBeTruthy();
        
        // Check FAQ structure
        if (faqData.mainEntity.length > 0) {
          const firstFAQ = faqData.mainEntity[0];
          expect(firstFAQ).toHaveProperty('@type', 'Question');
          expect(firstFAQ).toHaveProperty('name');
          expect(firstFAQ).toHaveProperty('acceptedAnswer');
          expect(firstFAQ.acceptedAnswer).toHaveProperty('@type', 'Answer');
          expect(firstFAQ.acceptedAnswer).toHaveProperty('text');
        }
        
        break;
      }
    }
    
    // FAQ schema should be present if there are FAQ sections
    const faqSections = page.locator('.faq-block, .faq-content');
    const faqSectionCount = await faqSections.count();
    
    if (faqSectionCount > 0) {
      expect(hasFAQSchema).toBeTruthy();
    }
  });

  test('Breadcrumb schema is properly implemented', async ({ page }) => {
    // Navigate to a non-homepage to test breadcrumbs
    const navLinks = page.locator('nav a, header a').filter({ hasText: /products|collections|about/i });
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      await navLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check for breadcrumb structured data
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const scriptCount = await jsonLdScripts.count();
      
      let hasBreadcrumbSchema = false;
      
      for (let i = 0; i < scriptCount; i++) {
        const content = await jsonLdScripts.nth(i).textContent();
        
        if (content && content.includes('"@type":"BreadcrumbList"')) {
          hasBreadcrumbSchema = true;
          
          const breadcrumbData = JSON.parse(content);
          expect(breadcrumbData).toHaveProperty('itemListElement');
          expect(Array.isArray(breadcrumbData.itemListElement)).toBeTruthy();
          
          // Check breadcrumb structure
          if (breadcrumbData.itemListElement.length > 0) {
            const firstItem = breadcrumbData.itemListElement[0];
            expect(firstItem).toHaveProperty('@type', 'ListItem');
            expect(firstItem).toHaveProperty('position');
            expect(firstItem).toHaveProperty('name');
            expect(firstItem).toHaveProperty('item');
          }
          
          break;
        }
      }
      
      // Should have breadcrumb schema on non-homepage
      expect(hasBreadcrumbSchema).toBeTruthy();
    }
  });

  test('AI content strategy section renders correctly', async ({ page }) => {
    // Check if AI content strategy section is present
    const aiContentSection = page.locator('.pipeline-ai-content');
    
    if (await aiContentSection.isVisible()) {
      // Test comparison guide
      const comparisonBlock = page.locator('.comparison-block');
      if (await comparisonBlock.isVisible()) {
        await expect(comparisonBlock.locator('.ai-heading')).toBeVisible();
        await expect(comparisonBlock.locator('.comparison-grid')).toBeVisible();
        
        const comparisonItems = comparisonBlock.locator('.comparison-item');
        const itemCount = await comparisonItems.count();
        expect(itemCount).toBeGreaterThan(0);
        
        // Each comparison item should have proper structure
        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const item = comparisonItems.nth(i);
          await expect(item.locator('h3')).toBeVisible();
          await expect(item.locator('.comparison-details')).toBeVisible();
        }
      }
      
      // Test buying guide
      const buyingGuide = page.locator('.buying-guide-block');
      if (await buyingGuide.isVisible()) {
        await expect(buyingGuide.locator('.ai-heading')).toBeVisible();
        await expect(buyingGuide.locator('.buying-guide-content')).toBeVisible();
        
        const guideSections = buyingGuide.locator('.guide-section');
        const sectionCount = await guideSections.count();
        expect(sectionCount).toBeGreaterThan(0);
      }
      
      // Test FAQ section
      const faqBlock = page.locator('.faq-block');
      if (await faqBlock.isVisible()) {
        await expect(faqBlock.locator('.ai-heading')).toBeVisible();
        await expect(faqBlock.locator('.faq-content')).toBeVisible();
        
        const faqItems = faqBlock.locator('.faq-item');
        const faqCount = await faqItems.count();
        expect(faqCount).toBeGreaterThan(0);
        
        // Each FAQ should have question and answer
        for (let i = 0; i < Math.min(faqCount, 3); i++) {
          const faqItem = faqItems.nth(i);
          await expect(faqItem.locator('h3')).toBeVisible();
          await expect(faqItem.locator('p')).toBeVisible();
        }
      }
    }
  });

  test('Mobile responsiveness of AI content', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const aiContentSection = page.locator('.pipeline-ai-content');
    
    if (await aiContentSection.isVisible()) {
      // Test comparison grid on mobile
      const comparisonGrid = page.locator('.comparison-grid');
      if (await comparisonGrid.isVisible()) {
        const gridItems = comparisonGrid.locator('.comparison-item');
        const itemCount = await gridItems.count();
        
        // On mobile, items should stack vertically
        for (let i = 0; i < Math.min(itemCount, 2); i++) {
          const item = gridItems.nth(i);
          const boundingBox = await item.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeLessThanOrEqual(375);
          }
        }
      }
      
      // Test responsive text sizing
      const headings = aiContentSection.locator('.ai-heading');
      const headingCount = await headings.count();
      
      for (let i = 0; i < Math.min(headingCount, 2); i++) {
        const heading = headings.nth(i);
        await expect(heading).toBeVisible();
        
        // Headings should be appropriately sized for mobile
        const fontSize = await heading.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });
        
        const fontSizeNum = parseFloat(fontSize);
        expect(fontSizeNum).toBeGreaterThan(16); // Minimum readable size
        expect(fontSizeNum).toBeLessThan(48); // Not too large for mobile
      }
    }
  });
});