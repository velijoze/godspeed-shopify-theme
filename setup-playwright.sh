#!/bin/bash

echo "Setting up Playwright for visual testing..."

# Install system dependencies
echo "Installing system dependencies (requires sudo)..."
sudo apt-get update
sudo apt-get install -y libnspr4 libnss3 libasound2t64

# Install Playwright browsers
echo "Installing Playwright browsers..."
npx playwright install

echo "Playwright setup complete!"
echo "You can now run: npm test or node visual-test.js"