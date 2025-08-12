/**
 * E-Bike Comparison Tool with AI Intelligence
 * Interactive comparison functionality with smart recommendations for Godspeed theme
 * Version: 2.0 - Enhanced with AI features
 */

// E-bike data with AI-enhanced intelligence
const bikeData = {
  'city-comfort': {
    name: 'City Comfort Pro',
    price: '2,499',
    motor: 'Bosch Active Line Plus',
    battery: '400 Wh',
    range: '60-100 km',
    weight: '24 kg',
    frame: 'Aluminium',
    gears: '8-Gang Shimano',
    brakes: 'Shimano Hydraulik',
    suspension: 'Federgabel vorne',
    // AI-powered insights
    aiInsights: {
      bestFor: ['commuting', 'casual-riding', 'weekend-trips', 'city-exploration'],
      weatherSuitability: 'all-weather',
      maintenanceLevel: 'low',
      userExperience: 'beginner-friendly',
      terrainSuitability: ['city', 'paved-paths', 'light-gravel']
    },
    smartScores: {
      comfort: 9.2,
      performance: 7.1,
      valueForMoney: 8.9,
      durability: 8.8,
      easeOfUse: 9.5
    }
  },
  'trekking-sport': {
    name: 'Trekking Sport X1',
    price: '3,299',
    motor: 'Bosch Performance CX',
    battery: '625 Wh',
    range: '80-120 km',
    weight: '26 kg',
    frame: 'Aluminium',
    gears: '12-Gang SRAM',
    brakes: 'SRAM Level Hydraulik',
    suspension: 'Federgabel vorne',
    aiInsights: {
      bestFor: ['long-distance', 'touring', 'mixed-terrain', 'fitness'],
      weatherSuitability: 'all-weather',
      maintenanceLevel: 'medium',
      userExperience: 'intermediate',
      terrainSuitability: ['city', 'country-roads', 'gravel', 'light-trails']
    },
    smartScores: {
      comfort: 8.5,
      performance: 8.9,
      valueForMoney: 8.2,
      durability: 9.1,
      easeOfUse: 8.0
    }
  },
  'mountain-trail': {
    name: 'Mountain Trail Pro',
    price: '4,799',
    motor: 'Shimano EP8',
    battery: '630 Wh',
    range: '60-90 km',
    weight: '23 kg',
    frame: 'Carbon',
    gears: '12-Gang Shimano XT',
    brakes: 'Shimano XT 4-Kolben',
    suspension: 'Full Suspension 140mm',
    aiInsights: {
      bestFor: ['trail-riding', 'mountain-biking', 'technical-terrain', 'adventure'],
      weatherSuitability: 'fair-weather-preferred',
      maintenanceLevel: 'high',
      userExperience: 'advanced',
      terrainSuitability: ['trails', 'mountains', 'rough-terrain', 'single-track']
    },
    smartScores: {
      comfort: 7.8,
      performance: 9.5,
      valueForMoney: 7.5,
      durability: 8.9,
      easeOfUse: 6.8
    }
  },
  'cargo-family': {
    name: 'Cargo Family+',
    price: '3,899',
    motor: 'Bosch Cargo Line',
    battery: '500 Wh',
    range: '50-80 km',
    weight: '35 kg',
    frame: 'Stahl verstärkt',
    gears: '8-Gang Shimano',
    brakes: 'Magura MT5 Hydraulik',
    suspension: 'Keine',
    aiInsights: {
      bestFor: ['family-transport', 'cargo-hauling', 'shopping', 'child-transport'],
      weatherSuitability: 'all-weather',
      maintenanceLevel: 'medium',
      userExperience: 'intermediate',
      terrainSuitability: ['city', 'paved-paths']
    },
    smartScores: {
      comfort: 8.0,
      performance: 7.5,
      valueForMoney: 8.7,
      durability: 9.3,
      easeOfUse: 7.2
    }
  }
};

// AI Intelligence Engine
const bikeIntelligence = {
  // Customer behavior tracking
  interactions: [],
  
  // Track user interactions for learning
  trackInteraction(action, bikeId, duration = null) {
    const interaction = {
      action: action, // 'viewed', 'compared', 'selected', 'booked-ride'
      bikeId: bikeId,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      duration: duration
    };
    
    this.interactions.push(interaction);
    
    // Store in localStorage for persistence
    const stored = JSON.parse(localStorage.getItem('bikeInteractions') || '[]');
    stored.push(interaction);
    localStorage.setItem('bikeInteractions', JSON.stringify(stored.slice(-100))); // Keep last 100
    
    // Update recommendations based on behavior
    this.updateRecommendations();
  },
  
  // Generate session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('bikeSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('bikeSessionId', sessionId);
    }
    return sessionId;
  },
  
  // Get smart recommendations based on behavior
  getRecommendations(currentBikes) {
    const recommendations = [];
    const interactions = JSON.parse(localStorage.getItem('bikeInteractions') || '[]');
    
    // Analyze user preferences from interactions
    const preferences = this.analyzePreferences(interactions);
    
    // Find similar bikes based on preferences
    for (const bikeId in bikeData) {
      if (!currentBikes.includes(bikeId)) {
        const score = this.calculateRecommendationScore(bikeData[bikeId], preferences);
        if (score > 0.7) {
          recommendations.push({
            bikeId: bikeId,
            bike: bikeData[bikeId],
            score: score,
            reason: this.getRecommendationReason(bikeData[bikeId], preferences)
          });
        }
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
  },
  
  // Analyze user preferences from interactions
  analyzePreferences(interactions) {
    const preferences = {
      priceRange: { min: 0, max: 10000 },
      preferredUse: [],
      performanceWeight: 0.5,
      comfortWeight: 0.5,
      valueWeight: 0.5
    };
    
    // Analyze viewed/compared bikes
    interactions.forEach(interaction => {
      if (bikeData[interaction.bikeId]) {
        const bike = bikeData[interaction.bikeId];
        
        // Update price preferences
        const price = parseInt(bike.price.replace(/[^\d]/g, ''));
        if (interaction.action === 'compared' || interaction.action === 'selected') {
          preferences.priceRange.min = Math.min(preferences.priceRange.min || price, price - 500);
          preferences.priceRange.max = Math.max(preferences.priceRange.max || price, price + 500);
        }
        
        // Update use case preferences
        if (bike.aiInsights && interaction.action !== 'viewed') {
          bike.aiInsights.bestFor.forEach(use => {
            if (!preferences.preferredUse.includes(use)) {
              preferences.preferredUse.push(use);
            }
          });
        }
      }
    });
    
    return preferences;
  },
  
  // Calculate recommendation score
  calculateRecommendationScore(bike, preferences) {
    let score = 0;
    let factors = 0;
    
    // Price match
    const price = parseInt(bike.price.replace(/[^\d]/g, ''));
    if (price >= preferences.priceRange.min && price <= preferences.priceRange.max) {
      score += 0.3;
      factors++;
    }
    
    // Use case match
    if (bike.aiInsights) {
      const commonUses = bike.aiInsights.bestFor.filter(use => 
        preferences.preferredUse.includes(use)
      );
      score += (commonUses.length / bike.aiInsights.bestFor.length) * 0.4;
      factors++;
    }
    
    // Smart scores alignment
    if (bike.smartScores) {
      const avgScore = (bike.smartScores.comfort + bike.smartScores.performance + 
                       bike.smartScores.valueForMoney) / 3;
      score += (avgScore / 10) * 0.3;
      factors++;
    }
    
    return factors > 0 ? score / factors : 0;
  },
  
  // Get recommendation reason
  getRecommendationReason(bike, preferences) {
    const reasons = [];
    
    if (bike.aiInsights) {
      const commonUses = bike.aiInsights.bestFor.filter(use => 
        preferences.preferredUse.includes(use)
      );
      if (commonUses.length > 0) {
        reasons.push(`Great for ${commonUses.join(', ')}`);
      }
    }
    
    if (bike.smartScores && bike.smartScores.valueForMoney > 8.5) {
      reasons.push('Excellent value for money');
    }
    
    if (bike.smartScores && bike.smartScores.comfort > 9) {
      reasons.push('Exceptionally comfortable');
    }
    
    return reasons.join('. ') || 'Matches your preferences';
  },
  
  // Update recommendations display
  updateRecommendations() {
    const currentBikes = Array.from(document.querySelectorAll('.bike-select'))
      .map(select => select.value)
      .filter(value => value);
    
    if (currentBikes.length > 0) {
      const recommendations = this.getRecommendations(currentBikes);
      this.displayRecommendations(recommendations);
    }
  },
  
  // Display recommendations in UI
  displayRecommendations(recommendations) {
    let recContainer = document.getElementById('ai-recommendations');
    if (!recContainer) {
      // Create container if it doesn't exist
      const comparisonTool = document.querySelector('.bike-comparison-tool');
      if (comparisonTool) {
        recContainer = document.createElement('div');
        recContainer.id = 'ai-recommendations';
        recContainer.className = 'ai-recommendations';
        comparisonTool.appendChild(recContainer);
      }
    }
    
    if (recContainer && recommendations.length > 0) {
      let html = '<div class="ai-recommendations-content">';
      html += '<h3>🤖 AI Recommendations</h3>';
      html += '<p class="ai-subtitle">Based on your preferences, you might also like:</p>';
      
      recommendations.forEach(rec => {
        html += `<div class="ai-recommendation-card">`;
        html += `<h4>${rec.bike.name}</h4>`;
        html += `<p class="rec-price">CHF ${rec.bike.price}</p>`;
        html += `<p class="rec-reason">${rec.reason}</p>`;
        html += `<button class="btn-add-to-compare" data-bike-id="${rec.bikeId}">Add to Comparison</button>`;
        html += `</div>`;
      });
      
      html += '</div>';
      recContainer.innerHTML = html;
      
      // Add click handlers
      recContainer.querySelectorAll('.btn-add-to-compare').forEach(btn => {
        btn.addEventListener('click', function() {
          const bikeId = this.getAttribute('data-bike-id');
          addBikeToComparison(bikeId);
        });
      });
    }
  }
};

// Size calculator data
const sizeCharts = {
  city: {
    150: 'XS (44-46 cm)',
    160: 'XS (44-46 cm)',
    170: 'S (48-50 cm)',
    180: 'M (52-54 cm)',
    190: 'L (56-58 cm)',
    200: 'XL (60-62 cm)'
  },
  trekking: {
    150: 'XS (44-46 cm)',
    160: 'XS (44-46 cm)',
    170: 'S (48-50 cm)',
    180: 'M (52-54 cm)',
    190: 'L (56-58 cm)',
    200: 'XL (60-62 cm)'
  },
  mountain: {
    150: 'XS (38-40 cm)',
    160: 'XS (38-40 cm)',
    170: 'S (42-44 cm)',
    180: 'M (46-48 cm)',
    190: 'L (50-52 cm)',
    200: 'XL (54-56 cm)'
  },
  cargo: {
    150: 'S (46-48 cm)',
    165: 'S (46-48 cm)',
    180: 'M (50-52 cm)',
    200: 'L (54-56 cm)'
  }
};

// Initialize comparison tool with AI features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeComparisonTool();
  initializeSizeCalculator();
  initializeAIFeatures();
});

// Initialize AI features
function initializeAIFeatures() {
  // Track page view
  bikeIntelligence.trackInteraction('page-viewed', 'comparison-tool');
  
  // Add smart insights container
  const comparisonTable = document.querySelector('.comparison-table');
  if (comparisonTable) {
    const insightsDiv = document.createElement('div');
    insightsDiv.id = 'smart-insights';
    insightsDiv.className = 'smart-insights';
    comparisonTable.parentNode.insertBefore(insightsDiv, comparisonTable.nextSibling);
  }
}

function initializeComparisonTool() {
  const bikeSelects = document.querySelectorAll('.bike-select');
  
  bikeSelects.forEach((select) => {
    select.addEventListener('change', function() {
      const bikeKey = this.value;
      const column = this.getAttribute('data-column');
      updateComparison(bikeKey, column);
    });
  });
}

function updateComparison(bikeKey, column) {
  if (bikeKey && bikeData[bikeKey]) {
    const bike = bikeData[bikeKey];
    
    // Track user interaction
    bikeIntelligence.trackInteraction('compared', bikeKey);
    
    // Update all fields for the selected column
    updateField('price-' + column, bike.price);
    updateField('motor-' + column, bike.motor);
    updateField('battery-' + column, bike.battery);
    updateField('range-' + column, bike.range);
    updateField('weight-' + column, bike.weight);
    updateField('frame-' + column, bike.frame);
    updateField('gears-' + column, bike.gears);
    updateField('brakes-' + column, bike.brakes);
    updateField('suspension-' + column, bike.suspension);
    
    // Update smart insights
    updateSmartInsights();
    
    // Update AI recommendations
    bikeIntelligence.updateRecommendations();
  } else {
    // Clear all fields for the column
    clearColumn(column);
  }
}

// Add bike to comparison from AI recommendation
function addBikeToComparison(bikeId) {
  // Find empty select or replace least recently used
  const selects = document.querySelectorAll('.bike-select');
  let targetSelect = null;
  
  // Look for empty select
  for (const select of selects) {
    if (!select.value) {
      targetSelect = select;
      break;
    }
  }
  
  // If all full, use the last one
  if (!targetSelect) {
    targetSelect = selects[selects.length - 1];
  }
  
  if (targetSelect) {
    targetSelect.value = bikeId;
    const column = targetSelect.getAttribute('data-column');
    updateComparison(bikeId, column);
    
    // Track recommendation usage
    bikeIntelligence.trackInteraction('recommendation-used', bikeId);
  }
}

// Generate and display smart insights
function updateSmartInsights() {
  const selectedBikes = [];
  const selects = document.querySelectorAll('.bike-select');
  
  selects.forEach(select => {
    if (select.value && bikeData[select.value]) {
      selectedBikes.push(bikeData[select.value]);
    }
  });
  
  if (selectedBikes.length > 1) {
    generateSmartComparison(selectedBikes);
  } else {
    const insightsDiv = document.getElementById('smart-insights');
    if (insightsDiv) {
      insightsDiv.innerHTML = '';
    }
  }
}

// Generate intelligent comparison insights
function generateSmartComparison(bikes) {
  const insights = document.getElementById('smart-insights');
  if (!insights) return;
  
  let html = '<div class="ai-insights"><h3>🤖 Smart Insights</h3>';
  
  // Price analysis
  const prices = bikes.map(b => parseInt(b.price.replace(/[^\d]/g, '')));
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const cheapest = bikes[prices.indexOf(Math.min(...prices))];
  const mostExpensive = bikes[prices.indexOf(Math.max(...prices))];
  
  html += `<div class="insight-card">`;
  html += `<h4>💰 Price Analysis</h4>`;
  html += `<p><strong>Best Value:</strong> ${cheapest.name} at CHF ${cheapest.price}</p>`;
  if (prices.length > 2) {
    html += `<p><strong>Average Price:</strong> CHF ${Math.round(avgPrice).toLocaleString()}</p>`;
  }
  if (mostExpensive !== cheapest) {
    const priceDiff = prices[prices.indexOf(Math.max(...prices))] - prices[prices.indexOf(Math.min(...prices))];
    html += `<p><strong>Price Range:</strong> CHF ${priceDiff.toLocaleString()} difference</p>`;
  }
  html += `</div>`;
  
  // Performance comparison
  html += `<div class="insight-card">`;
  html += `<h4>⚡ Performance Comparison</h4>`;
  
  // Range analysis
  const ranges = bikes.map(b => {
    const rangeMatch = b.range.match(/(\d+)-(\d+)/);
    return rangeMatch ? parseInt(rangeMatch[2]) : 0;
  });
  const longestRange = bikes[ranges.indexOf(Math.max(...ranges))];
  html += `<p><strong>Longest Range:</strong> ${longestRange.name} with ${longestRange.range}</p>`;
  
  // Motor power
  const powerfulMotors = ['Performance CX', 'EP8', 'Performance Line CX'];
  const mostPowerful = bikes.find(b => powerfulMotors.some(motor => b.motor.includes(motor)));
  if (mostPowerful) {
    html += `<p><strong>Most Powerful:</strong> ${mostPowerful.name} with ${mostPowerful.motor}</p>`;
  }
  
  html += `</div>`;
  
  // Smart recommendations based on scores
  if (bikes.every(b => b.smartScores)) {
    html += `<div class="insight-card">`;
    html += `<h4>🎯 AI Recommendations</h4>`;
    
    // Find best for each category
    const categories = {
      comfort: { name: 'Most Comfortable', icon: '🛋️' },
      performance: { name: 'Best Performance', icon: '🚀' },
      valueForMoney: { name: 'Best Value', icon: '💎' },
      easeOfUse: { name: 'Easiest to Use', icon: '👍' }
    };
    
    for (const [key, info] of Object.entries(categories)) {
      const scores = bikes.map(b => ({ bike: b, score: b.smartScores[key] }));
      const best = scores.reduce((max, current) => current.score > max.score ? current : max);
      
      if (best.score > 8) {
        html += `<p>${info.icon} <strong>${info.name}:</strong> ${best.bike.name} (${best.score}/10)</p>`;
      }
    }
    
    html += `</div>`;
  }
  
  // Use case recommendations
  if (bikes.every(b => b.aiInsights)) {
    html += `<div class="insight-card">`;
    html += `<h4>🎪 Best Use Cases</h4>`;
    
    bikes.forEach(bike => {
      const topUses = bike.aiInsights.bestFor.slice(0, 2).join(', ');
      html += `<p><strong>${bike.name}:</strong> ${topUses}</p>`;
    });
    
    html += `</div>`;
  }
  
  html += '</div>';
  insights.innerHTML = html;
}

function updateField(fieldId, value) {
  const element = document.getElementById(fieldId);
  if (element) {
    element.textContent = value;
  }
}

function clearColumn(column) {
  const fields = ['price', 'motor', 'battery', 'range', 'weight', 'frame', 'gears', 'brakes', 'suspension'];
  
  fields.forEach(field => {
    updateField(field + '-' + column, '-');
  });
}

function resetComparison() {
  const selects = document.querySelectorAll('.bike-select');
  const columns = ['a', 'b', 'c'];
  
  // Reset all selects
  selects.forEach(select => {
    select.value = '';
  });
  
  // Clear all columns
  columns.forEach(column => {
    clearColumn(column);
  });
}

function initializeSizeCalculator() {
  document.querySelectorAll('.calculate-btn').forEach(btn => {
    btn.addEventListener('click', calculateSize);
  });
}

function calculateSize() {
  const heightInput = document.getElementById('height');
  const inseamInput = document.getElementById('inseam');
  const bikeTypeSelect = document.getElementById('bike-type');
  const resultDiv = document.getElementById('result');
  const sizeResult = document.getElementById('size-result');
  const sizeAdvice = document.getElementById('size-advice');
  
  if (!heightInput || !inseamInput || !bikeTypeSelect) {
    console.error('Size calculator elements not found');
    return;
  }
  
  const height = parseInt(heightInput.value);
  const inseam = parseInt(inseamInput.value);
  const bikeType = bikeTypeSelect.value;
  
  const S = (window.__sizeCalcStrings || {});
  if (!height || !inseam) {
    alert(S.validation_missing || 'Please enter height and inseam.');
    return;
  }
  if (height < 140 || height > 220) {
    alert(S.validation_height || 'Enter a realistic height between 140 and 220 cm.');
    return;
  }
  if (inseam < 60 || inseam > 110) {
    alert(S.validation_inseam || 'Enter a realistic inseam between 60 and 110 cm.');
    return;
  }
  
  const frameSize = calculateFrameSize(height, bikeType);
  const advice = generateAdvice(height, inseam, bikeType);
  
  if (sizeResult && sizeAdvice && resultDiv) {
    sizeResult.textContent = frameSize;
    sizeAdvice.textContent = advice;
    resultDiv.hidden = false;
    
    // Smooth scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function calculateFrameSize(height, bikeType) {
  const chart = sizeCharts[bikeType] || sizeCharts.city;
  
  // Find the appropriate size based on height
  for (let minHeight in chart) {
    if (height <= parseInt(minHeight)) {
      return chart[minHeight];
    }
  }
  
  // If height is above all ranges, return the largest size
  const maxHeight = Math.max(...Object.keys(chart).map(h => parseInt(h)));
  return chart[maxHeight];
}

function generateAdvice(height, inseam, bikeType) {
  const S = (window.__sizeCalcStrings || {});
  let advice = (S.result_advice_prefix || 'This recommendation is a guideline. ') ;
  
  // Calculate inseam to height ratio
  const ratio = inseam / height;
  
  if (ratio < 0.43) {
    advice += (S.leg_short || 'You have relatively short legs — a smaller frame may be more comfortable. ') ;
  } else if (ratio > 0.47) {
    advice += (S.leg_long || 'You have relatively long legs — a larger frame may be suitable. ') ;
  }
  
  if (bikeType === 'cargo') {
    advice += (S.cargo_note || 'Cargo bikes have special geometries. ');
  }
  advice += (S.consultation || 'For the best fit, we recommend an in‑store consultation and test ride.');
  
  return advice;
}

// Export functions for global access
window.resetComparison = resetComparison;
window.calculateSize = calculateSize;
window.bikeIntelligence = bikeIntelligence;
window.updateSmartInsights = updateSmartInsights;