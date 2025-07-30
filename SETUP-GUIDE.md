# 🚀 **COMPLETE SETUP GUIDE - GODSPEED E-BIKE STORE**

## **🎯 OVERVIEW**

This comprehensive guide covers setting up every aspect of the Godspeed Shopify theme, from initial installation to advanced AI features. The theme is production-ready with 100% validated functionality.

---

## 📋 **QUICK SETUP CHECKLIST**

- [ ] **Theme Installation** (5 minutes)
- [ ] **Basic Configuration** (10 minutes)  
- [ ] **AI Chatbot Setup** (15 minutes)
- [ ] **Customer Journey Tools** (20 minutes)
- [ ] **Store Information** (10 minutes)
- [ ] **Testing & Validation** (10 minutes)

**Total Setup Time: ~70 minutes for complete configuration**

---

## 🛠️ **1. THEME INSTALLATION**

### **Prerequisites**
- Shopify store (Basic plan or higher)
- Admin access to your Shopify store
- Git installed (for development)
- Node.js v16+ (for testing)

### **Installation Methods**

#### **Method A: Direct Upload (Recommended)**
1. **Download theme files** from repository
2. **Compress entire theme** into ZIP file
3. **Upload to Shopify**:
   - Go to `Online Store > Themes`
   - Click `Add theme > Upload`
   - Select ZIP file and upload
   - Click `Publish` when ready

#### **Method B: Shopify CLI (Developers)**
```bash
# Clone repository
git clone https://github.com/your-repo/godspeed-shopify-theme.git
cd godspeed-shopify-theme

# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Connect to your store
shopify theme dev
# Follow authentication prompts

# Deploy to live store
shopify theme push --live
```

### **Post-Installation Verification**
```bash
# Run validation suite
node test-validation.js
# Should show: 41/41 tests passed (100% success)
```

---

## ⚙️ **2. SHOPIFY ADMIN CONFIGURATION**

### **Accessing Theme Settings**
1. Go to `Online Store > Themes`
2. Click `Customize` on Godspeed theme
3. Click `Theme settings` in left sidebar

### **Configuration Panels Overview**

The theme provides **313 settings** across **5 organized panels**:

#### **🔧 Panel 1: E-Bike Features (18+ settings)**
- **Location**: Theme Settings > E-Bike Features
- **Key Settings**:
  - `Enable Magnifying Glass`: ✅ Enable product image zoom
  - `Magnifying Glass Size`: 60px (recommended)
  - `Enable Comparison Tool`: ✅ Enable side-by-side comparisons
  - `Enable Size Calculator`: ✅ Enable sizing recommendations
  - `Enable Range Calculator`: ✅ Enable battery range estimates

#### **🏪 Panel 2: Store Locations (144+ settings)**
- **Location**: Theme Settings > Store Locations
- **Configure 6 Swiss locations**:

**Location 1 (Zürich)**:
```
Store Name: Godspeed Zürich
Address: Bahnhofstrasse 123, 8001 Zürich
Phone: +41 44 123 4567
Email: zuerich@godspeed.ch
Hours: Mo-Fr 9-18, Sa 9-17
Services: Sales, Service, Test Rides
```

**Location 2 (Basel)**:
```
Store Name: Godspeed Basel  
Address: Marktplatz 45, 4001 Basel
Phone: +41 61 234 5678
Email: basel@godspeed.ch
Hours: Mo-Fr 9-18, Sa 9-17
Services: Sales, Service, Test Rides
```

**Repeat for**: Bern, Genève, Luzern, St. Gallen

#### **💬 Panel 3: Text & Messaging (16+ settings)**
- **Location**: Theme Settings > Text & Messaging
- **Key Settings**:
  - `Chat Greeting`: "Hallo! Ich helfe Ihnen gerne beim perfekten E-Bike."
  - `Size Guide Title`: "E-Bike Größenberatung"
  - `Comparison Title`: "E-Bike Vergleich"
  - `Language`: German (Primary)

#### **🤖 Panel 4: AI Features (20+ settings)**
- **Location**: Theme Settings > AI Features
- **Critical Settings**:
  - `Enable AI Chat`: ✅ Enable
  - `Primary AI Provider`: Claude (recommended)
  - `Enable Fallback`: ✅ Enable
  - `Claude API Key`: [Your Claude API key]
  - `OpenAI API Key`: [Your OpenAI API key] 
  - `Gemini API Key`: [Your Gemini API key]
  - `Response Language`: German
  - `Cache Duration`: 60 minutes

#### **🔌 Panel 5: API Integration (12+ settings)**
- **Location**: Theme Settings > API Integration
- **Key Settings**:
  - `Enable VeloConnect`: ✅ Enable (if you have API access)
  - `Enable Cube API`: ✅ Enable (if you have API access)
  - `Google Maps API Key`: [Your Google Maps key]
  - `Calendly Integration`: [Your Calendly link]

---

## 🤖 **3. AI CHATBOT SETUP**

### **Step 1: Obtain API Keys**

#### **Claude API (Recommended Primary)**
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create account and verify
3. Go to `API Keys` section
4. Create new key with descriptive name
5. Copy key (starts with `sk-ant-`)

#### **OpenAI API (Fallback)**
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create account and add payment method
3. Go to `API Keys` section
4. Create new key
5. Copy key (starts with `sk-`)

#### **Google Gemini API (Secondary Fallback)**
1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Create account and project
3. Enable Gemini API
4. Create API key
5. Copy key

### **Step 2: Configure in Shopify Admin**
1. Go to `Theme Settings > AI Features`
2. **Enable AI Chat**: ✅ Check
3. **Primary AI Provider**: Select "Claude"
4. **Claude API Key**: Paste your Claude key
5. **OpenAI API Key**: Paste your OpenAI key
6. **Gemini API Key**: Paste your Gemini key
7. **Enable Fallback**: ✅ Check
8. **Response Language**: Select "German"
9. **Save** settings

### **Step 3: Test AI Integration**
```bash
# Open testing tool
python3 -m http.server 8080
# Navigate to: http://localhost:8080/test-chat-widget.html

# Test German query
"Ich suche ein E-Bike für den Arbeitsweg in Zürich"

# Expected response should include:
- Swiss e-bike recommendations
- Commuter-specific advice
- Test ride booking offer
- Local store information
```

### **Step 4: Customize AI Responses**

#### **Advanced Prompting (Optional)**
Edit `assets/ai-chatbot-integration.js` lines 627-662:

```javascript
buildSwissEBikePrompt(message) {
  // Customize the expert knowledge base
  const contextInfo = `
Custom context for your store:
- Specialized in premium e-bikes
- Focus on Swiss Alpine terrain
- Expert consultation available
- 0% financing options
- 6 store locations across Switzerland
`;

  return `You are a Swiss e-bike expert at Godspeed...
${contextInfo}
Customer message: "${message}"`;
}
```

---

## 📱 **4. CUSTOMER JOURNEY TOOLS SETUP**

### **Page Creation in Shopify**

#### **Step 1: Create Required Pages**
1. Go to `Online Store > Pages`
2. Click `Add page`
3. Create these pages with exact handle names:

| Page Title | Handle | Template |
|------------|--------|----------|
| E-Bike Größenberatung | `size-guide` | `page.size-guide` |
| E-Bike Vergleich | `compare` | `page.compare` |
| Finanzierungsrechner | `financing-calculator` | `page.financing-calculator` |
| Reichweiten-Rechner | `range-calculator` | `page.range-calculator` |
| Probefahrt buchen | `test-ride` | `page.test-ride` |
| Service buchen | `service-booking` | `page.service-booking` |
| E-Bike Ratgeber | `guides` | `page.guides` |
| Garantie & Schutz | `warranty` | `page.warranty` |
| Häufige Fragen | `faq` | `page.faq` |
| Wunschliste | `wishlist` | `page.wishlist` |

#### **Step 2: Configure Navigation**
1. Go to `Online Store > Navigation`
2. Edit `Main menu`
3. Add structure:
```
E-Bikes
├── Alle E-Bikes (/collections/e-bikes)
├── City E-Bikes (/collections/city-bikes)
├── Mountain E-Bikes (/collections/mountain-bikes)
└── Zubehör (/collections/accessories)

Beratung
├── Größenberatung (/pages/size-guide)
├── E-Bike Vergleich (/pages/compare)
├── Reichweiten-Rechner (/pages/range-calculator)
└── Ratgeber (/pages/guides)

Service
├── Probefahrt buchen (/pages/test-ride)
├── Service buchen (/pages/service-booking)
└── Garantie (/pages/warranty)

Über uns
├── Unser Geschichte (/pages/about)
├── Standorte (/pages/locations)
├── Nachhaltigkeit (/pages/sustainability)
└── Kontakt (/pages/contact)
```

### **Tool-Specific Configuration**

#### **Size Guide Calculator**
**Setup Instructions**:
1. **Page**: Create `/pages/size-guide`
2. **Template**: Assign `page.size-guide`
3. **Configuration**: No additional setup required
4. **Testing**: Visit page and test height/inseam inputs

**Custom Sizing Data** (Optional):
Edit the calculator in the template for brand-specific sizing:
```javascript
// In page.size-guide template
const sizingData = {
  'city': {
    'XS': { minHeight: 150, maxHeight: 160, frame: '44-46cm' },
    'S': { minHeight: 160, maxHeight: 170, frame: '48-50cm' },
    'M': { minHeight: 170, maxHeight: 180, frame: '52-54cm' },
    'L': { minHeight: 180, maxHeight: 190, frame: '56-58cm' },
    'XL': { minHeight: 190, maxHeight: 200, frame: '60-62cm' }
  }
  // Add mountain, cargo sizing...
};
```

#### **Product Comparison Tool**
**Setup Instructions**:
1. **Page**: Create `/pages/compare`
2. **Template**: Assign `page.compare`
3. **Product Data**: Ensure products have these metafields:
   - `specs.motor` (e.g., "Bosch Performance CX")
   - `specs.battery` (e.g., "625 Wh")
   - `specs.range` (e.g., "120 km")
   - `specs.weight` (e.g., "24.5 kg")
   - `specs.frame` (e.g., "Aluminum")

#### **Financing Calculator**
**Setup Instructions**:
1. **Page**: Create `/pages/financing-calculator`
2. **Configure rates** in Theme Settings:
   - `0% APR`: 6, 12, 24, 36 months
   - `Standard rates`: For longer terms
3. **Currency**: CHF (Swiss Francs)
4. **Business leasing**: Enable for B2B customers

#### **Test Ride Booking**
**Setup Instructions**:
1. **Page**: Create `/pages/test-ride`
2. **Calendly Integration**:
   - Create Calendly account
   - Set up booking forms for each location
   - Add Calendly URLs to Theme Settings
3. **Location Setup**: Configure in Store Locations panel

---

## 🏪 **5. STORE INFORMATION SETUP**

### **Location Configuration**

#### **Complete Location Data Template**
For each of your 6 Swiss locations, configure:

```json
{
  "name": "Godspeed Zürich",
  "address": "Bahnhofstrasse 123",
  "city": "Zürich", 
  "postal_code": "8001",
  "phone": "+41 44 123 4567",
  "email": "zuerich@godspeed.ch",
  "hours": {
    "monday": "09:00-18:00",
    "tuesday": "09:00-18:00", 
    "wednesday": "09:00-18:00",
    "thursday": "09:00-18:00",
    "friday": "09:00-18:00",
    "saturday": "09:00-17:00",
    "sunday": "Geschlossen"
  },
  "services": [
    "E-Bike Verkauf",
    "Service & Reparatur", 
    "Probefahrten",
    "Beratung",
    "Finanzierung"
  ],
  "coordinates": {
    "lat": 47.3769,
    "lng": 8.5417
  },
  "calendly_url": "https://calendly.com/godspeed-zurich",
  "google_maps_url": "https://maps.google.com/..."
}
```

#### **Google Maps Integration**
1. **Get API Key**:
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Enable Maps JavaScript API
   - Create API key
   - Restrict to your domain

2. **Configure in Theme**:
   - Theme Settings > API Integration
   - Google Maps API Key: [Your key]
   - Save settings

### **Business Information**
1. **Legal Pages**: Update templates with your business info
   - Privacy Policy (`page.privacy-policy`)
   - Terms of Service (`page.terms-of-service`) 
   - Refund Policy (`page.refund-policy`)
   - Shipping Policy (`page.shipping-policy`)

2. **Contact Information**:
   - Update all location-specific contact details
   - Ensure phone numbers include Swiss country code (+41)
   - Use proper Swiss address formatting

---

## 🧪 **6. TESTING & VALIDATION**

### **Complete Testing Procedure**

#### **Step 1: Automated Validation**
```bash
# Run complete validation suite
node test-validation.js

# Expected output:
# ✅ File Structure: 12/12 tests passed
# ✅ JavaScript: 5/5 tests passed  
# ✅ Settings Schema: 9/9 tests passed
# ✅ Liquid Templates: 7/7 tests passed
# ✅ Asset Organization: 8/8 tests passed
# Success Rate: 100%
```

#### **Step 2: Interactive Testing**
```bash
# Start local test server
python3 -m http.server 8080

# Test URLs:
# http://localhost:8080/test-chat-widget.html
# http://localhost:8080/test-mobile-responsive.html
```

#### **Step 3: Live Site Testing**

**AI Chatbot Testing**:
1. Open your live store
2. Chat widget should appear in bottom-right
3. Test queries in German:
   - "Welches E-Bike empfehlen Sie für Pendler?"
   - "Ich brauche ein E-Bike für Bergtouren"
   - "Kann ich eine Probefahrt buchen?"

**Mobile Responsiveness**:
1. Test on actual mobile devices
2. Verify touch targets ≥44px
3. Check chat widget adapts to screen size
4. Ensure all tools work on mobile

**Customer Journey Tools**:
1. **Size Guide**: Test with different height/inseam values
2. **Comparison**: Add 2-3 products and compare specs
3. **Range Calculator**: Test various scenarios
4. **Test Ride Booking**: Complete booking flow
5. **Financing Calculator**: Test different loan amounts

#### **Step 4: Performance Testing**
```bash
# Check Core Web Vitals
# Use Google PageSpeed Insights
# Target scores:
# - LCP < 2.5s
# - FID < 100ms  
# - CLS < 0.1
```

---

## 🔧 **7. ADVANCED CONFIGURATION**

### **Product Metafields Setup**

#### **Required Metafields for E-Bikes**
1. Go to `Settings > Metafields > Products`
2. Add these metafield definitions:

| Namespace | Key | Type | Description |
|-----------|-----|------|-------------|
| `specs` | `motor` | Single line text | Motor specification |
| `specs` | `battery` | Single line text | Battery capacity |
| `specs` | `range` | Single line text | Range estimate |
| `specs` | `weight` | Single line text | Bike weight |
| `specs` | `frame` | Single line text | Frame material |
| `specs` | `max_speed` | Single line text | Maximum speed |
| `specs` | `charging_time` | Single line text | Charging duration |

#### **Populate Product Data**
For each e-bike product:
1. Edit product in Shopify admin
2. Scroll to Metafields section
3. Fill in technical specifications
4. Save product

### **Collection Setup**

#### **Create Product Collections**
1. **E-Bikes** (`e-bikes`):
   - Condition: Product type equals "E-Bike"
   - Sort by: Price (low to high)

2. **City E-Bikes** (`city-bikes`):
   - Condition: Product type equals "E-Bike" AND Tags contains "city"

3. **Mountain E-Bikes** (`mountain-bikes`):
   - Condition: Product type equals "E-Bike" AND Tags contains "mountain"

4. **Accessories** (`accessories`):
   - Condition: Product type equals "Accessory"

### **SEO Optimization**

#### **Page SEO Settings**
For each customer journey page:

**Size Guide Example**:
```
Title: E-Bike Größenberatung | Godspeed Switzerland
Description: Finden Sie die perfekte E-Bike Größe mit unserem interaktiven Rechner. Professionelle Beratung für City, Mountain und Cargo E-Bikes.
URL: /pages/size-guide
```

**Comparison Tool Example**:
```
Title: E-Bike Vergleich | Technische Daten | Godspeed  
Description: Vergleichen Sie E-Bikes direkt nebeneinander. Motor, Akku, Reichweite und Preise übersichtlich dargestellt.
URL: /pages/compare
```

---

## 🚨 **8. TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **AI Chatbot Not Working**
**Symptoms**: Chat widget doesn't respond or shows errors

**Solutions**:
1. **Check API Keys**:
   ```bash
   # Verify in Theme Settings > AI Features
   # Ensure keys start with correct prefixes:
   # Claude: sk-ant-
   # OpenAI: sk-
   # Gemini: [varies]
   ```

2. **Test API Connectivity**:
   ```bash
   # Open browser console on your site
   # Look for network errors in developer tools
   # Common issues: CORS, invalid keys, rate limits
   ```

3. **Validate Settings**:
   ```bash
   node test-validation.js
   # Check AI integration tests specifically
   ```

#### **Mobile Layout Issues**
**Symptoms**: Chat widget or tools don't display properly on mobile

**Solutions**:
1. **Test Responsive Design**:
   ```bash
   # Use test tool
   http://localhost:8080/test-mobile-responsive.html
   ```

2. **Check CSS Media Queries**:
   - Verify `@media (max-width: 768px)` rules
   - Ensure touch targets ≥44px
   - Test on actual devices, not just browser emulation

#### **Calculator Tools Not Working**
**Symptoms**: Size guide, range calculator, or comparison tool errors

**Solutions**:
1. **Check JavaScript Console**:
   - Open browser developer tools
   - Look for JavaScript errors
   - Common issue: missing product metafields

2. **Verify Page Templates**:
   - Ensure correct template assigned to pages
   - Check handle names match exactly

3. **Test Product Data**:
   - Verify metafields are populated
   - Check product type and tag assignments

#### **Performance Issues**
**Symptoms**: Slow loading times, poor Core Web Vitals

**Solutions**:
1. **Optimize Images**:
   - Use WebP format when possible
   - Implement lazy loading
   - Compress large images

2. **Minimize JavaScript**:
   - Remove console.log statements
   - Combine multiple scripts
   - Use async loading where appropriate

3. **CDN Configuration**:
   - Enable Shopify's CDN
   - Optimize CSS delivery
   - Minimize render-blocking resources

### **Support Resources**

#### **Documentation**
- **Technical Details**: [CLAUDE.md](./CLAUDE.md)
- **Testing Guide**: [TESTING-GUIDE.md](./TESTING-GUIDE.md)
- **AI Integration**: [AI-INTEGRATION-PLAN.md](./AI-INTEGRATION-PLAN.md)

#### **Testing Tools**
- **Complete Validation**: `node test-validation.js`
- **Chat Widget**: `test-chat-widget.html`
- **Mobile Testing**: `test-mobile-responsive.html`

#### **Getting Help**
1. **Check Test Results**: Always run validation first
2. **Browser Console**: Look for JavaScript errors
3. **Shopify Logs**: Check theme errors in admin
4. **API Status**: Verify external service connectivity

---

## ✅ **9. FINAL CHECKLIST**

### **Pre-Launch Verification**

#### **Theme Configuration**
- [ ] All 313 settings configured
- [ ] AI chatbot tested with real queries
- [ ] Store locations populated with accurate data
- [ ] Navigation menus properly structured
- [ ] Legal pages updated with business information

#### **Customer Journey Tools**
- [ ] Size guide calculator working
- [ ] Product comparison functional
- [ ] Range calculator accurate
- [ ] Financing calculator configured
- [ ] Test ride booking connected to Calendly
- [ ] Service booking system operational

#### **Technical Validation**
- [ ] `node test-validation.js` shows 41/41 passed
- [ ] Mobile responsiveness verified
- [ ] Core Web Vitals meet targets
- [ ] All JavaScript functions without errors
- [ ] AI integration working across all providers

#### **Content & SEO**
- [ ] Product metafields populated
- [ ] Collections properly configured
- [ ] Page SEO titles and descriptions set
- [ ] Images optimized and alt text added
- [ ] Schema markup validated

#### **Business Integration**
- [ ] Google Maps API working
- [ ] Calendly integration functional
- [ ] Contact forms delivering emails
- [ ] Analytics tracking implemented
- [ ] Payment methods configured

### **Launch Day Tasks**
1. **Final Testing**: Complete validation suite
2. **Performance Check**: Run PageSpeed Insights
3. **Mobile Verification**: Test on actual devices
4. **AI Functionality**: Verify chatbot responses
5. **Monitor**: Watch for errors in first 24 hours

---

## 🎉 **CONGRATULATIONS!**

Your **Godspeed E-Bike Store** is now fully configured with:

- ✅ **World-class e-bike specialty features**
- ✅ **AI-powered customer support**
- ✅ **Complete customer journey tools** 
- ✅ **Swiss market specialization**
- ✅ **Mobile-optimized responsive design**
- ✅ **100% validated functionality**

**Your store is ready to dominate the Swiss e-bike market with superior customer experience and technical excellence!** 🚴‍♂️⚡