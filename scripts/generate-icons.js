#!/usr/bin/env node

/**
 * Script to generate PNG icons from SVG files
 * 
 * This script requires sharp to be installed:
 * npm install --save-dev sharp
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.error('Error: sharp is not installed. Please run: npm install --save-dev sharp');
    process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const faviconSvg = path.join(publicDir, 'favicon.svg');

// Icon sizes to generate
const iconSizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateIcons() {
    if (!fs.existsSync(faviconSvg)) {
        console.error('Error: favicon.svg not found in public directory');
        process.exit(1);
    }

    console.log('Generating PNG icons from favicon.svg...');

    for (const icon of iconSizes) {
        try {
            const outputPath = path.join(publicDir, icon.name);
            await sharp(faviconSvg)
                .resize(icon.size, icon.size)
                .png()
                .toFile(outputPath);
            
            console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
        } catch (error) {
            console.error(`✗ Failed to generate ${icon.name}:`, error.message);
        }
    }

    console.log('\nIcon generation complete!');
    console.log('\nNote: You may also want to generate PNG versions of og-image.svg and twitter-image.svg');
    console.log('for better compatibility with social media platforms.');
}

generateIcons().catch(console.error);