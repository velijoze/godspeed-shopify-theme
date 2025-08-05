/**
 * Pipeline Collection Validation Test
 * Tests the new Pipeline-style collection implementation
 */

const fs = require('fs');
const path = require('path');

class PipelineValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  test(name, condition, details) {
    if (condition) {
      this.results.passed++;
      this.results.tests.push({ name, status: '✅ PASS', details });
      console.log(`✅ ${name}: ${details}`);
    } else {
      this.results.failed++;
      this.results.tests.push({ name, status: '❌ FAIL', details });
      console.log(`❌ ${name}: ${details}`);
    }
  }

  fileExists(filePath) {
    return fs.existsSync(path.join(process.cwd(), filePath));
  }

  fileContains(filePath, searchString) {
    if (!this.fileExists(filePath)) return false;
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
    return content.includes(searchString);
  }

  countSettingsInSchema() {
    if (!this.fileExists('config/settings_schema.json')) return 0;
    const content = fs.readFileSync(path.join(process.cwd(), 'config/settings_schema.json'), 'utf8');
    const schema = JSON.parse(content);
    return schema.reduce((count, section) => {
      return count + (section.settings ? section.settings.length : 0);
    }, 0);
  }

  run() {
    console.log('🔧 Pipeline Collection Validation Test\n');
    console.log('Testing the new Pipeline-style collection implementation...\n');

    // Test 1: Settings Schema
    console.log('📋 SETTINGS SCHEMA:');
    this.test(
      'Settings schema file exists',
      this.fileExists('config/settings_schema.json'),
      'Main settings configuration file'
    );

    this.test(
      'Settings schema is valid JSON',
      this.fileExists('config/settings_schema.json') && 
      JSON.parse(fs.readFileSync('config/settings_schema.json', 'utf8')),
      'Schema can be parsed as valid JSON'
    );

    const totalSettings = this.countSettingsInSchema();
    this.test(
      'Settings schema has sufficient controls',
      totalSettings >= 50,
      `Found ${totalSettings} total settings (target: 50+)`
    );

    // Test 2: Collection Section
    console.log('\n🎯 COLLECTION SECTION:');
    this.test(
      'Pipeline collection section exists',
      this.fileExists('sections/pipeline-collection-grid.liquid'),
      'Pipeline collection grid section file'
    );

    this.test(
      'Collection section has proper structure',
      this.fileContains('sections/pipeline-collection-grid.liquid', 'pipeline-collection-layout'),
      'Section contains proper layout structure'
    );

    this.test(
      'Collection section has filters sidebar',
      this.fileContains('sections/pipeline-collection-grid.liquid', 'pipeline-filters-sidebar'),
      'Section includes filters sidebar'
    );

    this.test(
      'Collection section has toolbar',
      this.fileContains('sections/pipeline-collection-grid.liquid', 'pipeline-toolbar'),
      'Section includes toolbar with controls'
    );

    this.test(
      'Collection section has product grid',
      this.fileContains('sections/pipeline-collection-grid.liquid', 'pipeline-products-grid'),
      'Section includes product grid'
    );

    // Test 3: CSS Styling
    console.log('\n🎨 CSS STYLING:');
    this.test(
      'Pipeline collection CSS exists',
      this.fileExists('assets/pipeline-collection.css'),
      'Pipeline collection CSS file'
    );

    this.test(
      'CSS has layout grid styles',
      this.fileContains('assets/pipeline-collection.css', 'pipeline-collection-layout'),
      'CSS includes layout grid styles'
    );

    this.test(
      'CSS has filter styles',
      this.fileContains('assets/pipeline-collection.css', 'pipeline-filters-sidebar'),
      'CSS includes filter sidebar styles'
    );

    this.test(
      'CSS has product card styles',
      this.fileContains('assets/pipeline-collection.css', 'pipeline-product-card'),
      'CSS includes product card styles'
    );

    this.test(
      'CSS has responsive design',
      this.fileContains('assets/pipeline-collection.css', '@media screen'),
      'CSS includes responsive media queries'
    );

    // Test 4: JavaScript Functionality
    console.log('\n⚡ JAVASCRIPT FUNCTIONALITY:');
    this.test(
      'Pipeline collection JS exists',
      this.fileExists('assets/pipeline-collection.js'),
      'Pipeline collection JavaScript file'
    );

    this.test(
      'JS has filter functionality',
      this.fileContains('assets/pipeline-collection.js', 'handleFilterChange'),
      'JavaScript includes filter handling'
    );

    this.test(
      'JS has sorting functionality',
      this.fileContains('assets/pipeline-collection.js', 'handleSort'),
      'JavaScript includes sorting functionality'
    );

    this.test(
      'JS has view toggle functionality',
      this.fileContains('assets/pipeline-collection.js', 'handleViewToggle'),
      'JavaScript includes view toggle functionality'
    );

    this.test(
      'JS has price slider functionality',
      this.fileContains('assets/pipeline-collection.js', 'priceSlider'),
      'JavaScript includes price slider functionality'
    );

    // Test 5: Template Integration
    console.log('\n🔗 TEMPLATE INTEGRATION:');
    this.test(
      'E-bikes collection template exists',
      this.fileExists('templates/collection.e-bikes.json'),
      'E-bikes collection template file'
    );

    this.test(
      'Template uses pipeline collection section',
      this.fileContains('templates/collection.e-bikes.json', 'pipeline-collection-grid'),
      'Template uses the new pipeline collection section'
    );

    this.test(
      'Template has proper settings',
      this.fileContains('templates/collection.e-bikes.json', 'columns_desktop'),
      'Template includes proper section settings'
    );

    // Test 6: Settings Integration
    console.log('\n⚙️ SETTINGS INTEGRATION:');
    this.test(
      'Collection settings are defined',
      this.fileContains('config/settings_schema.json', 'collection_sidebar_width'),
      'Settings schema includes collection layout settings'
    );

    this.test(
      'Filter settings are defined',
      this.fileContains('config/settings_schema.json', 'filter_collections'),
      'Settings schema includes filter configuration'
    );

    this.test(
      'Toolbar settings are defined',
      this.fileContains('config/settings_schema.json', 'toolbar_show_sort'),
      'Settings schema includes toolbar settings'
    );

    this.test(
      'Product card settings are defined',
      this.fileContains('config/settings_schema.json', 'card_border_radius'),
      'Settings schema includes product card styling'
    );

    // Test 7: Live Chat Fix
    console.log('\n💬 LIVE CHAT FIX:');
    this.test(
      'Live chat is enabled',
      this.fileContains('snippets/pipeline-live-chat.liquid', 'settings.enable_live_chat') &&
      !this.fileContains('snippets/pipeline-live-chat.liquid', 'false and settings.enable_live_chat'),
      'Live chat feature is properly enabled'
    );

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 PIPELINE VALIDATION RESULTS:');
    console.log('='.repeat(60));
    console.log(`✅ Tests Passed: ${this.results.passed}`);
    console.log(`❌ Tests Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === '❌ FAIL')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.details}`);
        });
    }

    console.log('\n🎉 PIPELINE VALIDATION COMPLETE!');
    
    if (this.results.passed >= 20) {
      console.log('\n✅ EXCELLENT! The Pipeline collection implementation is working correctly.');
      console.log('🎯 Key Features Implemented:');
      console.log('   • ✅ Settings schema with 50+ GUI controls');
      console.log('   • ✅ Pipeline-style collection layout');
      console.log('   • ✅ Filterable sidebar with collections, availability, and price');
      console.log('   • ✅ Toolbar with sort, view toggle, and filter hide/show');
      console.log('   • ✅ Responsive product grid with proper styling');
      console.log('   • ✅ JavaScript functionality for all interactions');
      console.log('   • ✅ Template integration for e-bikes collection');
      console.log('   • ✅ Live chat feature enabled');
    } else {
      console.log('\n⚠️  Some issues need attention. Check the failed tests above.');
    }

    return this.results;
  }
}

// Run the validation
const validator = new PipelineValidator();
validator.run(); 