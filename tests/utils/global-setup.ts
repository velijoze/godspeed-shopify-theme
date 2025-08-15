import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Comprehensive Test Suite Setup...');
  
  // Safety check for projects
  if (!config.projects || config.projects.length === 0) {
    throw new Error('No projects configured in Playwright config');
  }
  
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  
  try {
    // Create test results directory
    const resultsDir = path.join(process.cwd(), 'playwright-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Create screenshots directory
    const screenshotsDir = path.join(process.cwd(), 'tests', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Pre-flight checks
    console.log('🔍 Running pre-flight checks...');
    
    const page = await browser.newPage();
    
    // Check if the site is accessible
    try {
      await page.goto(baseURL || 'https://t0uds3-a2.myshopify.com');
      console.log('✅ Site is accessible');
    } catch (error) {
      console.error('❌ Site is not accessible:', error);
      throw new Error('Pre-flight check failed: Site not accessible');
    }
    
    // Check essential elements
    const essentialElements = [
      'header',
      'nav',
      'main',
      'footer'
    ];
    
    for (const element of essentialElements) {
      const exists = await page.locator(element).count() > 0;
      if (exists) {
        console.log(`✅ ${element} element found`);
      } else {
        console.warn(`⚠️  ${element} element not found`);
      }
    }
    
    // Check API endpoints
    console.log('🔌 Checking API endpoints...');
    
    const apiEndpoints = [
      '/api/2023-10/products.json',
      '/api/2023-10/collections.json'
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await page.request.get(baseURL + endpoint);
        if (response.status() === 200) {
          console.log(`✅ API endpoint ${endpoint} is working`);
        } else {
          console.warn(`⚠️  API endpoint ${endpoint} returned ${response.status()}`);
        }
      } catch (error) {
        console.warn(`⚠️  API endpoint ${endpoint} failed:`, error.message);
      }
    }
    
    // Setup test user authentication if needed
    if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
      console.log('🔐 Setting up test user authentication...');
      
      try {
        await page.goto(baseURL + '/account/login');
        await page.fill('input[name="customer[email]"]', process.env.TEST_USER_EMAIL);
        await page.fill('input[name="customer[password]"]', process.env.TEST_USER_PASSWORD);
        await page.click('button:has-text("Sign in")');
        
        // Wait for successful login
        await page.waitForURL('**/account', { timeout: 10000 });
        
        // Save authentication state
        await page.context().storageState({ path: 'playwright-results/auth.json' });
        console.log('✅ Test user authentication saved');
      } catch (error) {
        console.warn('⚠️  Test user authentication failed:', error.message);
      }
    }
    
    // Generate test data
    console.log('📊 Generating test data...');
    
    const testData = {
      timestamp: new Date().toISOString(),
      baseURL: baseURL,
      environment: process.env.NODE_ENV || 'test',
      userAgent: await page.evaluate(() => navigator.userAgent),
      products: [] as Array<{title: string, price: string, url: string}>,
      collections: []
    };
    
    try {
      // Get sample products for testing
      await page.goto(baseURL + '/collections/all');
      const products = await page.locator('.pipeline-product-card').all();
      
      for (let i = 0; i < Math.min(products.length, 5); i++) {
        const product = products[i];
        const title = await product.locator('.card__title').textContent();
        const price = await product.locator('.price').textContent();
        const url = await product.locator('a').first().getAttribute('href');
        
        testData.products.push({
          title: title?.trim() || `Product ${i + 1}`,
          price: price?.trim() || 'Price not found',
          url: url || '#'
        });
      }
      
      console.log(`✅ Captured ${testData.products.length} products for testing`);
    } catch (error) {
      console.warn('⚠️  Failed to capture product data:', error.message);
    }
    
    // Save test data
    fs.writeFileSync(
      path.join(resultsDir, 'test-data.json'),
      JSON.stringify(testData, null, 2)
    );
    
    // Performance baseline
    console.log('📈 Establishing performance baseline...');
    
    const performanceMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const entry = entries[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
          firstByte: entry.responseStart - entry.requestStart,
          domInteractive: entry.domInteractive - entry.fetchStart
        };
      }
      return null;
    });
    
    if (performanceMetrics) {
      fs.writeFileSync(
        path.join(resultsDir, 'performance-baseline.json'),
        JSON.stringify(performanceMetrics, null, 2)
      );
      console.log('✅ Performance baseline established');
    }
    
    await page.close();
    
    // Test environment validation
    console.log('🧪 Validating test environment...');
    
    const environment = {
      node: process.version,
      playwright: require('@playwright/test/package.json').version,
      os: process.platform,
      ci: !!process.env.CI,
      workers: config.workers,
      projects: config.projects.map(p => p.name)
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'environment.json'),
      JSON.stringify(environment, null, 2)
    );
    
    console.log('✅ Global setup completed successfully');
    console.log('📋 Test projects configured:', config.projects.map(p => p.name).join(', '));
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;