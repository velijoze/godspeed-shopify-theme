/**
 * Settings Schema Validation Test
 * Tests all 120+ GUI settings for proper structure and accessibility
 */

class SettingsValidationTester {
  constructor() {
    this.testResults = [];
    this.settingsSchema = null;
    this.settingsData = null;
  }

  log(testName, passed, message, details = null) {
    const result = {
      test: testName,
      passed,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`${passed ? '✓' : '✗'} ${testName}: ${message}`);
    if (details) console.log('  Details:', details);
  }

  async loadSettingsFiles() {
    try {
      // Load settings schema
      const schemaResponse = await fetch('/config/settings_schema.json');
      this.settingsSchema = await schemaResponse.json();
      
      // Load settings data
      const dataResponse = await fetch('/config/settings_data.json');
      this.settingsData = await dataResponse.json();
      
      this.log(
        'Settings Files Loaded',
        this.settingsSchema && this.settingsData,
        `Schema: ${this.settingsSchema ? 'loaded' : 'failed'}, Data: ${this.settingsData ? 'loaded' : 'failed'}`
      );
      
      return true;
    } catch (error) {
      this.log('Settings Files Loaded', false, `Failed to load settings: ${error.message}`, error);
      return false;
    }
  }

  async runAllTests() {
    console.log('🔧 Starting Settings Validation Tests...\n');

    const filesLoaded = await this.loadSettingsFiles();
    if (!filesLoaded) {
      console.log('❌ Cannot proceed without settings files');
      return;
    }

    try {
      await this.testSchemaStructure();
      await this.testRequiredPanels();
      await this.testEBikeFeatures();
      await this.testStoreLocations();
      await this.testAIFeatures();
      await this.testAPIIntegration();
      await this.testTextMessaging();
      await this.testSettingsData();
      await this.testSettingTypes();
    } catch (error) {
      this.log('Test Suite', false, `Test suite failed: ${error.message}`, error);
    }

    this.generateReport();
  }

  async testSchemaStructure() {
    this.log(
      'Schema Array Structure',
      Array.isArray(this.settingsSchema),
      `Settings schema is ${Array.isArray(this.settingsSchema) ? 'an array' : 'not an array'}`
    );

    if (Array.isArray(this.settingsSchema)) {
      const totalSettings = this.settingsSchema.reduce((count, section) => {
        return count + (section.settings ? section.settings.length : 0);
      }, 0);

      this.log(
        'Total Settings Count',
        totalSettings >= 120,
        `Found ${totalSettings} settings (target: 120+)`,
        { totalSettings, target: 120 }
      );
    }
  }

  async testRequiredPanels() {
    const requiredPanels = [
      '🔧 Godspeed E-Bike Features',
      '📍 Store Locations',
      '💬 Text & Messaging',
      '🔌 API Integration',
      '🤖 AI Features'
    ];

    const foundPanels = this.settingsSchema
      .filter(section => section.name)
      .map(section => section.name);

    requiredPanels.forEach(panelName => {
      const found = foundPanels.some(name => name.includes(panelName.replace(/[🔧📍💬🔌🤖]\s*/, '')));
      this.log(
        `Panel: ${panelName}`,
        found,
        found ? 'Panel found in schema' : 'Panel missing from schema',
        { searchedFor: panelName, foundPanels }
      );
    });
  }

  async testEBikeFeatures() {
    const eBikePanel = this.settingsSchema.find(section => 
      section.name && section.name.includes('E-Bike Features')
    );

    if (eBikePanel) {
      const requiredFeatures = [
        'enable_bike_comparison',
        'enable_size_guide', 
        'enable_range_calculator',
        'enable_test_ride_booking',
        'enable_service_booking',
        'enable_financing_calculator',
        'enable_warranty_system',
        'enable_interactive_faq',
        'enable_wishlist'
      ];

      const foundSettings = eBikePanel.settings.map(s => s.id);

      requiredFeatures.forEach(feature => {
        this.log(
          `E-Bike Feature: ${feature}`,
          foundSettings.includes(feature),
          foundSettings.includes(feature) ? 'Feature setting found' : 'Feature setting missing',
          { feature, available: foundSettings.includes(feature) }
        );
      });

      this.log(
        'E-Bike Features Count',
        eBikePanel.settings.length >= 15,
        `E-Bike panel has ${eBikePanel.settings.length} settings`,
        { count: eBikePanel.settings.length, expected: '15+' }
      );
    }
  }

  async testStoreLocations() {
    const locationsPanel = this.settingsSchema.find(section => 
      section.name && section.name.includes('Store Locations')
    );

    if (locationsPanel) {
      const cities = ['zurich', 'basel', 'bern', 'geneva', 'luzern', 'stgallen'];
      const locationSettings = locationsPanel.settings.map(s => s.id);

      cities.forEach(city => {
        const citySettings = locationSettings.filter(id => id.includes(city));
        this.log(
          `Store Location: ${city}`,
          citySettings.length >= 3,
          `${city} has ${citySettings.length} settings`,
          { city, settingsCount: citySettings.length, settings: citySettings }
        );
      });

      this.log(
        'Location Settings Count',
        locationsPanel.settings.length >= 100,
        `Locations panel has ${locationsPanel.settings.length} settings`,
        { count: locationsPanel.settings.length, expected: '100+' }
      );
    }
  }

  async testAIFeatures() {
    const aiPanel = this.settingsSchema.find(section => 
      section.name && section.name.includes('AI Features')
    );

    if (aiPanel) {
      const requiredAISettings = [
        'ai_primary_provider',
        'ai_fallback_enabled',
        'claude_api_key',
        'openai_api_key',
        'gemini_api_key'
      ];

      const foundSettings = aiPanel.settings.map(s => s.id);

      requiredAISettings.forEach(setting => {
        this.log(
          `AI Setting: ${setting}`,
          foundSettings.includes(setting),
          foundSettings.includes(setting) ? 'AI setting found' : 'AI setting missing',
          { setting, available: foundSettings.includes(setting) }
        );
      });
    }
  }

  async testAPIIntegration() {
    const apiPanel = this.settingsSchema.find(section => 
      section.name && section.name.includes('API Integration')
    );

    if (apiPanel) {
      const requiredAPISettings = [
        'veloconnect_api_enabled',
        'cube_api_enabled',
        'google_maps_api_key'
      ];

      const foundSettings = apiPanel.settings.map(s => s.id);

      requiredAPISettings.forEach(setting => {
        this.log(
          `API Setting: ${setting}`,
          foundSettings.includes(setting),
          foundSettings.includes(setting) ? 'API setting found' : 'API setting missing',
          { setting, available: foundSettings.includes(setting) }
        );
      });
    }
  }

  async testTextMessaging() {
    const textPanel = this.settingsSchema.find(section => 
      section.name && section.name.includes('Text & Messaging')
    );

    if (textPanel) {
      const languages = ['de', 'fr', 'it'];
      const foundSettings = textPanel.settings.map(s => s.id);

      languages.forEach(lang => {
        const langSettings = foundSettings.filter(id => id.includes(`_${lang}`));
        this.log(
          `Language Settings: ${lang}`,
          langSettings.length > 0,
          `${lang.toUpperCase()} has ${langSettings.length} settings`,
          { language: lang, settingsCount: langSettings.length }
        );
      });
    }
  }

  async testSettingsData() {
    if (!this.settingsData || !this.settingsData.current) {
      this.log('Settings Data Structure', false, 'Settings data structure invalid');
      return;
    }

    const currentSettings = this.settingsData.current;
    
    // Test required settings are present
    const requiredSettings = [
      'enable_live_chat',
      'chat_show_on_mobile'
    ];

    requiredSettings.forEach(setting => {
      this.log(
        `Data Setting: ${setting}`,
        setting in currentSettings,
        setting in currentSettings ? 'Setting found in data' : 'Setting missing from data',
        { setting, value: currentSettings[setting] }
      );
    });

    // Test live chat is enabled
    this.log(
      'Live Chat Enabled',
      currentSettings.enable_live_chat === true,
      `Live chat is ${currentSettings.enable_live_chat ? 'enabled' : 'disabled'}`,
      { value: currentSettings.enable_live_chat }
    );
  }

  async testSettingTypes() {
    const settingTypes = {};
    
    this.settingsSchema.forEach(section => {
      if (section.settings) {
        section.settings.forEach(setting => {
          const type = setting.type;
          settingTypes[type] = (settingTypes[type] || 0) + 1;
        });
      }
    });

    const expectedTypes = ['checkbox', 'text', 'textarea', 'select', 'color', 'number'];
    
    expectedTypes.forEach(type => {
      this.log(
        `Setting Type: ${type}`,
        settingTypes[type] > 0,
        `${settingTypes[type] || 0} settings of type '${type}'`,
        { type, count: settingTypes[type] || 0 }
      );
    });

    this.log(
      'Setting Types Summary',
      Object.keys(settingTypes).length >= 4,
      `Found ${Object.keys(settingTypes).length} different setting types`,
      settingTypes
    );
  }

  generateReport() {
    console.log('\n📊 Settings Validation Summary:');
    console.log('='.repeat(50));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`✓ Passed: ${passedTests}`);
    console.log(`✗ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  • ${r.test}: ${r.message}`));
    }

    console.log('\n🎯 Settings Summary:');
    if (this.settingsSchema) {
      const totalSettings = this.settingsSchema.reduce((count, section) => {
        return count + (section.settings ? section.settings.length : 0);
      }, 0);
      console.log(`  📝 Total GUI Settings: ${totalSettings}`);
      console.log(`  📂 Total Panels: ${this.settingsSchema.length}`);
    }

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: (passedTests / totalTests) * 100,
      results: this.testResults
    };
  }
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  window.SettingsValidationTester = SettingsValidationTester;
  
  // Run tests after a delay to ensure DOM is ready
  setTimeout(() => {
    const tester = new SettingsValidationTester();
    tester.runAllTests();
  }, 1500);
}

// Export for Node.js testing if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsValidationTester;
}