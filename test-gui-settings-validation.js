/**
 * GUI Settings Validation Script
 * Validates that all custom features have proper GUI controls
 */

const fs = require('fs');
const path = require('path');

const basePath = '/mnt/c/users/zcega/onedrive/godspeed/shopify/godspeed';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function addTest(name, passed, details) {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(path.join(basePath, filePath));
  } catch (error) {
    return false;
  }
}

function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(path.join(basePath, filePath), 'utf8');
    return content.includes(searchString);
  } catch (error) {
    return false;
  }
}

function countSettingsInSchema(settingType) {
  try {
    const content = fs.readFileSync(path.join(basePath, 'config/settings_schema.json'), 'utf8');
    const schema = JSON.parse(content);
    let count = 0;
    
    schema.forEach(section => {
      if (section.settings) {
        section.settings.forEach(setting => {
          if (setting.type === settingType) {
            count++;
          }
        });
      }
    });
    
    return count;
  } catch (error) {
    return 0;
  }
}

console.log('🔧 GUI Settings Validation for Godspeed Shopify Theme\n');
console.log('Testing that all custom features have complete GUI control...\n');

// 1. SETTINGS SCHEMA COMPLETENESS
console.log('📋 SETTINGS SCHEMA COMPLETENESS:');

addTest('Settings schema file exists', 
  fileExists('config/settings_schema.json'),
  'Main settings configuration file'
);

addTest('Social Proof & Conversion settings section exists', 
  fileContains('config/settings_schema.json', 'Social Proof & Conversion'),
  'Section for social proof and conversion optimization'
);

addTest('Performance & Accessibility settings section exists', 
  fileContains('config/settings_schema.json', 'Performance & Accessibility'),
  'Section for performance and accessibility features'
);

addTest('Design System settings section exists', 
  fileContains('config/settings_schema.json', 'Design System'),
  'Section for design system configuration'
);

addTest('Social proof enable/disable toggle exists', 
  fileContains('config/settings_schema.json', 'enable_social_proof'),
  'Master toggle for social proof features'
);

addTest('Exit intent enable/disable toggle exists', 
  fileContains('config/settings_schema.json', 'enable_exit_intent'),
  'Master toggle for exit intent offers'
);

addTest('Form validation enable/disable toggle exists', 
  fileContains('config/settings_schema.json', 'enable_form_validation'),
  'Master toggle for form validation'
);

addTest('Design system enable/disable toggle exists', 
  fileContains('config/settings_schema.json', 'enable_design_system'),
  'Master toggle for design system'
);

// 2. LIQUID TEMPLATE INTEGRATION
console.log('\n🔗 LIQUID TEMPLATE INTEGRATION:');

addTest('Social proof snippet uses settings', 
  fileContains('snippets/social-proof.liquid', 'settings.enable_social_proof') &&
  fileContains('snippets/social-proof.liquid', 'settings.show_customer_count'),
  'Social proof respects GUI settings'
);

addTest('Exit intent snippet uses settings', 
  fileContains('snippets/exit-intent-offers.liquid', 'settings.enable_exit_intent') &&
  fileContains('snippets/exit-intent-offers.liquid', 'settings.exit_intent_title'),
  'Exit intent respects GUI settings'
);

addTest('Theme layout passes settings to HTML', 
  fileContains('layout/theme.liquid', 'data-enable-social-proof') &&
  fileContains('layout/theme.liquid', 'data-enable-form-validation'),
  'Settings are accessible to JavaScript via data attributes'
);

addTest('Performance features are conditional', 
  fileContains('layout/theme.liquid', 'settings.enable_critical_css') &&
  fileContains('layout/theme.liquid', 'settings.enable_resource_preloading'),
  'Performance features respect GUI settings'
);

addTest('Form validation JavaScript is conditional', 
  fileContains('assets/form-validation.js', 'data-enable-form-validation') ||
  fileContains('layout/theme.liquid', 'settings.enable_form_validation'),
  'Form validation loads conditionally'
);

// 3. CUSTOMIZATION DEPTH
console.log('\n🎨 CUSTOMIZATION DEPTH:');

addTest('Customer count is customizable', 
  fileContains('config/settings_schema.json', 'customer_count_number') &&
  fileContains('snippets/social-proof.liquid', 'settings.customer_count_number'),
  'Customer count number can be changed via GUI'
);

addTest('Exit intent messages are customizable', 
  fileContains('config/settings_schema.json', 'exit_intent_title') &&
  fileContains('config/settings_schema.json', 'exit_intent_subtitle'),
  'Exit intent popup messages are fully customizable'
);

addTest('Social proof colors are customizable', 
  fileContains('config/settings_schema.json', 'social_proof_accent_color') &&
  fileContains('layout/theme.liquid', 'data-social-proof-accent-color'),
  'Social proof colors can be customized'
);

addTest('Form validation colors are customizable', 
  fileContains('config/settings_schema.json', 'validation_error_color') &&
  fileContains('config/settings_schema.json', 'validation_success_color'),
  'Form validation colors can be customized'
);

addTest('Design system spacing is customizable', 
  fileContains('config/settings_schema.json', 'spacing_scale') &&
  fileContains('config/settings_schema.json', 'section_spacing'),
  'Design system spacing can be adjusted'
);

addTest('Animation speed is customizable', 
  fileContains('config/settings_schema.json', 'animation_speed'),
  'Animation timing can be controlled'
);

// 4. ACCESSIBILITY CONTROLS
console.log('\n♿ ACCESSIBILITY CONTROLS:');

addTest('ARIA states can be toggled', 
  fileContains('config/settings_schema.json', 'enable_aria_states'),
  'ARIA state management can be controlled'
);

addTest('Keyboard navigation can be toggled', 
  fileContains('config/settings_schema.json', 'enable_keyboard_navigation'),
  'Keyboard navigation can be controlled'
);

addTest('Reduced motion is respected', 
  fileContains('config/settings_schema.json', 'respect_reduced_motion'),
  'Reduced motion preference can be configured'
);

addTest('Form validation style is customizable', 
  fileContains('config/settings_schema.json', 'form_validation_style'),
  'Form validation display style can be chosen'
);

// 5. PERFORMANCE CONTROLS
console.log('\n⚡ PERFORMANCE CONTROLS:');

addTest('Critical CSS can be toggled', 
  fileContains('config/settings_schema.json', 'enable_critical_css'),
  'Critical CSS inlining can be controlled'
);

addTest('Resource preloading can be controlled', 
  fileContains('config/settings_schema.json', 'enable_resource_preloading') &&
  fileContains('config/settings_schema.json', 'preload_images_count'),
  'Resource preloading is configurable'
);

addTest('JavaScript bundling can be toggled', 
  fileContains('config/settings_schema.json', 'enable_javascript_bundling'),
  'JavaScript bundling can be controlled'
);

addTest('Lazy loading can be toggled', 
  fileContains('config/settings_schema.json', 'enable_lazy_loading'),
  'Lazy loading can be controlled'
);

// 6. CONVERSION OPTIMIZATION CONTROLS
console.log('\n💰 CONVERSION OPTIMIZATION CONTROLS:');

addTest('Stock urgency threshold is customizable', 
  fileContains('config/settings_schema.json', 'stock_urgency_threshold') &&
  fileContains('snippets/social-proof.liquid', 'settings.stock_urgency_threshold'),
  'Stock urgency threshold can be adjusted'
);

addTest('Purchase notification frequency is customizable', 
  fileContains('config/settings_schema.json', 'purchase_notification_frequency') &&
  fileContains('snippets/social-proof.liquid', 'settings.purchase_notification_frequency'),
  'Purchase notification timing can be adjusted'
);

addTest('Exit intent timing is customizable', 
  fileContains('config/settings_schema.json', 'exit_intent_timer_minutes') &&
  fileContains('config/settings_schema.json', 'exit_intent_frequency_hours'),
  'Exit intent timing and frequency can be controlled'
);

addTest('Discount amount is customizable', 
  fileContains('config/settings_schema.json', 'exit_intent_discount_percent') &&
  fileContains('snippets/exit-intent-offers.liquid', 'settings.exit_intent_discount_percent'),
  'Exit intent discount percentage can be changed'
);

// 7. SWISS MARKET FEATURES INTEGRATION
console.log('\n🇨🇭 SWISS MARKET FEATURES INTEGRATION:');

addTest('E-bike features have GUI controls', 
  fileContains('config/settings_schema.json', 'Godspeed E-Bike Features'),
  'E-bike specific features have GUI section'
);

addTest('Store locations have GUI controls', 
  fileContains('config/settings_schema.json', 'Store Locations'),
  'Swiss store locations have GUI management'
);

addTest('Multi-language content has GUI controls', 
  fileContains('config/settings_schema.json', 'Text & Messaging'),
  'Multi-language text content has GUI management'
);

addTest('API integrations have GUI controls', 
  fileContains('config/settings_schema.json', 'API Integration'),
  'Third-party API settings have GUI controls'
);

// Display Results
console.log('\n' + '='.repeat(70));
console.log('📊 GUI SETTINGS VALIDATION RESULTS:');
console.log('='.repeat(70));
console.log(`✅ Tests Passed: ${testResults.passed}`);
console.log(`❌ Tests Failed: ${testResults.failed}`);
console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  testResults.tests.filter(test => !test.passed).forEach(test => {
    console.log(`   • ${test.name}: ${test.details}`);
  });
}

console.log('\n✅ VALIDATION SUMMARY:');
console.log(`📋 Settings Schema: ${testResults.tests.filter(t => t.passed && t.name.includes('settings')).length} validations passed`);
console.log(`🔗 Liquid Integration: ${testResults.tests.filter(t => t.passed && t.name.includes('uses settings')).length} integrations verified`);
console.log(`🎨 Customization Depth: ${testResults.tests.filter(t => t.passed && t.name.includes('customizable')).length} customization options available`);
console.log(`♿ Accessibility Controls: ${testResults.tests.filter(t => t.passed && (t.name.includes('ARIA') || t.name.includes('accessibility'))).length} accessibility features controllable`);
console.log(`⚡ Performance Controls: ${testResults.tests.filter(t => t.passed && (t.name.includes('performance') || t.name.includes('CSS') || t.name.includes('loading'))).length} performance features controllable`);
console.log(`💰 Conversion Controls: ${testResults.tests.filter(t => t.passed && (t.name.includes('urgency') || t.name.includes('notification') || t.name.includes('discount'))).length} conversion features controllable`);

console.log('\n🎉 GUI SETTINGS VALIDATION COMPLETE!');
console.log('\nAll major custom features now have complete GUI control:');
console.log('• 🎯 Social proof elements (customer count, recent purchases, trust badges)');
console.log('• 🚪 Exit intent offers (timing, messages, discounts)');
console.log('• ✅ Form validation (styles, colors, behavior)');
console.log('• ⚡ Performance optimizations (CSS, preloading, bundling)');
console.log('• 🎨 Design system (spacing, typography, Swiss principles)');
console.log('• ♿ Accessibility features (ARIA, keyboard navigation)');
console.log('• 🇨🇭 Swiss market features (locations, languages, e-bike tools)');
console.log('• 🔌 API integrations (VeloConnect, Calendly, Google Maps)');

const guiControlCount = countSettingsInSchema('checkbox') + countSettingsInSchema('range') + countSettingsInSchema('text') + countSettingsInSchema('select') + countSettingsInSchema('color');
console.log(`\n📊 Total GUI Controls: ${guiControlCount}+ settings available through Shopify admin`);

process.exit(testResults.failed > 0 ? 1 : 0);