#!/usr/bin/env python3
"""
Create missing collections in Shopify that are causing 404 errors
"""

import requests
import json
import time

# Shopify API credentials (replace with your actual values)
SHOPIFY_STORE = "your-store.myshopify.com"
ACCESS_TOKEN = "your-access-token-here"

headers = {
    "X-Shopify-Access-Token": ACCESS_TOKEN,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Missing collections from test failures
missing_collections = [
    {"handle": "lights", "title": "Lights", "body_html": "<p>Bicycle lights and visibility accessories for safe riding.</p>"},
    {"handle": "fenders", "title": "Fenders", "body_html": "<p>Mudguards and fenders to keep you clean and dry.</p>"},
    {"handle": "racks", "title": "Racks", "body_html": "<p>Bike racks and cargo solutions for transporting gear.</p>"},
    {"handle": "cargo-e-bikes", "title": "Cargo E-Bikes", "body_html": "<p>Electric cargo bikes for family transport and heavy loads.</p>"},
    {"handle": "helmets", "title": "Helmets", "body_html": "<p>Safety helmets for cyclists of all ages.</p>"},
    {"handle": "locks", "title": "Locks", "body_html": "<p>Secure your bike with our range of locks and security accessories.</p>"},
    {"handle": "bags", "title": "Bags", "body_html": "<p>Panniers, backpacks, and bike bags for all your storage needs.</p>"},
    {"handle": "clothing", "title": "Clothing", "body_html": "<p>Cycling apparel and clothing for comfort and performance.</p>"},
    {"handle": "parts", "title": "Parts", "body_html": "<p>Bicycle parts and components for maintenance and upgrades.</p>"},
    {"handle": "tools", "title": "Tools", "body_html": "<p>Bike tools and maintenance equipment.</p>"},
]

def create_collection(collection_data):
    """Create a single collection"""
    url = f"https://{SHOPIFY_STORE}/admin/api/2024-01/collections.json"
    
    payload = {
        "collection": {
            "title": collection_data["title"],
            "handle": collection_data["handle"],
            "body_html": collection_data["body_html"],
            "published": True,
            "sort_order": "best-selling"
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201:
        collection = response.json()["collection"]
        print(f"✅ Created collection: {collection['title']} (/collections/{collection['handle']})")
        return True
    elif response.status_code == 422:
        error = response.json()
        if "Handle has already been taken" in str(error):
            print(f"⚠️  Collection already exists: {collection_data['title']}")
            return False
        else:
            print(f"❌ Error creating {collection_data['title']}: {error}")
            return False
    else:
        print(f"❌ HTTP {response.status_code} creating {collection_data['title']}: {response.text}")
        return False

def main():
    """Create all missing collections"""
    print("🛒 Creating missing collections...")
    print()
    
    created_count = 0
    existing_count = 0
    failed_count = 0
    
    for collection_data in missing_collections:
        result = create_collection(collection_data)
        if result is True:
            created_count += 1
        elif result is False:
            existing_count += 1
        else:
            failed_count += 1
        
        # Rate limiting - wait 3 seconds between requests
        time.sleep(3)
    
    print()
    print(f"📊 Summary:")
    print(f"   ✅ Created: {created_count}")
    print(f"   ⚠️  Already existed: {existing_count}")
    print(f"   ❌ Failed: {failed_count}")
    print(f"   📦 Total: {len(missing_collections)}")

if __name__ == '__main__':
    main()