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
    
    console.log('AI Chatbot initialized successfully');
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
   * Send message to AI API
   */
  async sendMessage(messageText = null) {
    const message = messageText || this.chatInput?.value?.trim();
    
    if (!message) {
      this.showError('Please enter a message', 'de');
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
      
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          context: this.userContext,
          language: this.userContext.language,
          settings: this.getThemeSettings()
        })
      });
      
      const responseTime = Date.now() - startTime;
      this.responseTime = responseTime;
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          this.showRateLimitError(errorData.retryAfter);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to get AI response');
      }
      
      const data = await response.json();
      
      this.hideTypingIndicator();
      this.addAIMessage(data.response, data.provider, responseTime, data.cached);
      this.updateProviderStatus('success', data.provider);
      
      // Store conversation for context
      this.conversationHistory.push(
        { role: 'user', content: message, timestamp: Date.now() },
        { role: 'assistant', content: data.response, provider: data.provider, timestamp: Date.now() }
      );
      
      // Limit history to last 10 exchanges
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }
      
    } catch (error) {
      console.error('AI Chatbot error:', error);
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
    
    // Log detailed error for debugging
    console.error('Chatbot error:', errorMessage);
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
      console.warn('Failed to load user actions:', error);
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
      console.warn('Failed to save user actions:', error);
    }
  }

  /**
   * Get theme settings for API calls
   */
  getThemeSettings() {
    // In a real implementation, these would come from Shopify theme settings
    return {
      ai_primary_provider: window.Shopify?.theme?.settings?.ai_primary_provider || 'claude',
      ai_fallback_enabled: window.Shopify?.theme?.settings?.ai_fallback_enabled !== false,
      ai_cache_duration: window.Shopify?.theme?.settings?.ai_cache_duration || 60,
      api_timeout: window.Shopify?.theme?.settings?.api_timeout || 30
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
}

// Initialize AI Chatbot
window.AIChainBot = new AIChainBot();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIChainBot;
}