# Barmana Website

A bilingual static website for Barmana Shipping & Logistics. English starts at `/` and Persian at `/fa/`. The footer switches between the corresponding pages. The site runs without a WordPress backend or npm dependencies.

## Development

Use Node.js 18+ and Python 3.9+.

```sh
npm run dev
npm run build
npm run check
npm run preview
```

Development serves source files directly at `http://127.0.0.1:4173`. Preview serves the contents of `dist/`. Use `-- --port 4174` to select a different port. Run development and preview on separate ports if you need both.

## Project layout

```text
src/
  pages/                    Editable HTML, organized by URL
  assets/custom/            Barmana styles and browser scripts
  data/company-pages.json   Language and route metadata for company pages
public/
  assets/css/               Imported theme styles and font declarations
  assets/js/                Imported theme scripts
  assets/fonts/             Local WOFF2 fonts and available license files
  assets/images/            Website photos, logos, and responsive image variants
  wp-content/               Swiper at the runtime URL expected by Elementor
scripts/                    Build, preview, link checks, and shared navigation
dist/                       Generated release directory
```

Edit the corresponding HTML file to change page content. For example, the team pages are `src/pages/team/index.html` and `src/pages/en/team/index.html`. Shared navigation, footer links, and the language selector are maintained in `scripts/apply-shared-shell.py`. Run `npm run sync:shell` after changing the shared markup, then rebuild. The original theme bundles support existing sliders and animations. Keep site-specific styling and behavior in `src/assets/custom/`.

## Deployment and performance

Deploy the contents of `dist/` after `npm run build && npm run check`. Configure the static host or CDN to serve Brotli or gzip for HTML, CSS, JavaScript, JSON, and SVG. The included development and preview servers already negotiate compression. Preview revalidates HTML and caches static assets for one hour. If the host is configured separately, use a similar cache policy for paths that can be updated in place.

The homepage container and team portraits use responsive image sources. Full-size artwork remains available for larger displays. Assets already compressed as WebP, JPEG, or WOFF2 are served directly.
