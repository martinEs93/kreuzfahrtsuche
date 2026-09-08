#!/usr/bin/env node
// scripts/download_optimize_images.js
// Usage: npm run download-images

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

const INDEX_HTML = path.join(__dirname, '..', 'index.html');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const widths = [640, 1280];

function sanitizeName(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 160);
}

async function download(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  return Buffer.from(res.data);
}

function basenameFromUrl(url) {
  try {
    const u = new URL(url);
    const part = u.pathname.split('/').pop();
    return part ? part.replace(/\.[^.]+$/, '') : 'image';
  } catch (e) {
    return url.replace(/[^a-z0-9]/gi, '-').slice(0, 80);
  }
}

async function processImage(buf, baseName) {
  const out = { jpeg: {}, webp: {} };
  for (const w of widths) {
    const jname = `${baseName}-${w}.jpg`;
    const wname = `${baseName}-${w}.webp`;
    await sharp(buf).resize({ width: w }).jpeg({ quality: 80 }).toFile(path.join(OUT_DIR, jname));
    await sharp(buf).resize({ width: w }).webp({ quality: 75 }).toFile(path.join(OUT_DIR, wname));
    out.jpeg[w] = `/assets/images/${jname}`;
    out.webp[w] = `/assets/images/${wname}`;
  }
  return out;
}

(async function main(){
  console.log('Reading index.html to find image URLs...');
  const html = fs.readFileSync(INDEX_HTML, 'utf8');
  // naive regex to extract image: "..."
  const re = /image:\s*"(https?:\\/\\/[^"']+)"/g;
  const urls = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    urls.add(m[1]);
  }

  console.log(`Found ${urls.size} image URLs`);
  const manifest = {};
  for (const url of urls) {
    try {
      console.log('Downloading', url);
      const buf = await download(url);
      const rawBase = basenameFromUrl(url);
      const baseName = sanitizeName(rawBase);
      console.log('Processing', url, '->', baseName);
      const files = await processImage(buf, baseName);
      manifest[url] = { basename: baseName, files };
    } catch (err) {
      console.error('Failed', url, err.message);
      manifest[url] = { error: err.message };
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'images-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Wrote manifest to assets/images/images-manifest.json');
  console.log('Done. Commit the generated files in assets/images/ to the repo.');
})();
