import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting test suite cleanup...');
  
  try {
    const resultsDir = path.join(process.cwd(), 'test-results');
    
    // Generate comprehensive test report
    console.log('📊 Generating comprehensive test report...');
    
    const reportData = {
      timestamp: new Date().toISOString(),
      configuration: {
        projects: config.projects.map(p => ({
          name: p.name,
          testMatch: p.testMatch,
          use: {
            browserName: p.use.browserName,
            viewport: p.use.viewport,
            userAgent: p.use.userAgent
          }
        })),
        workers: config.workers,
        timeout: config.timeout,
        retries: config.retries
      },
      testSuiteTypes: [
        'Unit Tests',
        'Integration Tests (SIT)', 
        'User Acceptance Tests (UAT)',
        'Performance Tests',
        'Load Tests',
        'Cross-browser Tests',
        'Mobile Tests',
        'Accessibility Tests'
      ]
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'test-configuration.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    // Read and parse test results if they exist
    const resultsFile = path.join(resultsDir, 'results.json');
    if (fs.existsSync(resultsFile)) {
      try {
        const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        
        const summary = {
          totalTests: results.suites?.reduce((total: number, suite: any) => {
            return total + (suite.specs?.length || 0);
          }, 0) || 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: results.stats?.duration || 0,
          projects: results.suites?.map((suite: any) => suite.title) || []
        };
        
        // Count test outcomes
        results.suites?.forEach((suite: any) => {
          suite.specs?.forEach((spec: any) => {
            spec.tests?.forEach((test: any) => {
              test.results?.forEach((result: any) => {
                switch (result.status) {
                  case 'passed':
                    summary.passed++;
                    break;
                  case 'failed':
                    summary.failed++;
                    break;
                  case 'skipped':
                    summary.skipped++;
                    break;
                }
              });
            });
          });
        });
        
        console.log('📈 Test Execution Summary:');
        console.log(`   Total Tests: ${summary.totalTests}`);
        console.log(`   ✅ Passed: ${summary.passed}`);
        console.log(`   ❌ Failed: ${summary.failed}`);
        console.log(`   ⏭️  Skipped: ${summary.skipped}`);
        console.log(`   ⏱️  Duration: ${Math.round(summary.duration / 1000)}s`);
        console.log(`   🗂️  Projects: ${summary.projects.join(', ')}`);
        
        // Save summary
        fs.writeFileSync(
          path.join(resultsDir, 'test-summary.json'),
          JSON.stringify(summary, null, 2)
        );
        
        // Generate failure analysis if there are failures
        if (summary.failed > 0) {
          console.log('🔍 Analyzing test failures...');
          
          const failures: any[] = [];
          results.suites?.forEach((suite: any) => {
            suite.specs?.forEach((spec: any) => {
              spec.tests?.forEach((test: any) => {
                test.results?.forEach((result: any) => {
                  if (result.status === 'failed') {
                    failures.push({
                      suite: suite.title,
                      test: test.title,
                      error: result.error?.message || 'Unknown error',
                      duration: result.duration
                    });
                  }
                });
              });
            });
          });
          
          fs.writeFileSync(
            path.join(resultsDir, 'failures.json'),
            JSON.stringify(failures, null, 2)
          );
          
          console.log(`📝 ${failures.length} failures documented in failures.json`);
        }
        
      } catch (error) {
        console.warn('⚠️  Could not parse test results:', error.message);
      }
    }
    
    // Clean up temporary files
    console.log('🧹 Cleaning up temporary files...');
    
    const tempFiles = [
      'test-results/auth.json',
      'test-results/.last-run.json'
    ];
    
    tempFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   🗑️  Removed ${file}`);
      }
    });
    
    // Compress screenshots and videos if they exist
    const screenshotsDir = path.join(process.cwd(), 'tests', 'screenshots');
    if (fs.existsSync(screenshotsDir)) {
      const screenshots = fs.readdirSync(screenshotsDir);
      console.log(`📸 ${screenshots.length} screenshots captured`);
    }
    
    const videosDir = path.join(resultsDir, 'videos');
    if (fs.existsSync(videosDir)) {
      const videos = fs.readdirSync(videosDir);
      console.log(`🎥 ${videos.length} videos recorded`);
    }
    
    // Generate final report
    const finalReport = {
      testSuite: 'Godspeed E-bike Store Comprehensive Testing',
      executionTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      ci: !!process.env.CI,
      baseURL: config.projects[0].use.baseURL,
      testTypes: {
        unit: 'Component-level functionality testing',
        integration: 'System integration testing (SIT)',
        acceptance: 'User acceptance testing (UAT)', 
        performance: 'Load and performance testing',
        crossBrowser: 'Multi-browser compatibility',
        accessibility: 'WCAG 2.1 AA compliance',
        mobile: 'Mobile device testing'
      },
      recommendations: [
        'Monitor Core Web Vitals continuously',
        'Run full test suite before each deployment',
        'Update test data fixtures monthly',
        'Review failed tests and update selectors as needed',
        'Maintain test environment parity with production'
      ]
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'final-report.json'),
      JSON.stringify(finalReport, null, 2)
    );
    
    console.log('✅ Test suite cleanup completed');
    console.log('📁 Test artifacts saved in test-results/');
    console.log('🎯 Next steps: Review test results and address any failures');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  }
}

export default globalTeardown;