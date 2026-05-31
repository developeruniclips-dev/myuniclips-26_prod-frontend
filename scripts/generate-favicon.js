#!/usr/bin/env node
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Generate favicon files from a source image
 * Usage: node scripts/generate-favicon.js <source-image-path>
 * 
 * This creates:
 * - favicon.ico (32x32)
 * - logo192.png (192x192)
 * - logo512.png (512x512)
 * - apple-touch-icon.png (180x180)
 */

const sourceImage = process.argv[2];
if (!sourceImage) {
  console.error('Usage: node scripts/generate-favicon.js <source-image-path>');
  console.error('Example: node scripts/generate-favicon.js ./logo-source.png');
  process.exit(1);
}

if (!fs.existsSync(sourceImage)) {
  console.error(`Source image not found: ${sourceImage}`);
  process.exit(1);
}

const publicDir = path.join(__dirname, '../public');
const sizes = [
  { size: 512, name: 'logo512.png' },
  { size: 192, name: 'logo192.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon.png' }
];

async function generateFavicons() {
  try {
    console.log('📦 Generating favicon files...');
    
    for (const { size, name } of sizes) {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`✅ Created ${name} (${size}x${size})`);
    }

    // Generate ICO from the 32x32 PNG
    const favPng = await sharp(path.join(publicDir, 'favicon.png'))
      .png()
      .toBuffer();
    
    // Save as favicon.ico (using the PNG for now, can be converted with online tools if needed)
    fs.copyFileSync(path.join(publicDir, 'favicon.png'), path.join(publicDir, 'favicon.ico'));
    console.log('✅ Created favicon.ico');

    console.log('\n🎉 All favicon files generated successfully!');
    console.log(`📂 Files saved to: ${publicDir}`);
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
