# Known Issues

## Open

| ID | Description | Status |
|---|---|---|
| KI-1 | There is no `.dockerignore` file. `COPY . .` in the `Dockerfile` copies local `node_modules/`, `dist/`, and `.astro/` into the build image. | Open |
| KI-2 | nginx uses its default configuration. There are no cache headers, no gzip settings, and no custom 404 page. | Open |
| KI-3 | `astro.config.mjs` does not set `site`. Canonical URLs, a sitemap, and RSS need this value. | Open |
| KI-4 | The page has no meta description and no Open Graph tags. | Open |
| KI-5 | `public/favicon.svg` and `public/favicon.ico` show the default Astro logo. | Open |
| KI-6 | There is no CI pipeline and no record of how the site is deployed. | Open |

## Closed

None.
