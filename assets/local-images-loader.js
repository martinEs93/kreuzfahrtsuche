// assets/local-images-loader.js
// This script looks for a generated manifest at /assets/images/images-manifest.json
// and replaces <img> elements that point to the original external URL with the local optimized JPEG (640px) file if available.

(async function(){
  if (typeof window === 'undefined') return;
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/assets/images/images-manifest.json');
      if (!res.ok) return;
      const manifest = await res.json();
      // Create a quick lookup by original URL
      for (const img of document.querySelectorAll('img')) {
        const src = img.getAttribute('src');
        if (!src) continue;
        // Only replace known external images
        if (manifest[src] && manifest[src].files && manifest[src].files.jpeg && manifest[src].files.jpeg[640]) {
          img.src = manifest[src].files.jpeg[640];
          img.loading = 'lazy';
          // Add srcset attribute pointing to the higher-res jpeg as well
          img.srcset = `${manifest[src].files.jpeg[640]} 640w, ${manifest[src].files.jpeg[1280]} 1280w`;
          img.setAttribute('data-localized', 'true');
        }
      }
    } catch (e) {
      console.warn('local-images-loader failed', e);
    }
  });
})();
