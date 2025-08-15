# Godspeed Category & Collection Structure

## Main Navigation Structure (Based on godspeed.ch)

### 1. E-BIKES (Primary Category)
```
E-Bikes/
├── Trekking E-Bikes (Tour & Distance)
├── City E-Bikes (Urban Commuting)  
├── E-Mountainbikes (Off-road Adventure)
├── Cargo E-Bikes (Family & Transport)
├── Gravel E-Bikes (Mixed Terrain)
└── Compact E-Bikes (Folding & Space-saving)
```

### 2. FAHRRÄDER / BICYCLES
```
Bicycles/
├── Rennräder (Road Bikes)
├── Mountainbikes (Mountain Bikes)
├── Gravelbikes (Gravel Bikes)
├── Citybikes (City Bikes)
├── Trekkingräder (Trekking Bikes)
└── Hybridräder (Hybrid Bikes)
```

### 3. KINDERRÄDER / KIDS' BIKES
```
Kids' Bikes/
├── 12" - Ages 2-4
├── 14" - Ages 3-5  
├── 16" - Ages 4-6
├── 20" - Ages 5-8
├── 24" - Ages 7-11
└── 26" - Ages 9-13
```

### 4. ZUBEHÖR / ACCESSORIES
```
Accessories/
├── Helme (Helmets)
├── Schlösser (Locks)
├── Beleuchtung (Lights)
├── Taschen (Bags & Panniers)
├── Bekleidung (Clothing)
├── Werkzeug (Tools)
├── Fahrradträger (Bike Racks)
└── Sicherheit (Safety Equipment)
```

### 5. ERSATZTEILE / PARTS
```
Parts/
├── Bremsen (Brakes)
├── Schaltung (Drivetrain)
├── Reifen & Schläuche (Tires & Tubes)
├── Ketten (Chains)
├── Pedale (Pedals)
├── Sattel (Saddles)
├── Lenker (Handlebars)
└── E-Bike Komponenten (E-bike Components)
```

---

## Shopify Collections Setup

### Smart Collections (Auto-updating)

#### By Product Type
```
Collection: E-Bikes
Conditions: Product type equals "E-Bike"

Collection: Road Bikes  
Conditions: Product type equals "Road Bike"

Collection: Mountain Bikes
Conditions: Product type equals "Mountain Bike"
```

#### By Brand
```
Collection: CUBE
Conditions: Vendor equals "CUBE"

Collection: Mondraker
Conditions: Vendor equals "Mondraker"

Collection: RAYMON  
Conditions: Vendor equals "RAYMON"
```

#### By Price Range
```
Collection: Premium (CHF 3000+)
Conditions: Price greater than 3000

Collection: Mid-Range (CHF 1000-3000)
Conditions: Price between 1000 and 3000

Collection: Entry Level (Under CHF 1000)
Conditions: Price less than 1000
```

#### By Features
```
Collection: Electric Bikes
Conditions: Product tag contains "Electric"

Collection: Carbon Frame
Conditions: Product tag contains "Carbon"

Collection: Suspension
Conditions: Product tag contains "Full-Suspension" OR "Front-Suspension"
```

### Manual Collections (Curated)

#### Featured Collections
```
Collection: New Arrivals (Manual)
- Latest 20 products added

Collection: Best Sellers (Manual)  
- Top selling products by volume

Collection: Staff Picks (Manual)
- Curated selection by store team

Collection: Sale Items (Manual)
- Products on promotion/discount
```

---

## Product Tags System

### Brand Tags
```
CUBE, Mondraker, RAYMON, Ortlieb, Shimano, Bosch, etc.
```

### Category Tags  
```
E-Bike, Road-Bike, Mountain-Bike, City-Bike, Trekking-Bike, 
Gravel-Bike, Kids-Bike, Accessories, Parts
```

### Feature Tags
```
Electric, Carbon, Aluminum, Steel, Full-Suspension, Hardtail,
Disc-Brakes, Hydraulic, Mechanical, Tubeless-Ready
```

### Use Case Tags
```
Commuting, Racing, Touring, Off-Road, Urban, Family, 
Professional, Recreational, Competition
```

### Technical Tags
```
Shimano-105, SRAM-Eagle, Bosch-CX, Yamaha-Motor, 
29er, 27.5", Drop-Bar, Flat-Bar
```

### Size Tags
```
XS, S, M, L, XL, XXL, 
12-inch, 14-inch, 16-inch, 20-inch, 24-inch, 26-inch
```

---

## Filters & Search Configuration

### Price Filters
```
Under CHF 500
CHF 500 - CHF 1,000  
CHF 1,000 - CHF 2,000
CHF 2,000 - CHF 3,000
CHF 3,000 - CHF 5,000
Over CHF 5,000
```

### Brand Filters
```
☐ CUBE
☐ Mondraker  
☐ RAYMON
☐ [Other brands as added]
```

### Type Filters
```
☐ E-Bikes
☐ Road Bikes
☐ Mountain Bikes  
☐ City Bikes
☐ Kids' Bikes
☐ Accessories
```

### Feature Filters
```
☐ Electric Motor
☐ Carbon Frame
☐ Full Suspension
☐ Disc Brakes
☐ Tubeless Ready
```

---

## Menu Structure for Shopify

### Main Menu (Header)
```
E-Bikes
├── Trekking E-Bikes → /collections/e-bike-trekking
├── City E-Bikes → /collections/e-bike-city
├── E-Mountainbikes → /collections/e-bike-mountain
└── Alle E-Bikes → /collections/e-bikes

Fahrräder  
├── Rennräder → /collections/road-bikes
├── Mountainbikes → /collections/mountain-bikes
├── Citybikes → /collections/city-bikes
└── Alle Fahrräder → /collections/bicycles

Kinderräder → /collections/kids-bikes

Zubehör → /collections/accessories

Marken
├── CUBE → /collections/cube
├── Mondraker → /collections/mondraker  
└── RAYMON → /collections/raymon
```

### Footer Menu
```
Service
├── Beratung → /pages/consultation
├── Reparatur → /pages/repair-service
├── Finanzierung → /pages/financing
└── Garantie → /pages/warranty

Info  
├── Über uns → /pages/about
├── Standorte → /pages/locations
├── Kontakt → /pages/contact
└── Nachhaltigkeit → /pages/sustainability

Rechtliches
├── AGB → /pages/terms-of-service
├── Datenschutz → /pages/privacy-policy  
├── Impressum → /pages/legal-notice
└── Widerrufsrecht → /pages/return-policy
```

---

## Collection Page Templates

### E-Bikes Collection Description
```
**German:**
Entdecken Sie unsere Premium E-Bike Kollektion. Von entspannten City-Fahrten 
bis zu anspruchsvollen Mountain-Trails - finden Sie das perfekte E-Bike 
für Ihre nachhaltige Mobilität.

**Features:**
✓ Reichweiten bis 150km
✓ Leistungsstarke Motoren von Bosch & Yamaha  
✓ 0% Finanzierung verfügbar
✓ Schweizer Qualitätsgarantie
```

### Road Bikes Collection Description
```
**German:**
Erleben Sie pure Performance mit unseren Rennrädern. Präzise Geometrie, 
leichte Materialien und hochwertige Komponenten für ambitionierte Radsportler.

**Highlights:**
✓ Carbon & Aluminium Rahmen
✓ Shimano & SRAM Schaltgruppen
✓ Aerodynamische Designs
✓ Professionelle Einstellung inklusive
```

---

## SEO Collection Optimization

### URL Structure
```
/collections/e-bikes
/collections/e-bike-trekking
/collections/e-bike-city
/collections/road-bikes
/collections/mountain-bikes
/collections/cube-bikes
/collections/accessories-helmets
```

### Collection Meta Titles
```
E-Bikes: Premium E-Bikes kaufen | Unschlagbare Preise | Godspeed
Road Bikes: Rennräder online kaufen | CUBE, Mondraker | Godspeed  
CUBE: CUBE Fahrräder & E-Bikes | Autorisierter Händler | Godspeed
```

This structure matches the godspeed.ch organization while optimizing for Shopify's collection system and SEO best practices.