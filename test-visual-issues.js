const { chromium } = require('playwright');

async function testVisualIssues() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing visual issues on e-bikes collection page...');
  
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/collections/e-bikes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Test 1: Check product badge sizes
    console.log('\n=== Testing Product Badge Sizes ===');
    const badges = await page.locator('.pipeline-card-badge').count();
    console.log(`Product badges found: ${badges}`);
    
    for (let i = 0; i < badges; i++) {
      const badge = page.locator('.pipeline-card-badge').nth(i);
      const badgeText = await badge.textContent();
      const fontSize = await badge.evaluate(el => window.getComputedStyle(el).fontSize);
      const padding = await badge.evaluate(el => window.getComputedStyle(el).padding);
      const width = await badge.evaluate(el => window.getComputedStyle(el).width);
      const height = await badge.evaluate(el => window.getComputedStyle(el).height);
      
      console.log(`Badge ${i + 1} "${badgeText.trim()}":`);
      console.log(`  Font size: ${fontSize}`);
      console.log(`  Padding: ${padding}`);
      console.log(`  Width: ${width}`);
      console.log(`  Height: ${height}`);
    }
    
    // Test 2: Check price slider and arrows alignment
    console.log('\n=== Testing Price Slider Alignment ===');
    const priceSlider = await page.locator('[data-price-slider]').count();
    console.log(`Price slider found: ${priceSlider}`);
    
    if (priceSlider > 0) {
      const slider = page.locator('[data-price-slider]').first();
      const sliderRect = await slider.boundingBox();
      console.log(`Slider position: x=${sliderRect.x}, y=${sliderRect.y}, width=${sliderRect.width}, height=${sliderRect.height}`);
      
      // Check price arrows
      const priceArrows = await page.locator('[data-price-action]').count();
      console.log(`Price arrows found: ${priceArrows}`);
      
      for (let i = 0; i < priceArrows; i++) {
        const arrow = page.locator('[data-price-action]').nth(i);
        const arrowText = await arrow.textContent();
        const arrowRect = await arrow.boundingBox();
        console.log(`Arrow ${i + 1} "${arrowText}": x=${arrowRect.x}, y=${arrowRect.y}`);
      }
    }
    
    // Test 3: Check for hamburger icon on the left
    console.log('\n=== Testing Hamburger Icon ===');
    const hamburgerIcons = await page.locator('.hamburger-icon, ☰, [data-toggle-filters]').count();
    console.log(`Hamburger icons found: ${hamburgerIcons}`);
    
    // Check for any icons on the left side
    const leftSideIcons = await page.evaluate(() => {
      const icons = document.querySelectorAll('button, .icon, svg');
      const leftIcons = [];
      icons.forEach(icon => {
        const rect = icon.getBoundingClientRect();
        if (rect.x < 100) { // Icons on the left side
          leftIcons.push({
            text: icon.textContent,
            x: rect.x,
            y: rect.y,
            className: icon.className
          });
        }
      });
      return leftIcons;
    });
    console.log('Left side elements:', leftSideIcons);
    
    // Test 4: Check toolbar alignment
    console.log('\n=== Testing Toolbar Alignment ===');
    const toolbar = await page.locator('.pipeline-toolbar').first();
    if (await toolbar.count() > 0) {
      const toolbarRect = await toolbar.boundingBox();
      console.log(`Toolbar position: x=${toolbarRect.x}, y=${toolbarRect.y}, width=${toolbarRect.width}`);
      
      // Check toolbar elements
      const toolbarLeft = await page.locator('.toolbar-left').first();
      const toolbarRight = await page.locator('.toolbar-right').first();
      
      if (await toolbarLeft.count() > 0) {
        const leftRect = await toolbarLeft.boundingBox();
        console.log(`Toolbar left: x=${leftRect.x}, width=${leftRect.width}`);
      }
      
      if (await toolbarRight.count() > 0) {
        const rightRect = await toolbarRight.boundingBox();
        console.log(`Toolbar right: x=${rightRect.x}, width=${rightRect.width}`);
      }
    }
    
    // Test 5: Check grid view toggle alignment
    console.log('\n=== Testing Grid View Toggle ===');
    const gridToggle = await page.locator('.grid-view-toggle').first();
    if (await gridToggle.count() > 0) {
      const toggleRect = await gridToggle.boundingBox();
      console.log(`Grid toggle position: x=${toggleRect.x}, y=${toggleRect.y}`);
      
      const viewButtons = await page.locator('.view-btn').count();
      console.log(`View buttons found: ${viewButtons}`);
      
      for (let i = 0; i < viewButtons; i++) {
        const button = page.locator('.view-btn').nth(i);
        const buttonRect = await button.boundingBox();
        const buttonText = await button.textContent();
        console.log(`View button ${i + 1} "${buttonText.trim()}": x=${buttonRect.x}, y=${buttonRect.y}`);
      }
    }
    
    // Test 6: Check overall layout spacing
    console.log('\n=== Testing Layout Spacing ===');
    const container = await page.locator('.pipeline-collection-container').first();
    if (await container.count() > 0) {
      const containerRect = await container.boundingBox();
      console.log(`Container: width=${containerRect.width}, height=${containerRect.height}`);
      
      const layout = await page.locator('.pipeline-collection-layout').first();
      const layoutRect = await layout.boundingBox();
      console.log(`Layout: x=${layoutRect.x}, width=${layoutRect.width}`);
    }
    
    // Test 7: Check for any visual glitches
    console.log('\n=== Testing for Visual Glitches ===');
    const overlappingElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const overlaps = [];
      for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
          const rect1 = elements[i].getBoundingClientRect();
          const rect2 = elements[j].getBoundingClientRect();
          if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
              rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
            overlaps.push({
              element1: elements[i].className,
              element2: elements[j].className
            });
          }
        }
      }
      return overlaps;
    });
    console.log('Overlapping elements:', overlappingElements.length);
    
    // Take screenshots for visual inspection
    await page.screenshot({ path: 'visual-issues-desktop.png', fullPage: true });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'visual-issues-mobile.png', fullPage: true });
    
    console.log('\nScreenshots saved: visual-issues-desktop.png, visual-issues-mobile.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
}

testVisualIssues(); 