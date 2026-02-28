import { writeFileSync } from "fs";

function generateSVG(size) {
  const s = size;
  const cx = s / 2,
    cy = s / 2,
    r = s * 0.38;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${s * 0.2}" fill="#0a0f1e"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#3b82f6" stroke-width="${s * 0.04}" opacity="0.3"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#3b82f6" stroke-width="${s * 0.04}"
    stroke-dasharray="${2 * Math.PI * r}" stroke-dashoffset="${2 * Math.PI * r * 0.3}"
    stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
  <text x="${cx}" y="${cy + s * 0.04}" text-anchor="middle" fill="white" font-family="system-ui,sans-serif"
    font-size="${s * 0.16}" font-weight="700">23</text>
</svg>`;
}

writeFileSync("public/icons/icon-192.svg", generateSVG(192));
writeFileSync("public/icons/icon-512.svg", generateSVG(512));
console.log("SVG icons generated");
