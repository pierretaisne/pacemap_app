const sharp = require('sharp');

// Create a 1024x1024 icon (this size is required by Apple)
const width = 1024;
const height = 1024;

// Create a gradient background with text
const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial" font-size="200" 
        font-weight="bold" fill="white" text-anchor="middle" 
        dominant-baseline="middle">BOLT</text>
</svg>
`;

// All required iOS icon sizes
const sizes = [
  1024, // App Store
  180,  // iPhone 6 Plus
  120,  // iPhone 6, SE
  87,   // iPhone Settings @3x
  80,   // Spotlight @2x
  60,   // iPhone @3x
  58,   // iPhone Settings @2x
  40,   // Spotlight @2x
];

async function generateIcons() {
  // Generate the main icon
  await sharp(Buffer.from(svg))
    .png()
    .toFile('assets/images/icon.png');

  // Generate all required sizes
  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(`ios/boltexponativewind/Images.xcassets/AppIcon.appiconset/icon-${size}.png`);
  }
}

generateIcons().catch(console.error); 