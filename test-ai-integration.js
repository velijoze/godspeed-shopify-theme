/**
 * Comprehensive AI Integration Test
 * Tests the AI chatbot functionality without external API calls
 */

class AIIntegrationTester {
  constructor() {
    this.testResults = [];
    this.chatbot = null;
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

  async runAllTests() {
    console.log('🧪 Starting AI Integration Tests...\n');

    try {
      await this.testInitialization();
      await this.testSettingsRetrieval();
      await this.testProviderOrder();
      await this.testPromptGeneration();
      await this.testMessageHandling();
      await this.testErrorHandling();
      await this.testConversationHistory();
      await this.testUserContextTracking();
    } catch (error) {
      this.log('Test Suite', false, `Test suite failed: ${error.message}`, error);
    }

    this.generateReport();
  }

  async testInitialization() {
    // Test 1: Check if AIChainBot class exists
    this.log(
      'Class Definition',
      typeof window.AIChainBot !== 'undefined',
      window.AIChainBot ? 'AIChainBot class is defined' : 'AIChainBot class not found'
    );

    // Test 2: Check initialization
    if (window.AIChainBot) {
      this.chatbot = window.AIChainBot;
      this.log(
        'Instance Creation',
        this.chatbot.isInitialized !== undefined,
        this.chatbot.isInitialized ? 'Chatbot initialized successfully' : 'Chatbot not initialized'
      );
    }
  }

  async testSettingsRetrieval() {
    if (!this.chatbot) return;

    try {
      const settings = this.chatbot.getThemeSettings();
      
      this.log(
        'Settings Retrieval',
        typeof settings === 'object' && settings !== null,
        'Theme settings retrieved successfully',
        settings
      );

      // Test specific setting values
      this.log(
        'Primary Provider Setting',
        settings.ai_primary_provider === 'claude',
        `Primary provider is ${settings.ai_primary_provider}`,
        { expected: 'claude', actual: settings.ai_primary_provider }
      );

      this.log(
        'Fallback Setting',
        typeof settings.ai_fallback_enabled === 'boolean',
        `Fallback enabled: ${settings.ai_fallback_enabled}`,
        { type: typeof settings.ai_fallback_enabled }
      );

    } catch (error) {
      this.log('Settings Retrieval', false, `Failed to retrieve settings: ${error.message}`, error);
    }
  }

  async testProviderOrder() {
    if (!this.chatbot) return;

    try {
      const settings = { ai_primary_provider: 'openai' };
      const providers = this.chatbot.getProviderOrder(settings);

      this.log(
        'Provider Order',
        Array.isArray(providers) && providers.length === 3,
        `Provider order returned: ${providers.join(', ')}`,
        providers
      );

      this.log(
        'Primary Provider First',
        providers[0] === 'openai',
        `Primary provider (openai) is first: ${providers[0]}`,
        { expected: 'openai', actual: providers[0] }
      );

    } catch (error) {
      this.log('Provider Order', false, `Provider order test failed: ${error.message}`, error);
    }
  }

  async testPromptGeneration() {
    if (!this.chatbot) return;

    try {
      const testMessage = "I'm looking for a city e-bike";
      const prompt = this.chatbot.buildSwissEBikePrompt(testMessage);

      this.log(
        'Prompt Generation',
        typeof prompt === 'string' && prompt.length > 0,
        `Generated prompt of ${prompt.length} characters`,
        { promptLength: prompt.length, contains: prompt.includes('Swiss e-bike expert') }
      );

      // Check if prompt contains required elements
      const requiredElements = [
        'Swiss e-bike expert',
        'Godspeed',
        'Customer message:',
        testMessage
      ];

      requiredElements.forEach(element => {
        this.log(
          `Prompt Contains: ${element}`,
          prompt.includes(element),
          prompt.includes(element) ? `Found "${element}"` : `Missing "${element}"`,
          { searchTerm: element }
        );
      });

    } catch (error) {
      this.log('Prompt Generation', false, `Prompt generation failed: ${error.message}`, error);
    }
  }

  async testMessageHandling() {
    if (!this.chatbot) return;

    try {
      // Test input validation
      const originalShowError = this.chatbot.showError;
      let errorCalled = false;
      
      this.chatbot.showError = (message) => {
        errorCalled = true;
        console.log('Error shown:', message);
      };

      // Test empty message handling
      await this.chatbot.sendMessage('');
      
      this.log(
        'Empty Message Validation',
        errorCalled,
        errorCalled ? 'Empty message correctly rejected' : 'Empty message not validated'
      );

      // Restore original method
      this.chatbot.showError = originalShowError;

    } catch (error) {
      this.log('Message Handling', false, `Message handling test failed: ${error.message}`, error);
    }
  }

  async testErrorHandling() {
    if (!this.chatbot) return;

    try {
      // Test API error handling with invalid settings
      const invalidSettings = {
        ai_primary_provider: 'claude',
        ai_fallback_enabled: false,
        claude_api_key: null
      };

      // This should fail gracefully
      try {
        await this.chatbot.callClaudeAPI('test message', invalidSettings);
        this.log('Error Handling', false, 'Expected error but API call succeeded');
      } catch (error) {
        this.log(
          'API Error Handling',
          error.message.includes('API key not configured'),
          `Correctly caught API key error: ${error.message}`,
          { errorType: error.constructor.name }
        );
      }

    } catch (error) {
      this.log('Error Handling', false, `Error handling test failed: ${error.message}`, error);
    }
  }

  async testConversationHistory() {
    if (!this.chatbot) return;

    try {
      // Clear history first
      this.chatbot.clearConversation();
      
      const initialHistory = this.chatbot.getConversationHistory();
      this.log(
        'Clear Conversation',
        Array.isArray(initialHistory) && initialHistory.length === 0,
        `History cleared: ${initialHistory.length} items`,
        initialHistory
      );

      // Add test conversations
      this.chatbot.conversationHistory.push(
        { role: 'user', content: 'Hello', timestamp: Date.now() },
        { role: 'assistant', content: 'Hi there!', timestamp: Date.now() }
      );

      const history = this.chatbot.getConversationHistory();
      this.log(
        'Conversation History',
        history.length === 2,
        `History contains ${history.length} messages`,
        history
      );

    } catch (error) {
      this.log('Conversation History', false, `History test failed: ${error.message}`, error);
    }
  }

  async testUserContextTracking() {
    if (!this.chatbot) return;

    try {
      // Test user action tracking
      this.chatbot.trackUserAction('test_action', { data: 'test' });
      
      const actions = this.chatbot.userContext.previousActions;
      const lastAction = actions[actions.length - 1];

      this.log(
        'User Action Tracking',
        lastAction && lastAction.action === 'test_action',
        `Action tracked: ${lastAction?.action}`,
        lastAction
      );

      // Test context information
      this.log(
        'User Context',
        this.chatbot.userContext.currentPage && this.chatbot.userContext.language,
        `Context: page=${this.chatbot.userContext.currentPage}, lang=${this.chatbot.userContext.language}`,
        {
          page: this.chatbot.userContext.currentPage,
          language: this.chatbot.userContext.language,
          sessionStart: this.chatbot.userContext.sessionStart
        }
      );

    } catch (error) {
      this.log('User Context Tracking', false, `Context tracking failed: ${error.message}`, error);
    }
  }

  generateReport() {
    console.log('\n📊 Test Results Summary:');
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

    console.log('\n🎯 Recommendations:');
    if (passedTests === totalTests) {
      console.log('  ✅ All tests passed! AI integration is working correctly.');
    } else {
      console.log('  🔧 Some tests failed. Review the failed tests above.');
      console.log('  📝 Check API key configuration and network connectivity.');
      console.log('  🐛 Verify all required DOM elements are present.');
    }

    // Return results for potential use
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
  window.AIIntegrationTester = AIIntegrationTester;
  
  // Wait for AIChainBot to be available
  const waitForAI = setInterval(() => {
    if (window.AIChainBot) {
      clearInterval(waitForAI);
      const tester = new AIIntegrationTester();
      setTimeout(() => tester.runAllTests(), 1000); // Give AIChainBot time to initialize
    }
  }, 100);
}

// Export for Node.js testing if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIIntegrationTester;
}