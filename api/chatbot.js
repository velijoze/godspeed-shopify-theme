/**
 * AI Chatbot API Handler for Godspeed Theme
 * Handles AI provider fallback system (Claude → OpenAI → Gemini)
 * Security, rate limiting, and Swiss e-bike expertise
 */

export default async function handler(req, res) {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, language = 'de', settings } = req.body;

    // Validate required fields
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(req);
    if (rateLimitResult.limited) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      });
    }

    // Try AI providers in order: Claude → OpenAI → Gemini
    const providers = [
      { name: 'claude', handler: callClaudeAPI },
      { name: 'openai', handler: callOpenAIAPI },
      { name: 'gemini', handler: callGeminiAPI }
    ];

    // Respect user's primary provider preference
    if (settings?.ai_primary_provider) {
      const primaryProvider = providers.find(p => p.name === settings.ai_primary_provider);
      if (primaryProvider) {
        providers.unshift(providers.splice(providers.indexOf(primaryProvider), 1)[0]);
      }
    }

    let lastError = null;
    
    for (const provider of providers) {
      try {
        console.log(`Attempting AI request with ${provider.name}`);
        
        const response = await provider.handler(message, context, language, settings);
        
        if (response.success) {
          // Log successful provider for analytics
          await logProviderUsage(provider.name, true, response.responseTime);
          
          return res.status(200).json({
            response: response.text,
            provider: provider.name,
            cached: response.cached || false,
            responseTime: response.responseTime
          });
        }
      } catch (error) {
        console.error(`${provider.name} API failed:`, error.message);
        lastError = error;
        
        // Log failed attempt
        await logProviderUsage(provider.name, false, null, error.message);
        
        // If fallback is disabled, don't try other providers
        if (settings?.ai_fallback_enabled === false) {
          break;
        }
        
        continue;
      }
    }

    // All providers failed
    return res.status(503).json({
      error: 'All AI providers are currently unavailable',
      lastError: lastError?.message || 'Unknown error',
      fallbackResponse: getFallbackResponse(language)
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      fallbackResponse: getFallbackResponse(language || 'de')
    });
  }
}

/**
 * Claude API Integration (Primary Provider)
 */
async function callClaudeAPI(message, context, language, settings) {
  const apiKey = process.env.CLAUDE_API_KEY || settings?.claude_api_key;
  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }

  const startTime = Date.now();
  
  // Check cache first
  const cacheKey = generateCacheKey('claude', message, context, language);
  const cachedResponse = await getFromCache(cacheKey);
  if (cachedResponse) {
    return {
      success: true,
      text: cachedResponse,
      cached: true,
      responseTime: Date.now() - startTime
    };
  }

  const prompt = buildSwissEBikePrompt(message, context, language);
  
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
    }),
    timeout: (settings?.api_timeout || 30) * 1000
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const responseTime = Date.now() - startTime;
  
  const aiResponse = data.content[0].text;
  
  // Cache the response
  await saveToCache(cacheKey, aiResponse, settings?.ai_cache_duration || 60);
  
  return {
    success: true,
    text: aiResponse,
    cached: false,
    responseTime
  };
}

/**
 * OpenAI API Integration (Secondary Provider)
 */
async function callOpenAIAPI(message, context, language, settings) {
  const apiKey = process.env.OPENAI_API_KEY || settings?.openai_api_key;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const startTime = Date.now();
  
  const cacheKey = generateCacheKey('openai', message, context, language);
  const cachedResponse = await getFromCache(cacheKey);
  if (cachedResponse) {
    return {
      success: true,
      text: cachedResponse,
      cached: true,
      responseTime: Date.now() - startTime
    };
  }

  const prompt = buildSwissEBikePrompt(message, context, language);
  
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
    }),
    timeout: (settings?.api_timeout || 30) * 1000
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const responseTime = Date.now() - startTime;
  
  const aiResponse = data.choices[0].message.content;
  
  await saveToCache(cacheKey, aiResponse, settings?.ai_cache_duration || 60);
  
  return {
    success: true,
    text: aiResponse,
    cached: false,
    responseTime
  };
}

/**
 * Google Gemini API Integration (Tertiary Provider)
 */
async function callGeminiAPI(message, context, language, settings) {
  const apiKey = process.env.GEMINI_API_KEY || settings?.gemini_api_key;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const startTime = Date.now();
  
  const cacheKey = generateCacheKey('gemini', message, context, language);
  const cachedResponse = await getFromCache(cacheKey);
  if (cachedResponse) {
    return {
      success: true,
      text: cachedResponse,
      cached: true,
      responseTime: Date.now() - startTime
    };
  }

  const prompt = buildSwissEBikePrompt(message, context, language);
  
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
    }),
    timeout: (settings?.api_timeout || 30) * 1000
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const responseTime = Date.now() - startTime;
  
  const aiResponse = data.candidates[0].content.parts[0].text;
  
  await saveToCache(cacheKey, aiResponse, settings?.ai_cache_duration || 60);
  
  return {
    success: true,
    text: aiResponse,
    cached: false,
    responseTime
  };
}

/**
 * Build Swiss E-Bike Expert Prompt
 */
function buildSwissEBikePrompt(message, context, language) {
  const languageNames = {
    'de': 'German',
    'fr': 'French', 
    'it': 'Italian',
    'en': 'English'
  };

  const contextInfo = context ? `
Context: Customer is on ${context.currentPage || 'unknown page'}
Previous actions: ${JSON.stringify(context.previousActions || [])}
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

Respond in ${languageNames[language] || 'German'} with:
1. Helpful, expert advice
2. Swiss market specific information
3. Recommendation for test rides when relevant
4. Clear next steps for the customer

Customer message: "${message}"

Keep response under 200 words, friendly but professional tone.`;
}

/**
 * Rate Limiting Implementation
 */
async function checkRateLimit(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const key = `ratelimit:${ip}`;
  
  // Simple in-memory rate limiting (in production, use Redis)
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = process.env.AI_RATE_LIMIT_REQUESTS || 100;
  
  const record = global.rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  
  if (record.count >= maxRequests) {
    return { limited: true, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  
  record.count++;
  global.rateLimitStore.set(key, record);
  
  return { limited: false };
}

/**
 * Caching Implementation
 */
function generateCacheKey(provider, message, context, language) {
  const contextStr = JSON.stringify(context || {});
  return `ai:${provider}:${language}:${Buffer.from(message + contextStr).toString('base64').slice(0, 50)}`;
}

async function getFromCache(key) {
  // Simple in-memory cache (in production, use Redis)
  if (!global.aiCache) {
    global.aiCache = new Map();
  }
  
  const cached = global.aiCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  global.aiCache.delete(key);
  return null;
}

async function saveToCache(key, data, durationMinutes) {
  if (!global.aiCache) {
    global.aiCache = new Map();
  }
  
  global.aiCache.set(key, {
    data,
    expires: Date.now() + (durationMinutes * 60 * 1000)
  });
}

/**
 * Fallback Response System
 */
function getFallbackResponse(language) {
  const fallbacks = {
    'de': 'Entschuldigung, unser AI-Assistent ist momentan nicht verfügbar. Bitte kontaktieren Sie uns direkt unter info@godspeed.ch oder +41 44 123 45 67 für persönliche Beratung.',
    'fr': 'Désolé, notre assistant IA n\'est pas disponible pour le moment. Veuillez nous contacter directement à info@godspeed.ch ou +41 44 123 45 67 pour des conseils personnalisés.',
    'it': 'Spiacenti, il nostro assistente AI non è al momento disponibile. Vi preghiamo di contattarci direttamente a info@godspeed.ch o +41 44 123 45 67 per una consulenza personalizzata.',
    'en': 'Sorry, our AI assistant is currently unavailable. Please contact us directly at info@godspeed.ch or +41 44 123 45 67 for personal consultation.'
  };
  
  return fallbacks[language] || fallbacks['de'];
}

/**
 * Analytics & Logging
 */
async function logProviderUsage(provider, success, responseTime, error = null) {
  // In production, send to analytics service
  console.log(`AI Provider Usage: ${provider}, Success: ${success}, Time: ${responseTime}ms, Error: ${error}`);
}