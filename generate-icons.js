const fs = require('fs');

// Create a simple HTML canvas-based icon generator
const iconSvg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" fill="url(#grad1)" rx="20"/>
  <circle cx="96" cy="96" r="70" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
  <text x="96" y="115" text-anchor="middle" font-size="60" fill="white" font-family="sans-serif">🏁</text>
</svg>`;

const iconSvg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad1)" rx="50"/>
  <circle cx="256" cy="256" r="180" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="8"/>
  <text x="256" y="310" text-anchor="middle" font-size="160" fill="white" font-family="sans-serif">🏁</text>
</svg>`;

// Write SVG files that can be converted to PNG
fs.writeFileSync('public/icon-192.svg', iconSvg192);
fs.writeFileSync('public/icon-512.svg', iconSvg512);

console.log('Icon SVG files created! Convert them to PNG using an online converter or image editor:');
console.log('1. Go to https://convertio.co/svg-png/ or similar');
console.log('2. Upload public/icon-192.svg and convert to PNG');
console.log('3. Upload public/icon-512.svg and convert to PNG');
console.log('4. Save as public/icon-192.png and public/icon-512.png');
console.log('5. Delete the .svg files when done'); 