#!/usr/bin/env python3
"""
Create the missing Range Calculator page in Shopify
"""

import requests
import json

# Shopify API credentials (replace with your actual values)
SHOPIFY_STORE = "your-store.myshopify.com"
ACCESS_TOKEN = "your-access-token-here"

headers = {
    "X-Shopify-Access-Token": ACCESS_TOKEN,
    "Content-Type": "application/json"
}

def create_range_calculator_page():
    """Create the Range Calculator page"""
    url = f"https://{SHOPIFY_STORE}/admin/api/2024-01/pages.json"
    
    page_content = """
    <div class="range-calculator-page">
        <h1>E-Bike Range Calculator</h1>
        <p>Calculate the estimated range of your e-bike based on various factors including battery capacity, motor power, terrain, weather conditions, and riding style.</p>
        
        <div class="range-calculator-form">
            <div class="form-group">
                <label for="battery-capacity">Battery Capacity (Wh):</label>
                <input type="number" id="battery-capacity" min="200" max="1000" value="500" />
            </div>
            
            <div class="form-group">
                <label for="motor-power">Motor Power (W):</label>
                <select id="motor-power">
                    <option value="250">250W</option>
                    <option value="500">500W</option>
                    <option value="750">750W</option>
                    <option value="1000">1000W</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="terrain">Terrain:</label>
                <select id="terrain">
                    <option value="flat">Flat</option>
                    <option value="hilly">Hilly</option>
                    <option value="mountainous">Mountainous</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="rider-weight">Rider Weight (kg):</label>
                <input type="number" id="rider-weight" min="40" max="150" value="75" />
            </div>
            
            <div class="form-group">
                <label for="assist-level">Assist Level:</label>
                <select id="assist-level">
                    <option value="eco">Eco (20%)</option>
                    <option value="tour">Tour (50%)</option>
                    <option value="sport">Sport (75%)</option>
                    <option value="turbo">Turbo (100%)</option>
                </select>
            </div>
            
            <button type="button" class="btn btn-primary" onclick="calculateRange()">Calculate Range</button>
        </div>
        
        <div id="range-result" class="result-container" style="display: none;">
            <h3>Estimated Range</h3>
            <div class="range-display">
                <span id="range-value">--</span> km
            </div>
            <div class="range-factors">
                <h4>Factors affecting your range:</h4>
                <ul id="range-factors-list"></ul>
            </div>
        </div>
        
        <script>
        function calculateRange() {
            const battery = parseInt(document.getElementById('battery-capacity').value);
            const motor = parseInt(document.getElementById('motor-power').value);
            const terrain = document.getElementById('terrain').value;
            const weight = parseInt(document.getElementById('rider-weight').value);
            const assist = document.getElementById('assist-level').value;
            
            // Base calculation: Wh / (W per km based on factors)
            let consumptionPerKm = 8; // Base consumption in Wh/km
            
            // Motor power factor
            consumptionPerKm += (motor - 250) * 0.002;
            
            // Terrain factor
            const terrainFactors = { flat: 1, hilly: 1.3, mountainous: 1.6 };
            consumptionPerKm *= terrainFactors[terrain];
            
            // Weight factor (base 75kg)
            consumptionPerKm *= (weight / 75);
            
            // Assist level factor
            const assistFactors = { eco: 0.6, tour: 0.8, sport: 1.1, turbo: 1.4 };
            consumptionPerKm *= assistFactors[assist];
            
            // Calculate range
            const estimatedRange = Math.round(battery / consumptionPerKm);
            
            // Display result
            document.getElementById('range-value').textContent = estimatedRange;
            document.getElementById('range-result').style.display = 'block';
            
            // Add factors
            const factorsList = document.getElementById('range-factors-list');
            factorsList.innerHTML = '';
            factorsList.innerHTML += `<li>Battery: ${battery}Wh</li>`;
            factorsList.innerHTML += `<li>Motor: ${motor}W</li>`;
            factorsList.innerHTML += `<li>Terrain: ${terrain}</li>`;
            factorsList.innerHTML += `<li>Weight: ${weight}kg</li>`;
            factorsList.innerHTML += `<li>Assist: ${assist}</li>`;
            factorsList.innerHTML += `<li>Consumption: ${consumptionPerKm.toFixed(1)}Wh/km</li>`;
        }
        </script>
        
        <style>
        .range-calculator-page { max-width: 600px; margin: 0 auto; padding: 2rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
        .form-group input, .form-group select { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
        .btn { padding: 1rem 2rem; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #005a87; }
        .result-container { margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 4px; }
        .range-display { font-size: 2rem; font-weight: bold; text-align: center; margin: 1rem 0; }
        .range-factors { margin-top: 1rem; }
        .range-factors ul { list-style-type: disc; padding-left: 2rem; }
        </style>
    </div>
    """
    
    payload = {
        "page": {
            "title": "Range Calculator",
            "handle": "range-calculator",
            "body_html": page_content,
            "published": True,
            "template_suffix": "range-calculator"
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201:
        page = response.json()["page"]
        print(f"✅ Created page: {page['title']} (/pages/{page['handle']})")
        return True
    elif response.status_code == 422:
        error = response.json()
        if "Handle has already been taken" in str(error):
            print(f"⚠️  Page already exists: Range Calculator")
            return False
        else:
            print(f"❌ Error creating page: {error}")
            return False
    else:
        print(f"❌ HTTP {response.status_code}: {response.text}")
        return False

if __name__ == '__main__':
    print("📄 Creating Range Calculator page...")
    create_range_calculator_page()