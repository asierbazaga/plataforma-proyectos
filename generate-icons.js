import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const standardSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf-8');

// Render standard sizes
const targets = [
  { file: 'icon-512x512.png', width: 512, height: 512 },
  { file: 'icon-192x192.png', width: 192, height: 192 },
  { file: 'apple-touch-icon.png', width: 180, height: 180 },
  { file: 'favicon-32x32.png', width: 32, height: 32 },
  { file: 'favicon-16x16.png', width: 16, height: 16 }
];

for (const target of targets) {
  const resvg = new Resvg(standardSvg, {
    fitTo: {
      mode: 'width',
      value: target.width
    }
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(path.join(publicDir, target.file), pngBuffer);
  console.log(`Generated ${target.file} (${target.width}x${target.height})`);
}

// Maskable icon with safe zone full bleed
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bg-glow-m" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#1E1B4B" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#0F172A" stop-opacity="1"/>
      <stop offset="100%" stop-color="#07090E" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="brand-grad-1-m" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="50%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#EC4899"/>
    </linearGradient>
    <linearGradient id="brand-grad-2-m" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#A855F7"/>
    </linearGradient>
    <linearGradient id="brand-grad-accent-m" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#F43F5E"/>
      <stop offset="50%" stop-color="#EC4899"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <linearGradient id="border-stroke-m" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>
      <stop offset="30%" stop-color="#818CF8" stop-opacity="0.6"/>
      <stop offset="70%" stop-color="#C084FC" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.05"/>
    </linearGradient>
    <filter id="core-glow-m" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Full bleed background for adaptive icon masking -->
  <rect width="512" height="512" fill="url(#bg-glow-m)"/>

  <!-- Centered safe-zone scaled graphic (scale 0.75) -->
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Hexagonal Shield Matrix -->
    <path d="M 256 90 L 385 155 L 385 305 L 256 395 L 127 305 L 127 155 Z" 
          fill="#111827" 
          fill-opacity="0.9" 
          stroke="url(#brand-grad-1-m)" 
          stroke-width="8" 
          stroke-linejoin="round"/>

    <!-- Inner Geometric Facets -->
    <path d="M 256 112 L 360 166 L 256 222 L 152 166 Z" fill="url(#brand-grad-2-m)" opacity="0.95"/>
    <path d="M 144 182 L 244 236 L 244 350 L 144 286 Z" fill="url(#brand-grad-1-m)" opacity="0.9"/>
    <path d="M 368 182 L 368 286 L 268 350 L 268 236 Z" fill="url(#brand-grad-accent-m)" opacity="0.92"/>

    <!-- Central Nexus Core -->
    <g filter="url(#core-glow-m)">
      <polygon points="256,195 295,245 256,295 217,245" fill="#FFFFFF" opacity="0.95"/>
      <polygon points="256,215 280,245 256,275 232,245" fill="url(#brand-grad-1-m)"/>
      <circle cx="256" cy="245" r="6" fill="#FFFFFF"/>
    </g>

    <!-- Node lights -->
    <circle cx="256" cy="112" r="6" fill="#38BDF8"/>
    <circle cx="360" cy="166" r="6" fill="#C084FC"/>
    <circle cx="368" cy="286" r="6" fill="#F43F5E"/>
    <circle cx="256" cy="372" r="6" fill="#A855F7"/>
    <circle cx="144" cy="286" r="6" fill="#6366F1"/>
    <circle cx="152" cy="166" r="6" fill="#38BDF8"/>

    <!-- Bottom Badge -->
    <rect x="186" y="415" width="140" height="24" rx="12" fill="#1E293B" stroke="url(#border-stroke-m)" stroke-width="1.5"/>
    <text x="256" y="431" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#F1F5F9" letter-spacing="2.5" text-anchor="middle">PROYECTOS</text>
  </g>
</svg>`;

const maskableResvg = new Resvg(maskableSvg, {
  fitTo: { mode: 'width', value: 512 }
});
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512x512.png'), maskableResvg.render().asPng());
console.log('Generated icon-maskable-512x512.png (512x512)');

// Copy standard favicon.svg to icon.svg as well
fs.copyFileSync(path.join(publicDir, 'favicon.svg'), path.join(publicDir, 'icon.svg'));
console.log('All icons generated successfully!');
