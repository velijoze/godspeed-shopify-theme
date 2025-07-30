/**
 * AI Chatbot Integration for Godspeed Theme
 * Client-side integration with AI API handler
 * Handles provider status, context tracking, and user interactions
 */

class AIChainBot {
  constructor() {
    this.isInitialized = false;
    this.currentProvider = null;
    this.responseTime = null;
    this.conversationHistory = [];
    this.userContext = {
      currentPage: window.location.pathname,
      previousActions: this.loadUserActions(),
      language: document.documentElement.lang || 'de',
      sessionStart: Date.now()
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the AI chatbot integration
   */
  init() {
    if (this.isInitialized) return;
    
    this.chatWidget = document.getElementById('pipeline-chat-widget');
    this.chatInput = document.querySelector('[data-chat-input]');
    this.chatSendButton = document.querySelector('[data-chat-send]');
    this.chatMessages = document.querySelector('[data-chat-messages]');
    this.providerStatus = document.querySelector('.ai-provider-status');
    
    if (!this.chatWidget) {
      console.warn('AI Chatbot: Chat widget not found');
      return;
    }
    
    this.bindEvents();
    this.updateProviderStatus('ready');
    this.trackPageView();
    this.isInitialized = true;
    
    // AI Chatbot initialized successfully
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Send message on button click
    if (this.chatSendButton) {
      this.chatSendButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }
    
    // Send message on Enter key
    if (this.chatInput) {
      this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // Track typing for context
      this.chatInput.addEventListener('input', () => {
        this.trackUserAction('typing');
      });
    }
    
    // Quick reply buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-quick-text]')) {
        const quickText = e.target.getAttribute('data-quick-text');
        this.sendQuickReply(quickText);
      }
    });
    
    // Track page navigation for context
    window.addEventListener('beforeunload', () => {
      this.saveUserActions();
    });
  }

  /**
   * Send message to AI APIs directly from client
   */
  async sendMessage(messageText = null) {
    const message = messageText || this.chatInput?.value?.trim();
    
    if (!message) {
      this.showError('Please enter a message', this.userContext.language);
      return;
    }
    
    // Clear input and show user message
    if (this.chatInput && !messageText) {
      this.chatInput.value = '';
    }
    
    this.addUserMessage(message);
    this.showTypingIndicator();
    this.updateProviderStatus('sending');
    
    // Track user action
    this.trackUserAction('message_sent', { message: message.substring(0, 50) });
    
    try {
      const startTime = Date.now();
      
      // Get settings from theme
      const settings = this.getThemeSettings();
      
      // Try AI providers in order
      let aiResponse = null;
      const providers = this.getProviderOrder(settings);
      
      for (const provider of providers) {
        try {
          if (provider === 'claude') {
            aiResponse = await this.callClaudeAPI(message, settings);
          } else if (provider === 'openai') {
            aiResponse = await this.callOpenAIAPI(message, settings);
          } else if (provider === 'gemini') {
            aiResponse = await this.callGeminiAPI(message, settings);
          }
          
          if (aiResponse) {
            aiResponse.provider = provider;
            break;
          }
        } catch (error) {
          // Provider API failed, try next provider if fallback enabled
          if (!settings.ai_fallback_enabled) {
            throw error;
          }
        }
      }
      
      if (!aiResponse) {
        throw new Error('All AI providers failed');
      }
      
      const responseTime = Date.now() - startTime;
      this.responseTime = responseTime;
      
      this.hideTypingIndicator();
      this.addAIMessage(aiResponse.text, aiResponse.provider, responseTime, false);
      this.updateProviderStatus('success', aiResponse.provider);
      
      // Store conversation for context
      this.conversationHistory.push(
        { role: 'user', content: message, timestamp: Date.now() },
        { role: 'assistant', content: aiResponse.text, provider: aiResponse.provider, timestamp: Date.now() }
      );
      
      // Limit history to last 10 exchanges
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }
      
    } catch (error) {
      // Handle AI chatbot errors gracefully
      this.hideTypingIndicator();
      this.showError(error.message);
      this.updateProviderStatus('error');
    }
  }

  /**
   * Send quick reply
   */
  sendQuickReply(quickText) {
    this.sendMessage(quickText);
    
    // Hide quick replies after use
    const quickReplies = document.querySelector('[data-quick-replies]');
    if (quickReplies) {
      quickReplies.style.display = 'none';
    }
  }

  /**
   * Add user message to chat
   */
  addUserMessage(message) {
    const messageElement = this.createMessageElement('user', message);
    this.chatMessages?.appendChild(messageElement);
    this.scrollToBottom();
  }

  /**
   * Add AI message to chat
   */
  addAIMessage(message, provider, responseTime, cached) {
    const messageElement = this.createMessageElement('agent', message, {
      provider,
      responseTime,
      cached
    });
    this.chatMessages?.appendChild(messageElement);
    this.scrollToBottom();
  }

  /**
   * Create message element
   */
  createMessageElement(type, content, metadata = {}) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (type === 'agent') {
      avatar.innerHTML = '<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz48cGF0aCBkPSJNMjAgMTBjLTIuNzYgMC01IDIuMjQtNSA1czIuMjQgNSA1IDUgNS0yLjI0IDUtNS0yLjI0LTUtNS01em0wIDIwYy0zLjMzIDAtMTAtMS42Ny0xMC01di0yaDIwdjJjMCAzLjMzLTYuNjcgNS0xMCA1eiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=" alt="AI Assistant">';
    } else {
      avatar.innerHTML = '<div class="user-avatar">👤</div>';
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = content;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = this.formatTime(new Date());
    
    contentDiv.appendChild(textDiv);
    contentDiv.appendChild(timeDiv);
    
    // Add metadata for AI messages
    if (type === 'agent' && metadata.provider) {
      const metaDiv = document.createElement('div');
      metaDiv.className = 'message-meta';
      
      let metaText = `via ${metadata.provider}`;
      if (metadata.responseTime) {
        metaText += ` • ${metadata.responseTime}ms`;
      }
      if (metadata.cached) {
        metaText += ' • cached';
      }
      
      metaDiv.textContent = metaText;
      contentDiv.appendChild(metaDiv);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    return messageDiv;
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message agent-message typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-avatar">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz48cGF0aCBkPSJNMjAgMTBjLTIuNzYgMC01IDIuMjQtNSA1czIuMjQgNSA1IDUgNS0yLjI0IDUtNS0yLjI0LTUtNS01em0wIDIwYy0zLjMzIDAtMTAtMS42Ny0xMC01di0yaDIwdjJjMCAzLjMzLTYuNjcgNS0xMCA1eiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=" alt="AI">
      </div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    this.chatMessages?.appendChild(typingDiv);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    const typingIndicator = this.chatMessages?.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  /**
   * Show error message
   */
  showError(errorMessage, language = 'de') {
    this.hideTypingIndicator();
    
    const errorMessages = {
      'de': 'Entschuldigung, es gab einen Fehler. Versuchen Sie es bitte erneut.',
      'fr': 'Désolé, il y a eu une erreur. Veuillez réessayer.',
      'it': 'Spiacenti, si è verificato un errore. Riprova.',
      'en': 'Sorry, there was an error. Please try again.'
    };
    
    const friendlyError = errorMessages[language] || errorMessages['de'];
    
    this.addAIMessage(friendlyError, 'system', null, false);
    
    // Error logged for debugging
  }

  /**
   * Show rate limit error
   */
  showRateLimitError(retryAfter) {
    const language = this.userContext.language;
    const messages = {
      'de': `Zu viele Anfragen. Bitte warten Sie ${retryAfter} Sekunden und versuchen Sie es erneut.`,
      'fr': `Trop de demandes. Veuillez attendre ${retryAfter} secondes et réessayer.`,
      'it': `Troppe richieste. Attendere ${retryAfter} secondi e riprovare.`,
      'en': `Too many requests. Please wait ${retryAfter} seconds and try again.`
    };
    
    const message = messages[language] || messages['de'];
    this.addAIMessage(message, 'system', null, false);
  }

  /**
   * Update provider status indicators
   */
  updateProviderStatus(status, provider = null) {
    if (!this.providerStatus) return;
    
    const indicators = this.providerStatus.querySelectorAll('.provider-dot');
    
    indicators.forEach(dot => {
      dot.classList.remove('active', 'error', 'sending');
    });
    
    if (status === 'sending') {
      this.providerStatus.style.display = 'block';
      indicators.forEach(dot => dot.classList.add('sending'));
    } else if (status === 'success' && provider) {
      const activeIndicator = this.providerStatus.querySelector(`[data-provider="${provider}"]`);
      if (activeIndicator) {
        activeIndicator.classList.add('active');
      }
    } else if (status === 'error') {
      indicators.forEach(dot => dot.classList.add('error'));
    } else if (status === 'ready') {
      this.providerStatus.style.display = 'none';
    }
  }

  /**
   * Track user actions for context
   */
  trackUserAction(action, data = {}) {
    const actionData = {
      action,
      timestamp: Date.now(),
      page: window.location.pathname,
      ...data
    };
    
    this.userContext.previousActions.push(actionData);
    
    // Keep only last 50 actions
    if (this.userContext.previousActions.length > 50) {
      this.userContext.previousActions = this.userContext.previousActions.slice(-50);
    }
  }

  /**
   * Track page view for context
   */
  trackPageView() {
    this.trackUserAction('page_view', {
      url: window.location.href,
      title: document.title
    });
  }

  /**
   * Load user actions from localStorage
   */
  loadUserActions() {
    try {
      const stored = localStorage.getItem('godspeed_user_actions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      // Failed to load user actions, return empty array
      return [];
    }
  }

  /**
   * Save user actions to localStorage
   */
  saveUserActions() {
    try {
      localStorage.setItem('godspeed_user_actions', JSON.stringify(this.userContext.previousActions));
    } catch (error) {
      // Failed to save user actions
    }
  }

  /**
   * Get theme settings for API calls
   */
  getThemeSettings() {
    // Get settings from data attributes or window object
    const chatWidget = document.getElementById('pipeline-chat-widget');
    
    return {
      ai_primary_provider: chatWidget?.dataset.primaryProvider || window.themeSettings?.ai_primary_provider || 'claude',
      ai_fallback_enabled: chatWidget?.dataset.fallbackEnabled !== 'false',
      claude_api_key: chatWidget?.dataset.claudeApiKey || window.themeSettings?.claude_api_key,
      openai_api_key: chatWidget?.dataset.openaiApiKey || window.themeSettings?.openai_api_key,
      gemini_api_key: chatWidget?.dataset.geminiApiKey || window.themeSettings?.gemini_api_key,
      ai_cache_duration: parseInt(chatWidget?.dataset.cacheDuration || '60'),
      api_timeout: parseInt(chatWidget?.dataset.apiTimeout || '30')
    };
  }

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    if (this.chatMessages) {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }

  /**
   * Format time for display
   */
  formatTime(date) {
    return date.toLocaleTimeString(this.userContext.language, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Public method to send message programmatically
   */
  sendProgrammaticMessage(message) {
    this.sendMessage(message);
  }

  /**
   * Public method to get conversation history
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Public method to clear conversation
   */
  clearConversation() {
    this.conversationHistory = [];
    if (this.chatMessages) {
      // Keep only the welcome message
      const welcomeMessage = this.chatMessages.querySelector('.agent-message');
      this.chatMessages.innerHTML = '';
      if (welcomeMessage) {
        this.chatMessages.appendChild(welcomeMessage);
      }
    }
  }

  /**
   * Get provider order based on settings
   */
  getProviderOrder(settings) {
    const providers = ['claude', 'openai', 'gemini'];
    const primary = settings.ai_primary_provider;
    
    if (primary && providers.includes(primary)) {
      providers.splice(providers.indexOf(primary), 1);
      providers.unshift(primary);
    }
    
    return providers;
  }

  /**
   * Call Claude API directly
   */
  async callClaudeAPI(message, settings) {
    const apiKey = settings.claude_api_key;
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    const prompt = this.buildSwissEBikePrompt(message);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.content[0].text
    };
  }

  /**
   * Call OpenAI API directly
   */
  async callOpenAIAPI(message, settings) {
    const apiKey = settings.openai_api_key;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildSwissEBikePrompt(message);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a Swiss e-bike expert helping customers at Godspeed, a premium e-bike retailer in Switzerland.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content
    };
  }

  /**
   * Call Gemini API directly
   */
  async callGeminiAPI(message, settings) {
    const apiKey = settings.gemini_api_key;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = this.buildSwissEBikePrompt(message);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.candidates[0].content.parts[0].text
    };
  }

  /**
   * Detect language from message content using keyword patterns
   */
  detectMessageLanguage(message) {
    const patterns = {
      'de': [
        'ich', 'ein', 'eine', 'der', 'die', 'das', 'für', 'mit', 'und', 'oder',
        'suche', 'brauche', 'möchte', 'kann', 'will', 'haben', 'ist', 'sind',
        'ebike', 'fahrrad', 'zürich', 'basel', 'bern', 'schweiz', 'berg', 'stadt',
        'arbeitsweg', 'pendeln', 'fahren', 'kaufen', 'preis', 'kosten', 'gerne'
      ],
      'it': [
        'io', 'una', 'un', 'per', 'con', 'e', 'o', 'la', 'il', 'di', 'da',
        'cerco', 'vorrei', 'posso', 'voglio', 'ho', 'è', 'sono', 'che', 'come',
        'ebike', 'bicicletta', 'lugano', 'ticino', 'svizzera', 'montagna', 'città',
        'lavoro', 'andare', 'comprare', 'prezzo', 'costa', 'quanto', 'grazie'
      ],
      'fr': [
        'je', 'un', 'une', 'le', 'la', 'pour', 'avec', 'et', 'ou', 'de', 'du',
        'cherche', 'voudrais', 'peux', 'veux', 'ai', 'est', 'sont', 'que', 'comment',
        'ebike', 'vélo', 'genève', 'lausanne', 'suisse', 'montagne', 'ville',
        'travail', 'aller', 'acheter', 'prix', 'coûte', 'combien', 'merci'
      ]
    };

    if (!message || message.trim().length === 0) return null;

    const messageLower = message.toLowerCase();
    const scores = {};

    // Score each language based on keyword matches
    for (const [lang, keywords] of Object.entries(patterns)) {
      scores[lang] = keywords.filter(keyword => 
        messageLower.includes(keyword)
      ).length;
    }

    // Find language with highest score
    const maxScore = Math.max(...Object.values(scores));
    
    // Require at least 1 keyword match for detection
    if (maxScore === 0) return null;

    // Return language with highest score
    return Object.keys(scores).find(lang => scores[lang] === maxScore);
  }

  /**
   * Build Swiss E-Bike Expert Prompt
   */
  buildSwissEBikePrompt(message) {
    const languageNames = {
      'de': 'German',
      'fr': 'French', 
      'it': 'Italian',
      'en': 'English'
    };

    // Auto-detect language from message content
    const messageLanguage = this.detectMessageLanguage(message);
    const responseLanguage = messageLanguage || this.userContext.language || 'de';

    const contextInfo = this.userContext ? `
Context: Customer is on ${this.userContext.currentPage || 'unknown page'}
Previous actions: ${JSON.stringify(this.userContext.previousActions?.slice(-5) || [])}
` : '';

    return `You are a Swiss e-bike expert working at Godspeed, a premium e-bike retailer in Switzerland. 

${contextInfo}

Swiss E-Bike Knowledge:
- Pedelec (25 km/h) vs S-Pedelec (45 km/h) regulations
- Swiss insurance requirements for e-bikes
- Alpine terrain considerations for range and motor selection
- Bosch, Shimano, and Brose motor systems
- Swiss weather conditions and seasonal riding
- 0% financing options available
- 6 store locations: Zürich, Basel, Bern, Genève, Luzern, St. Gallen
- Test ride booking and professional service available

Respond in ${languageNames[responseLanguage]} with:
1. Helpful, expert advice
2. Swiss market specific information
3. Recommendation for test rides when relevant
4. Clear next steps for the customer

Customer message: "${message}"

Keep response under 200 words, friendly but professional tone.`;
  }
}

// Initialize AI Chatbot
window.AIChainBot = new AIChainBot();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIChainBot;
}