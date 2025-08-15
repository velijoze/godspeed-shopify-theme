# 🤖 AI Systems Guide - Godspeed E-Bike Store

## Overview

The Godspeed theme includes several AI-powered and intelligent systems designed to enhance the customer experience and provide smart recommendations. Here's how they work and how to extend them.

## 🧠 Site AI - Teaching Your AI Assistant

### Current AI Components

The theme currently includes these intelligent systems:

1. **🚴 Bike Comparison AI** - Smart product comparison logic
2. **📏 Size Calculator AI** - Intelligent bike sizing recommendations
3. **🎯 Product Recommendation Engine** - Based on customer behavior
4. **📊 API Intelligence** - Smart vendor data aggregation

### How to Teach Your Site AI New Information

#### 1. **Bike Knowledge Base** (`assets/bike-comparison.js`)

The bike comparison tool uses a structured knowledge base. To add new bike knowledge:

```javascript
// Location: assets/bike-comparison.js
const bikeKnowledgeBase = {
  // Add new bike models
  'new-model-2025': {
    name: 'New Model 2025',
    category: 'city',
    price: '2899',
    currency: 'CHF',
    motor: 'Bosch Performance Line CX',
    battery: '625 Wh',
    range: '80-120 km',
    weight: '24 kg',
    frameSize: ['S', 'M', 'L', 'XL'],
    // AI-powered features
    intelligence: {
      bestFor: ['commuting', 'long-distance', 'hills'],
      weatherSuitability: 'all-weather',
      maintenanceLevel: 'low',
      userProfile: 'intermediate-advanced'
    },
    // Comparison AI weights
    comparisonWeights: {
      price: 0.8,
      performance: 0.9,
      comfort: 0.7,
      durability: 0.9
    }
  }
};
```

#### 2. **Size Calculator Intelligence** (`assets/bike-comparison.js`)

The size calculator uses machine learning-like logic:

```javascript
// Teaching the size calculator new sizing rules
const sizingIntelligence = {
  rules: [
    {
      condition: (height, style, bikeType) => {
        return height >= 185 && style === 'sporty' && bikeType === 'mountain';
      },
      recommendation: 'L',
      confidence: 0.9,
      reasoning: 'Tall sporty riders prefer larger frames for aggressive positioning'
    },
    // Add your own sizing rules
    {
      condition: (height, style, bikeType) => {
        return height <= 160 && bikeType === 'cargo';
      },
      recommendation: 'S',
      confidence: 0.8,
      reasoning: 'Shorter riders need lower step-through height for cargo bikes'
    }
  ],
  
  // Advanced AI learning from customer feedback
  learningData: {
    'height-170-style-recreational': {
      recommendations: ['M', 'L'],
      customerSatisfaction: [0.9, 0.7], // Customer feedback scores
      adjustmentFactor: 0.1 // How much to adjust based on feedback
    }
  }
};
```

#### 3. **Customer Behavior AI** (Advanced Feature)

To implement customer behavior learning:

```javascript
// Location: assets/customer-intelligence.js (new file)
class CustomerIntelligence {
  constructor() {
    this.behaviorData = this.loadBehaviorData();
  }
  
  // Track customer interactions
  trackInteraction(action, productId, duration) {
    const interaction = {
      timestamp: Date.now(),
      action: action, // 'view', 'compare', 'size-check', 'book-ride'
      productId: productId,
      duration: duration,
      sessionId: this.getSessionId()
    };
    
    this.behaviorData.push(interaction);
    this.saveBehaviorData();
    this.updateRecommendations();
  }
  
  // AI recommendation engine
  getRecommendations(customerId = null) {
    const recentBehavior = this.getRecentBehavior();
    const preferences = this.extractPreferences(recentBehavior);
    
    return this.bikeDatabase.filter(bike => {
      return this.calculateRecommendationScore(bike, preferences) > 0.7;
    }).sort((a, b) => b.score - a.score);
  }
  
  // Teach the AI about customer preferences
  addPreferenceRule(condition, weight) {
    this.preferenceRules.push({
      condition: condition,
      weight: weight
    });
  }
}
```

### 4. **Teaching Through Theme Settings**

You can teach the AI through the Shopify admin:

```json
// Location: config/settings_schema.json - AI Learning Section
{
  "name": "🤖 AI Learning & Intelligence",
  "settings": [
    {
      "type": "header",
      "content": "Bike Knowledge Base"
    },
    {
      "type": "textarea",
      "id": "ai_bike_knowledge",
      "label": "Bike Intelligence Data",
      "info": "Add structured data about your bikes for AI recommendations",
      "default": "{\n  \"cityBikes\": {\n    \"characteristics\": [\"comfortable\", \"upright\", \"practical\"],\n    \"bestFor\": [\"commuting\", \"casual-riding\", \"city-exploration\"]\n  }\n}"
    },
    {
      "type": "textarea", 
      "id": "ai_customer_insights",
      "label": "Customer Behavior Insights",
      "info": "Teach the AI about your customer preferences",
      "default": "{\n  \"trends\": {\n    \"spring\": \"increased interest in mountain bikes\",\n    \"winter\": \"focus on commuter bikes with lights\"\n  }\n}"
    }
  ]
}
```

## 🚴 How the Bike Comparison Tool Works

### Architecture Overview

The bike comparison tool uses a sophisticated multi-layer system and is validated via Playwright suites (structure, labels, visual, a11y). Run `npx playwright test` to verify.

```
Customer Input → Data Processing → AI Analysis → Results Display
      ↓              ↓              ↓            ↓
   [Selections] → [Normalization] → [Scoring] → [UI Update]
```

### 1. **Data Structure** (`assets/bike-comparison.js`)

```javascript
const bikeData = {
  'city-comfort': {
    // Basic product info
    name: 'City Comfort Pro',
    price: '2,499',
    currency: 'CHF',
    
    // Technical specifications
    motor: 'Bosch Active Line Plus',
    battery: '400 Wh', 
    range: '60-100 km',
    weight: '22 kg',
    maxSpeed: '25 km/h',
    
    // Smart comparison features
    smartFeatures: {
      efficiency: 8.5, // out of 10
      comfort: 9.2,
      performance: 7.1,
      durability: 8.8,
      valueForMoney: 8.9
    },
    
    // AI-powered insights
    aiInsights: {
      bestFor: ['daily-commuting', 'weekend-rides', 'city-exploration'],
      weatherRating: 'all-weather',
      maintenanceLevel: 'low',
      learningCurve: 'beginner-friendly'
    }
  }
};
```

### 2. **Comparison Algorithm**

```javascript
class BikeComparisonEngine {
  constructor() {
    this.comparisonMatrix = this.initializeMatrix();
    this.weightingSystem = this.loadWeightingPreferences();
  }
  
  // Main comparison function
  compareBikes(bikeIds) {
    const bikes = bikeIds.map(id => this.getBikeData(id));
    const normalizedData = this.normalizeSpecs(bikes);
    const comparisonResults = this.generateComparison(normalizedData);
    
    return {
      bikes: bikes,
      comparison: comparisonResults,
      recommendations: this.generateRecommendations(comparisonResults),
      insights: this.generateInsights(bikes)
    };
  }
  
  // AI-powered normalization
  normalizeSpecs(bikes) {
    return bikes.map(bike => {
      return {
        ...bike,
        normalizedPrice: this.normalizePrice(bike.price),
        normalizedRange: this.normalizeRange(bike.range),
        normalizedWeight: this.normalizeWeight(bike.weight),
        // Convert text specs to comparable numbers
        motorPower: this.extractMotorPower(bike.motor),
        batteryCapacity: this.extractBatteryCapacity(bike.battery)
      };
    });
  }
  
  // Smart recommendation system
  generateRecommendations(comparisonData) {
    const insights = [];
    
    // Price-performance analysis
    const bestValue = this.findBestValue(comparisonData);
    if (bestValue) {
      insights.push({
        type: 'best-value',
        bike: bestValue.name,
        reason: `Best price-to-performance ratio at ${bestValue.price}`
      });
    }
    
    // Feature-based recommendations
    const mostComfortable = this.findMostComfortable(comparisonData);
    const mostPowerful = this.findMostPowerful(comparisonData);
    const longestRange = this.findLongestRange(comparisonData);
    
    return {
      insights: insights,
      bestValue: bestValue,
      categories: {
        comfort: mostComfortable,
        performance: mostPowerful,
        range: longestRange
      }
    };
  }
}
```

### 3. **User Interface Intelligence**

The UI adapts based on user behavior:

```javascript
// Smart UI that learns from user interactions
class IntelligentComparisonUI {
  constructor() {
    this.userPreferences = this.loadUserPreferences();
    this.interactionHistory = [];
  }
  
  // Adaptive interface based on user behavior
  updateInterface(userAction) {
    this.interactionHistory.push(userAction);
    
    // If user frequently looks at price, prioritize price comparisons
    if (this.getUserFocus() === 'price') {
      this.highlightPriceComparisons();
    }
    
    // If user compares range frequently, show range insights
    if (this.getUserFocus() === 'range') {
      this.showRangeCalculator();
    }
  }
  
  // Predictive text and suggestions
  suggestNextComparison(currentBikes) {
    const userProfile = this.buildUserProfile();
    const suggestedBikes = this.findSimilarBikes(currentBikes, userProfile);
    
    return suggestedBikes.map(bike => ({
      id: bike.id,
      name: bike.name,
      reason: `Similar to ${currentBikes[0].name} but with ${bike.differentiator}`
    }));
  }
}
```

### 4. **Real-time Updates and Learning**

The system continuously learns and improves:

```javascript
// Continuous learning system
class ComparisonLearningEngine {
  // Learn from customer interactions
  recordComparison(bikeIds, customerAction) {
    const comparisonData = {
      bikes: bikeIds,
      timestamp: Date.now(),
      customerAction: customerAction, // 'booked-ride', 'added-to-cart', 'left-page'
      sessionData: this.getSessionData()
    };
    
    this.learningDatabase.push(comparisonData);
    this.updateRecommendationWeights(comparisonData);
  }
  
  // Improve recommendations based on successful comparisons
  updateRecommendationWeights(data) {
    if (data.customerAction === 'booked-ride') {
      // Increase weights for features that led to booking
      this.increaseFeatureWeights(data.bikes);
    }
  }
  
  // A/B testing for comparison layouts
  getOptimalLayout(userSegment) {
    const testResults = this.abTestResults[userSegment];
    return testResults.bestPerformingLayout;
  }
}
```

## 📊 Teaching AI Through Data

### 1. **CSV Data Import**

You can teach the AI by importing CSV data:

```javascript
// CSV structure for bike data
// name,category,price,motor,battery,range,weight,comfort_score,performance_score
// "City Pro,city,2499,Bosch Active,400Wh,80km,22kg,9.2,7.1"

function importBikeData(csvData) {
  const bikes = this.parseCSV(csvData);
  bikes.forEach(bike => {
    this.bikeDatabase[bike.id] = {
      ...bike,
      aiInsights: this.generateAIInsights(bike),
      comparisonWeights: this.calculateWeights(bike)
    };
  });
}
```

### 2. **Customer Feedback Learning**

```javascript
// Learn from customer feedback
function processFeedback(bikeId, feedback) {
  const bike = this.bikeDatabase[bikeId];
  
  // Update AI scores based on feedback
  if (feedback.comfort > 8) {
    bike.smartFeatures.comfort += 0.1;
  }
  
  if (feedback.wouldRecommend === true) {
    bike.recommendationScore += 0.05;
  }
  
  // Update size calculator accuracy
  if (feedback.sizeAccurate === false) {
    this.sizingIntelligence.adjustRecommendation(
      feedback.customerHeight,
      feedback.actualPreferredSize
    );
  }
}
```

## 🎯 Advanced AI Features (Future Enhancements)

### 1. **Natural Language Processing**

```javascript
// Future: Natural language bike search
class NaturalLanguageProcessor {
  processBikeQuery(query) {
    // "I want a comfortable bike for commuting under 3000 CHF"
    const intent = this.extractIntent(query);
    const constraints = this.extractConstraints(query);
    
    return this.findMatchingBikes(intent, constraints);
  }
}
```

### 2. **Image Recognition**

```javascript
// Future: AI-powered bike identification from photos
class BikeImageRecognition {
  identifyBike(imageUrl) {
    return this.visionAPI.analyze(imageUrl)
      .then(features => this.matchToDatabase(features));
  }
}
```

### 3. **Predictive Analytics**

```javascript
// Future: Predict customer preferences
class PredictiveAnalytics {
  predictCustomerPreferences(behaviorData) {
    const model = this.trainedModels.customerPreference;
    return model.predict(behaviorData);
  }
}
```

## 📝 Getting Started with AI Teaching

### Step 1: Define Your Bike Knowledge
1. Open `assets/bike-comparison.js`
2. Add your bike models to the `bikeData` object
3. Include AI-relevant fields like `smartFeatures` and `aiInsights`

### Step 2: Customize Comparison Logic
1. Modify the comparison weights in `comparisonWeights`
2. Add custom comparison categories
3. Define what makes each bike unique

### Step 3: Train the Size Calculator
1. Add sizing rules based on your inventory
2. Include feedback from actual customers
3. Adjust recommendations based on returns/exchanges

### Step 4: Monitor and Improve
1. Use the test framework to validate AI accuracy
2. Monitor customer behavior through analytics
3. Continuously update the knowledge base

---

The AI systems in the Godspeed theme are designed to be both powerful and easy to customize. The bike comparison tool specifically uses intelligent algorithms to help customers make informed decisions while continuously learning from their interactions to improve recommendations over time.