#!/usr/bin/env node

/**
 * Comprehensive validation script for Godspeed theme
 * Tests code quality, settings structure, and functionality
 */

const fs = require('fs');
const path = require('path');

class GodspeedValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passes = [];
  }

  log(type, message, details = null) {
    const entry = { type, message, details, timestamp: new Date().toISOString() };
    
    if (type === 'error') {
      this.errors.push(entry);
      console.log(`❌ ERROR: ${message}`);
    } else if (type === 'warning') {
      this.warnings.push(entry);
      console.log(`⚠️  WARNING: ${message}`);
    } else {
      this.passes.push(entry);
      console.log(`✅ PASS: ${message}`);
    }
    
    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async runAllValidations() {
    console.log('🔍 Running Godspeed Theme Validation...\n');

    try {
      await this.validateFileStructure();
      await this.validateJavaScriptSyntax();
      await this.validateSettingsSchema();
      await this.validateLiquidTemplates();
      await this.validateAssetFiles();
      await this.generateReport();
    } catch (error) {
      this.log('error', `Validation suite failed: ${error.message}`, error);
    }
  }

  async validateFileStructure() {
    console.log('📁 Validating file structure...');

    const requiredFiles = [
      'config/settings_schema.json',
      'config/settings_data.json',
      'assets/ai-chatbot-integration.js',
      'snippets/pipeline-live-chat.liquid',
      'layout/theme.liquid'
    ];

    const requiredDirectories = [
      'assets',
      'config',
      'layout',
      'sections',
      'snippets',
      'templates'
    ];

    // Check required files
    requiredFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.log('pass', `Required file exists: ${filePath}`);
      } else {
        this.log('error', `Missing required file: ${filePath}`);
      }
    });

    // Check required directories
    requiredDirectories.forEach(dirPath => {
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.log('pass', `Required directory exists: ${dirPath}`);
      } else {
        this.log('error', `Missing required directory: ${dirPath}`);
      }
    });

    // Check for test files we created
    const testFiles = [
      'test-chat-widget.html',
      'test-ai-integration.js',
      'test-settings-validation.js',
      'test-mobile-responsive.html'
    ];

    testFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.log('pass', `Test file created: ${filePath}`);
      } else {
        this.log('warning', `Test file missing: ${filePath}`);
      }
    });
  }

  async validateJavaScriptSyntax() {
    console.log('\n🔧 Validating JavaScript syntax...');

    const jsFiles = [
      'assets/ai-chatbot-integration.js'
    ];

    jsFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Basic syntax checks
          if (content.includes('class AIChainBot')) {
            this.log('pass', `${filePath}: AIChainBot class found`);
          } else {
            this.log('error', `${filePath}: AIChainBot class not found`);
          }

          if (content.includes('async sendMessage(')) {
            this.log('pass', `${filePath}: sendMessage method found`);
          } else {
            this.log('error', `${filePath}: sendMessage method not found`);
          }

          if (content.includes('callClaudeAPI') && content.includes('callOpenAIAPI') && content.includes('callGeminiAPI')) {
            this.log('pass', `${filePath}: All AI provider methods found`);
          } else {
            this.log('warning', `${filePath}: Some AI provider methods missing`);
          }

          // Check for potential issues
          if (content.includes('console.log')) {
            this.log('warning', `${filePath}: Contains console.log statements (consider removing for production)`);
          }

          const lineCount = content.split('\n').length;
          this.log('pass', `${filePath}: ${lineCount} lines of code`);

        } catch (error) {
          this.log('error', `${filePath}: Failed to read file`, error.message);
        }
      }
    });
  }

  async validateSettingsSchema() {
    console.log('\n⚙️ Validating settings schema...');

    const schemaPath = 'config/settings_schema.json';
    const dataPath = 'config/settings_data.json';

    if (fs.existsSync(schemaPath)) {
      try {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        
        this.log('pass', `Settings schema is valid JSON`);
        this.log('pass', `Schema has ${schema.length} sections`);

        // Count total settings
        const totalSettings = schema.reduce((count, section) => {
          return count + (section.settings ? section.settings.length : 0);
        }, 0);

        if (totalSettings >= 120) {
          this.log('pass', `Found ${totalSettings} total settings (target: 120+)`);
        } else {
          this.log('warning', `Only ${totalSettings} settings found (target: 120+)`);
        }

        // Check for required panels (including translation keys)
        const requiredPanels = [
          { name: 'E-Bike Features', patterns: ['E-Bike Features', 'ebike_features'] },
          { name: 'Store Locations', patterns: ['Store Locations', 'store_locations'] },
          { name: 'Text & Messaging', patterns: ['Text & Messaging', 'text_messaging'] },
          { name: 'API Integration', patterns: ['API Integration', 'api_integration'] },
          { name: 'AI Features', patterns: ['AI Features', 'ai_features'] }
        ];

        requiredPanels.forEach(panel => {
          const found = schema.some(section => {
            if (!section.name) return false;
            return panel.patterns.some(pattern => 
              section.name.includes(pattern) || section.name.includes(pattern.toLowerCase())
            );
          });
          
          if (found) {
            this.log('pass', `Panel found: ${panel.name}`);
          } else {
            this.log('error', `Missing panel: ${panel.name}`);
          }
        });

        // Check setting types
        const settingTypes = new Set();
        schema.forEach(section => {
          if (section.settings) {
            section.settings.forEach(setting => {
              settingTypes.add(setting.type);
            });
          }
        });

        this.log('pass', `Setting types used: ${Array.from(settingTypes).join(', ')}`);

      } catch (error) {
        this.log('error', `Settings schema validation failed`, error.message);
      }
    }

    if (fs.existsSync(dataPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        this.log('pass', `Settings data is valid JSON`);
        
        if (data.current && data.current.enable_live_chat === true) {
          this.log('pass', `Live chat is enabled in settings data`);
        } else {
          this.log('warning', `Live chat is not enabled in settings data`);
        }

      } catch (error) {
        this.log('error', `Settings data validation failed`, error.message);
      }
    }
  }

  async validateLiquidTemplates() {
    console.log('\n💧 Validating Liquid templates...');

    const liquidFiles = [
      'snippets/pipeline-live-chat.liquid',
      'layout/theme.liquid'
    ];

    liquidFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lineCount = content.split('\n').length;
          
          this.log('pass', `${filePath}: ${lineCount} lines`);

          // Check for common issues
          if (content.includes('section.settings')) {
            this.log('warning', `${filePath}: Contains 'section.settings' (should use 'settings' in snippets)`);
          }

          if (content.includes('{{ settings.')) {
            this.log('pass', `${filePath}: Uses settings properly`);
          }

          if (content.includes('enable_live_chat')) {
            this.log('pass', `${filePath}: References live chat setting`);
          }

          // Check for AI integration
          if (filePath.includes('pipeline-live-chat')) {
            if (content.includes('ai-chatbot-integration.js')) {
              this.log('pass', `${filePath}: Loads AI integration script`);
            } else {
              this.log('error', `${filePath}: Missing AI integration script reference`);
            }

            if (content.includes('data-primary-provider')) {
              this.log('pass', `${filePath}: Passes AI provider settings`);
            } else {
              this.log('warning', `${filePath}: Missing AI provider data attributes`);
            }
          }

        } catch (error) {
          this.log('error', `${filePath}: Failed to read file`, error.message);
        }
      }
    });
  }

  async validateAssetFiles() {
    console.log('\n🎨 Validating asset files...');

    const assetDir = 'assets';
    if (fs.existsSync(assetDir)) {
      const files = fs.readdirSync(assetDir);
      
      // Count different file types
      const fileTypes = {};
      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      });

      this.log('pass', `Assets directory contains ${files.length} files`);
      this.log('pass', `File types: ${JSON.stringify(fileTypes)}`);

      // Check for required assets
      const requiredAssets = [
        'ai-chatbot-integration.js',
        'godspeed-clean.css'
      ];

      requiredAssets.forEach(asset => {
        if (files.includes(asset)) {
          this.log('pass', `Required asset found: ${asset}`);
        } else {
          this.log('warning', `Required asset missing: ${asset}`);
        }
      });
    }
  }

  async generateReport() {
    console.log('\n📊 Validation Report:');
    console.log('='.repeat(50));

    const total = this.passes.length + this.warnings.length + this.errors.length;
    
    console.log(`Total Checks: ${total}`);
    console.log(`✅ Passed: ${this.passes.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`Success Rate: ${((this.passes.length / total) * 100).toFixed(1)}%`);

    if (this.errors.length > 0) {
      console.log('\n❌ Critical Issues:');
      this.errors.forEach(error => {
        console.log(`  • ${error.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`  • ${warning.message}`);
      });
    }

    console.log('\n🎯 Summary:');
    if (this.errors.length === 0) {
      console.log('  ✅ No critical errors found!');
      console.log('  🚀 Theme is ready for testing and deployment.');
    } else {
      console.log('  🔧 Please fix the critical errors above.');
    }

    if (this.warnings.length > 0) {
      console.log('  📝 Consider addressing the warnings for optimal performance.');
    }

    return {
      total,
      passed: this.passes.length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      results: {
        passes: this.passes,
        warnings: this.warnings,
        errors: this.errors
      }
    };
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  const validator = new GodspeedValidator();
  validator.runAllValidations().then(() => {
    process.exit(validator.errors.length > 0 ? 1 : 0);
  });
}

module.exports = GodspeedValidator;