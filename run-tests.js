const { chromium } = require('playwright');

async function runTests() {
  console.log('Starting Pipeline Features Tests...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = {
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Test 1: Pipeline Product Cards
  console.log('Test 1: Testing Pipeline Product Cards...');
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/');
    await page.waitForLoadState('networkidle');
    
    const productCards = await page.locator('.pipeline-product-card').count();
    const firstCard = productCards > 0 ? page.locator('.pipeline-product-card').first() : null;
    
    let quickBuyVisible = false;
    let hoverImage = false;
    
    if (firstCard) {
      await firstCard.hover();
      quickBuyVisible = await firstCard.locator('.quick-buy-wrapper').isVisible();
      hoverImage = await firstCard.locator('.product-card-image-hover').isVisible();
    }
    
    results.tests.push({
      name: 'Pipeline Product Cards',
      status: productCards > 0 ? 'PASSED' : 'FAILED',
      details: {
        productCards: productCards,
        quickBuyOnHover: quickBuyVisible,
        hoverImagePresent: hoverImage
      }
    });
    
    await page.screenshot({ path: 'tests/screenshots/pipeline-product-cards.png', fullPage: true });
  } catch (error) {
    results.tests.push({
      name: 'Pipeline Product Cards',
      status: 'FAILED',
      error: error.message
    });
  }

  // Test 2: Countdown Timer
  console.log('Test 2: Testing Countdown Timer...');
  try {
    const countdownTimers = await page.locator('[data-countdown]').count();
    let isUpdating = false;
    
    if (countdownTimers > 0) {
      const timer = page.locator('[data-countdown]').first();
      const initialSeconds = await timer.locator('[data-seconds]').textContent();
      await page.waitForTimeout(1100);
      const newSeconds = await timer.locator('[data-seconds]').textContent();
      isUpdating = newSeconds !== initialSeconds;
    }
    
    results.tests.push({
      name: 'Countdown Timer',
      status: countdownTimers > 0 ? 'PASSED' : 'FAILED',
      details: {
        timersFound: countdownTimers,
        isUpdating: isUpdating
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Countdown Timer',
      status: 'FAILED',
      error: error.message
    });
  }

  // Test 3: Hero Banner Parallax
  console.log('Test 3: Testing Hero Banner...');
  try {
    const heroBanner = await page.locator('.hero-banner-pipeline').count();
    let parallaxEnabled = false;
    
    if (heroBanner > 0) {
      const banner = page.locator('.hero-banner-pipeline').first();
      const hasParallax = await banner.getAttribute('data-parallax');
      parallaxEnabled = hasParallax === 'true';
    }
    
    results.tests.push({
      name: 'Hero Banner Parallax',
      status: heroBanner > 0 ? 'PASSED' : 'WARNING',
      details: {
        bannersFound: heroBanner,
        parallaxEnabled: parallaxEnabled
      }
    });
    
    await page.screenshot({ path: 'tests/screenshots/pipeline-hero-banner.png' });
  } catch (error) {
    results.tests.push({
      name: 'Hero Banner Parallax',
      status: 'FAILED',
      error: error.message
    });
  }

  // Test 4: Mega Menu
  console.log('Test 4: Testing Mega Menu...');
  try {
    const navigation = await page.locator('nav, .header__nav-menu').first();
    let megaMenuFound = false;
    
    if (await navigation.isVisible()) {
      const menuItems = await navigation.locator('a').count();
      if (menuItems > 0) {
        const firstMenuItem = navigation.locator('a').first();
        await firstMenuItem.hover();
        await page.waitForTimeout(500);
        megaMenuFound = await page.locator('.mega-menu__content').count() > 0;
      }
    }
    
    results.tests.push({
      name: 'Mega Menu',
      status: megaMenuFound ? 'PASSED' : 'WARNING',
      details: {
        megaMenuFound: megaMenuFound
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Mega Menu',
      status: 'FAILED',
      error: error.message
    });
  }

  // Test 5: Quick View Modal
  console.log('Test 5: Testing Quick View Modal...');
  try {
    // First ensure we're on a page with products
    const quickViewButtons = await page.locator('[data-quick-view], .quick-view-button').count();
    let modalOpened = false;
    
    if (quickViewButtons > 0) {
      const firstButton = page.locator('[data-quick-view], .quick-view-button').first();
      await firstButton.click();
      await page.waitForTimeout(1000);
      modalOpened = await page.locator('.quick-view-modal, [data-quick-view-modal]').isVisible();
    }
    
    results.tests.push({
      name: 'Quick View Modal',
      status: modalOpened ? 'PASSED' : 'WARNING',
      details: {
        quickViewButtons: quickViewButtons,
        modalOpened: modalOpened
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Quick View Modal',
      status: 'FAILED',
      error: error.message
    });
  }

  // Test 6: Visual Layout Check
  console.log('Test 6: Visual Layout Check...');
  try {
    await page.goto('https://t0uds3-a2.myshopify.com/');
    await page.waitForLoadState('networkidle');
    
    const report = await page.evaluate(() => {
      const header = document.querySelector('.header-clean, header');
      const nav = document.querySelector('.header__nav-menu, nav');
      const logo = document.querySelector('.header__logo-link, .header-logo');
      const actions = document.querySelector('.header__actions');
      
      return {
        header: { exists: !!header },
        navigation: { exists: !!nav },
        logo: { exists: !!logo },
        actions: { exists: !!actions }
      };
    });
    
    const layoutOk = report.header.exists && report.navigation.exists;
    
    results.tests.push({
      name: 'Visual Layout',
      status: layoutOk ? 'PASSED' : 'FAILED',
      details: report
    });
    
    await page.screenshot({ path: 'tests/screenshots/homepage-full.png', fullPage: true });
  } catch (error) {
    results.tests.push({
      name: 'Visual Layout',
      status: 'FAILED',
      error: error.message
    });
  }

  // Test 7: Performance Metrics
  console.log('Test 7: Performance Check...');
  try {
    const performanceMetrics = await page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domElements: document.querySelectorAll('*').length,
        cssRules: Array.from(document.styleSheets).reduce((total, sheet) => {
          try {
            return total + sheet.cssRules.length;
          } catch (e) {
            return total;
          }
        }, 0)
      };
    });
    
    const performanceOk = performanceMetrics.loadTime < 5000; // 5 seconds
    
    results.tests.push({
      name: 'Performance',
      status: performanceOk ? 'PASSED' : 'WARNING',
      details: performanceMetrics
    });
  } catch (error) {
    results.tests.push({
      name: 'Performance',
      status: 'FAILED',
      error: error.message
    });
  }

  // Calculate summary
  results.summary.total = results.tests.length;
  results.summary.passed = results.tests.filter(t => t.status === 'PASSED').length;
  results.summary.failed = results.tests.filter(t => t.status === 'FAILED').length;
  results.summary.warnings = results.tests.filter(t => t.status === 'WARNING').length;

  await browser.close();

  // Print results
  console.log('\n========================================');
  console.log('PIPELINE FEATURES TEST RESULTS');
  console.log('========================================\n');
  
  results.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${icon} ${test.name}: ${test.status}`);
    if (test.details) {
      console.log('   Details:', JSON.stringify(test.details, null, 2).replace(/\n/g, '\n   '));
    }
    if (test.error) {
      console.log('   Error:', test.error);
    }
    console.log('');
  });

  console.log('\nSUMMARY:');
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`⚠️  Warnings: ${results.summary.warnings}`);
  console.log('\nScreenshots saved to tests/screenshots/');
  
  return results;
}

// Run the tests
runTests().catch(console.error);