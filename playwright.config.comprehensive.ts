import { defineConfig, devices } from '@playwright/test';
/// <reference types="node" />
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Comprehensive Playwright Configuration
 * Supports SWE, SIT, UAT, Performance, and E2E testing
 */
export default defineConfig({
  testDir: './tests',
  
  // Global timeout for each test
  timeout: 60 * 1000,
  
  // Global timeout for expect() assertions
  expect: {
    timeout: 10 * 1000,
  },
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI for consistency
  workers: process.env.CI ? 2 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['github'],
    ['list', { printSteps: true }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL
    baseURL: process.env.SHOPIFY_STORE_URL || 'https://t0uds3-a2.myshopify.com',
    
    // Collect trace when retrying the failed test
    trace: 'retain-on-failure',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
    
    // Default viewport
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Action and navigation timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,de;q=0.8,fr;q=0.7',
    },
    
    // User agent
    userAgent: 'Mozilla/5.0 (compatible; GodspeedTestSuite/1.0; +https://godspeed.ch)',
    
    // Custom test data
    storageState: process.env.CI ? undefined : 'playwright-results/auth.json',
  },

  // Test projects configuration
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      testMatch: [
        'tests/ai-optimization.spec.ts',
        'tests/pipeline-features.spec.ts',
        'tests/veloconnect-integration.spec.ts',
        'tests/visual-check.spec.ts'
      ]
    },
    
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
      testMatch: [
        'tests/ai-optimization.spec.ts',
        'tests/pipeline-features.spec.ts'
      ]
    },
    
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
      testMatch: [
        'tests/pipeline-features.spec.ts',
        'tests/visual-check.spec.ts'
      ]
    },
    
    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: [
        'tests/pipeline-features.spec.ts',
        'tests/uat/customer-journey.spec.ts'
      ]
    },
    
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testMatch: [
        'tests/pipeline-features.spec.ts',
        'tests/uat/customer-journey.spec.ts'
      ]
    },
    
    // UAT Testing Suite
    {
      name: 'uat-comprehensive',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Slower execution for UAT scenarios
        actionTimeout: 30000,
        navigationTimeout: 60000
      },
      testMatch: ['tests/uat/**/*.spec.ts'],
      // Sequential execution for UAT
      fullyParallel: false
    },
    
    // System Integration Testing (SIT)
    {
      name: 'sit-integration',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // API testing configuration
        extraHTTPHeaders: {
          'X-Test-Suite': 'SIT',
          'X-Test-Environment': process.env.NODE_ENV || 'staging'
        }
      },
      testMatch: ['tests/sit/**/*.spec.ts'],
      dependencies: ['uat-comprehensive']
    },
    
    // Performance Testing
    {
      name: 'performance-testing',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Performance testing specific settings
        video: 'off', // Disable video for performance tests
        screenshot: 'off', // Disable screenshots for performance tests
      },
      testMatch: ['tests/performance/**/*.spec.ts'],
      // Run performance tests last
      dependencies: ['chromium-desktop', 'uat-comprehensive']
    },
    
    // Load Testing (Separate project for high resource usage)
    {
      name: 'load-testing',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        video: 'off',
        screenshot: 'off',
        trace: 'off'
      },
      testMatch: ['tests/performance/load-testing.spec.ts'],
      // Restrict workers for load testing
      fullyParallel: false,
      workers: 1,
      timeout: 300 * 1000, // 5 minutes for load tests
    },
    
    // Accessibility Testing
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      testMatch: ['tests/uat/customer-journey.spec.ts'],
      testIgnore: ['**/load-testing.spec.ts', '**/system-integration.spec.ts']
    },
    
    // Cross-language Testing
    {
      name: 'multilingual',
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'de-CH',
        extraHTTPHeaders: {
          'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8'
        }
      },
      testMatch: ['tests/uat/customer-journey.spec.ts']
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/utils/global-setup'),
  globalTeardown: require.resolve('./tests/utils/global-teardown'),

  // Output directory
  outputDir: 'playwright-results/',
  
  // Web server configuration for local development
  webServer: undefined, // Disabled to prevent timeout issues

  // Metadata for test reporting
  metadata: {
    testSuite: 'Godspeed E-bike Store Comprehensive Testing',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'staging',
    url: process.env.SHOPIFY_STORE_URL || 'https://t0uds3-a2.myshopify.com',
    features: [
      'Pipeline Premium Features',
      'VeloConnect API Integration', 
      'AI Traffic Optimization',
      'Live Chat System',
      'Swiss E-commerce Optimization'
    ],
    testTypes: [
      'Unit Testing',
      'Integration Testing (SIT)',
      'User Acceptance Testing (UAT)',
      'Performance Testing',
      'Load Testing',
      'Accessibility Testing',
      'Cross-browser Testing',
      'Multi-language Testing'
    ]
  }
});