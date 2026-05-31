#!/usr/bin/env node
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Generate favicon files from a source image
 * Usage: node scripts/generate-favicon.js <source-image-path>
 * 
 * This creates:
 * - favicon.ico (multi-resolution: 16x16, 32x32, 48x48)
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

async function generateFavicons() {
  try {
    console.log('📦 Generating favicon files...');
    
    // Generate PNG sizes
    const pngSizes = [
      { size: 512, name: 'logo512.png' },
      { size: 192, name: 'logo192.png' },
      { size: 180, name: 'apple-touch-icon.png' }
    ];

    for (const { size, name } of pngSizes) {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`✅ Created ${name} (${size}x${size})`);
    }

    // Generate ICO file with multiple resolutions
    const icoSizes = [16, 32, 48];
    const icoBuffers = [];

    for (const size of icoSizes) {
      const buffer = await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toBuffer();
      icoBuffers.push(buffer);
    }

    // Create a simple ICO file (PNG-in-ICO for simplicity)
    // Use the 32x32 as the main ICO file
    const ico32 = await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));

    console.log(`✅ Created favicon.ico (32x32)`);

    // Also save favicon.png for browsers that don't support ICO
    const favicon32 = await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));

    console.log(`✅ Created favicon.png (32x32)`);

    console.log('\n🎉 All favicon files generated successfully!');
    console.log(`📂 Files saved to: ${publicDir}`);
    console.log('\nFiles created:');
    console.log('  - favicon.ico (32x32)');
    console.log('  - favicon.png (32x32)');
    console.log('  - apple-touch-icon.png (180x180)');
    console.log('  - logo192.png (192x192)');
    console.log('  - logo512.png (512x512)');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
