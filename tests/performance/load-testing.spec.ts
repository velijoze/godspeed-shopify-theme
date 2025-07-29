import { test, expect } from '@playwright/test';

test.describe('Performance and Load Testing', () => {
  test.describe('Core Web Vitals', () => {
    test('Homepage meets Core Web Vitals targets', async ({ page }) => {
      // Start performance measurement
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Measure Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let lcp = 0;
          let fid = 0;
          let cls = 0;
          let fcp = 0;
          let ttfb = 0;
          
          // Observe LCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            lcp = entries[entries.length - 1].startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Observe FID
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            fid = entries[0].processingStart - entries[0].startTime;
          }).observe({ entryTypes: ['first-input'] });
          
          // Observe CLS
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              if (!entry.hadRecentInput) {
                cls += entry.value;
              }
            });
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Get other metrics
          const paintEntries = performance.getEntriesByType('paint');
          fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
          
          const navEntries = performance.getEntriesByType('navigation');
          ttfb = navEntries[0]?.responseStart || 0;
          
          // Wait for metrics to be collected
          setTimeout(() => {
            resolve({ lcp, fid, cls, fcp, ttfb });
          }, 5000);
        });
      });
      
      // Assert Core Web Vitals thresholds
      expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
      expect(metrics.cls).toBeLessThan(0.1); // CLS < 0.1
      expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s
      expect(metrics.ttfb).toBeLessThan(800); // TTFB < 800ms
      
      console.log('Core Web Vitals:', metrics);
    });

    test('Product page performance', async ({ page }) => {
      await page.goto('/products/premium-ebike', { waitUntil: 'networkidle' });
      
      // Measure page weight
      const resourceSizes = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        const sizes = {
          total: 0,
          images: 0,
          scripts: 0,
          stylesheets: 0,
          fonts: 0
        };
        
        resources.forEach(resource => {
          sizes.total += resource.transferSize || 0;
          
          if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) {
            sizes.images += resource.transferSize || 0;
          } else if (resource.name.match(/\.js/i)) {
            sizes.scripts += resource.transferSize || 0;
          } else if (resource.name.match(/\.css/i)) {
            sizes.stylesheets += resource.transferSize || 0;
          } else if (resource.name.match(/\.(woff|woff2|ttf|otf)/i)) {
            sizes.fonts += resource.transferSize || 0;
          }
        });
        
        return sizes;
      });
      
      // Assert resource budget
      expect(resourceSizes.total).toBeLessThan(3 * 1024 * 1024); // Total < 3MB
      expect(resourceSizes.images).toBeLessThan(2 * 1024 * 1024); // Images < 2MB
      expect(resourceSizes.scripts).toBeLessThan(500 * 1024); // Scripts < 500KB
      
      console.log('Resource sizes (KB):', {
        total: Math.round(resourceSizes.total / 1024),
        images: Math.round(resourceSizes.images / 1024),
        scripts: Math.round(resourceSizes.scripts / 1024),
        stylesheets: Math.round(resourceSizes.stylesheets / 1024),
        fonts: Math.round(resourceSizes.fonts / 1024)
      });
    });
  });

  test.describe('Load Testing', () => {
    test('Concurrent user simulation', async ({ browser }) => {
      const userCount = 50; // Simulate 50 concurrent users
      const contexts = [];
      const results = [];
      
      // Create multiple browser contexts
      for (let i = 0; i < userCount; i++) {
        contexts.push(await browser.newContext());
      }
      
      // Simulate concurrent user actions
      const userActions = contexts.map(async (context, index) => {
        const page = await context.newPage();
        const startTime = Date.now();
        
        try {
          // User journey simulation
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          const homeLoadTime = Date.now() - startTime;
          
          // Browse products
          await page.click('.pipeline-product-card >> nth=0');
          const productLoadTime = Date.now() - startTime - homeLoadTime;
          
          // Add to cart
          await page.click('button:has-text("Add to Cart")');
          await page.waitForSelector('.cart-notification');
          const addToCartTime = Date.now() - startTime - homeLoadTime - productLoadTime;
          
          results.push({
            user: index + 1,
            success: true,
            homeLoadTime,
            productLoadTime,
            addToCartTime,
            totalTime: Date.now() - startTime
          });
        } catch (error) {
          results.push({
            user: index + 1,
            success: false,
            error: error.message,
            totalTime: Date.now() - startTime
          });
        } finally {
          await context.close();
        }
      });
      
      // Execute all user simulations concurrently
      await Promise.all(userActions);
      
      // Analyze results
      const successRate = results.filter(r => r.success).length / results.length * 100;
      const avgLoadTime = results.reduce((sum, r) => sum + (r.totalTime || 0), 0) / results.length;
      const errors = results.filter(r => !r.success);
      
      console.log('Load Test Results:', {
        totalUsers: userCount,
        successRate: `${successRate.toFixed(2)}%`,
        averageResponseTime: `${avgLoadTime.toFixed(0)}ms`,
        errors: errors.length,
        errorDetails: errors.slice(0, 5) // First 5 errors
      });
      
      // Assert performance under load
      expect(successRate).toBeGreaterThan(95); // > 95% success rate
      expect(avgLoadTime).toBeLessThan(10000); // < 10s average response
    });

    test('API endpoint stress test', async ({ request }) => {
      const endpoints = [
        '/api/products',
        '/api/collections',
        '/api/search?q=ebike',
        '/api/cart',
        '/api/shipping/rates'
      ];
      
      const requestsPerEndpoint = 100;
      const results = {};
      
      for (const endpoint of endpoints) {
        const endpointResults = [];
        const requests = [];
        
        // Create batch requests
        for (let i = 0; i < requestsPerEndpoint; i++) {
          requests.push(
            request.get(endpoint).then(response => {
              const endTime = Date.now();
              return {
                status: response.status(),
                time: response.headers()['x-response-time'] || 'N/A',
                success: response.status() >= 200 && response.status() < 300
              };
            })
          );
        }
        
        // Execute requests
        const startTime = Date.now();
        const responses = await Promise.all(requests);
        const totalTime = Date.now() - startTime;
        
        // Calculate metrics
        const successCount = responses.filter(r => r.success).length;
        const errorCount = responses.filter(r => !r.success).length;
        const avgResponseTime = totalTime / requestsPerEndpoint;
        
        results[endpoint] = {
          totalRequests: requestsPerEndpoint,
          successCount,
          errorCount,
          successRate: (successCount / requestsPerEndpoint * 100).toFixed(2) + '%',
          avgResponseTime: avgResponseTime.toFixed(0) + 'ms',
          requestsPerSecond: (requestsPerEndpoint / (totalTime / 1000)).toFixed(2)
        };
      }
      
      console.log('API Stress Test Results:', results);
      
      // Assert API performance
      Object.values(results).forEach(result => {
        expect(parseFloat(result.successRate)).toBeGreaterThan(99);
        expect(parseFloat(result.avgResponseTime)).toBeLessThan(500);
      });
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('Memory leak detection', async ({ page }) => {
      // Navigate to a heavy page
      await page.goto('/collections/all');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
          };
        }
        return null;
      });
      
      // Perform memory-intensive operations
      for (let i = 0; i < 10; i++) {
        // Scroll to load more products
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        
        // Open and close quick view modals
        const productCard = page.locator('.pipeline-product-card').nth(i);
        if (await productCard.isVisible()) {
          await productCard.hover();
          await productCard.locator('[data-quick-view]').click();
          await page.waitForSelector('.quick-view-modal');
          await page.click('.quick-view-modal [aria-label="Close"]');
        }
      }
      
      // Force garbage collection
      await page.evaluate(() => {
        if (global.gc) {
          global.gc();
        }
      });
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
          };
        }
        return null;
      });
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const percentIncrease = (memoryIncrease / initialMemory.usedJSHeapSize) * 100;
        
        console.log('Memory Usage:', {
          initial: Math.round(initialMemory.usedJSHeapSize / 1024 / 1024) + 'MB',
          final: Math.round(finalMemory.usedJSHeapSize / 1024 / 1024) + 'MB',
          increase: Math.round(memoryIncrease / 1024 / 1024) + 'MB',
          percentIncrease: percentIncrease.toFixed(2) + '%'
        });
        
        // Assert no significant memory leak
        expect(percentIncrease).toBeLessThan(50); // Less than 50% increase
      }
    });

    test('Network request optimization', async ({ page }) => {
      const requests = [];
      
      // Monitor all network requests
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          headers: request.headers()
        });
      });
      
      // Load homepage
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Analyze requests
      const analysis = {
        total: requests.length,
        byType: {},
        duplicates: [],
        largeSizeWarnings: [],
        missingCompression: [],
        missingCache: []
      };
      
      // Group by resource type
      requests.forEach(req => {
        const type = req.resourceType;
        analysis.byType[type] = (analysis.byType[type] || 0) + 1;
      });
      
      // Find duplicates
      const urlCounts = {};
      requests.forEach(req => {
        urlCounts[req.url] = (urlCounts[req.url] || 0) + 1;
      });
      analysis.duplicates = Object.entries(urlCounts)
        .filter(([url, count]) => count > 1)
        .map(([url, count]) => ({ url, count }));
      
      // Check for optimization issues
      const responses = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map(entry => ({
          name: entry.name,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize,
          decodedBodySize: entry.decodedBodySize
        }));
      });
      
      responses.forEach(response => {
        // Check for large resources
        if (response.transferSize > 500 * 1024) { // > 500KB
          analysis.largeSizeWarnings.push({
            url: response.name,
            size: Math.round(response.transferSize / 1024) + 'KB'
          });
        }
        
        // Check for missing compression
        if (response.encodedBodySize === response.decodedBodySize && 
            response.decodedBodySize > 10 * 1024) { // > 10KB uncompressed
          analysis.missingCompression.push(response.name);
        }
      });
      
      console.log('Network Analysis:', analysis);
      
      // Assert optimization targets
      expect(analysis.duplicates.length).toBeLessThan(5);
      expect(analysis.largeSizeWarnings.length).toBeLessThan(10);
      expect(analysis.missingCompression.length).toBeLessThan(5);
    });
  });

  test.describe('Mobile Performance', () => {
    test.use({
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });

    test('Mobile page performance', async ({ page }) => {
      // Enable CPU throttling
      const client = await page.context().newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      
      // Enable network throttling (3G)
      await page.route('**/*', route => route.continue());
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 150 // 150ms
      });
      
      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      // Get mobile-specific metrics
      const metrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: entries.domContentLoadedEventEnd - entries.domContentLoadedEventStart,
          loadComplete: entries.loadEventEnd - entries.loadEventStart,
          renderTime: entries.responseEnd - entries.requestStart
        };
      });
      
      console.log('Mobile Performance:', {
        totalLoadTime: loadTime + 'ms',
        metrics
      });
      
      // Assert mobile performance targets
      expect(loadTime).toBeLessThan(10000); // < 10s on 3G
      expect(metrics.domContentLoaded).toBeLessThan(3000); // < 3s
    });
  });
});