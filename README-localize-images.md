Localize & optimize external images

This branch adds tooling to download externally hosted images referenced in index.html, optimize them and store them under assets/images/.

How it works
1. scripts/download_optimize_images.js scans index.html for image URLs (pattern: image: "https://..."), downloads each image, and creates two sizes (640px and 1280px) in WebP and JPEG formats using sharp.
2. Generated files are written to assets/images/ and a manifest is saved as assets/images/images-manifest.json.
3. A small client-side loader (assets/local-images-loader.js) will try to replace image src attributes at runtime with the local optimized copies if the manifest is present on the server.

Run locally
- Install dependencies: npm install
- Run the downloader: npm run download-images
- Commit the generated files under assets/images/ and push the branch.

Notes
- The script uses a simple regex to find image URLs in index.html. If you keep image references elsewhere, extend the script.
- After running and committing, open the site and verify images. If any downloads failed, check assets/images/images-manifest.json for errors.
