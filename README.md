# leogauna.dev

Source code for the personal website at [leogauna.dev](https://leogauna.dev). The site is built with [Astro](https://astro.build) as a static site.

## Requirements

- Node.js 22.12 or later
- Docker (optional, to build the production image)

## Commands

Run all commands from the root of the project.

| Command | Action |
| :-- | :-- |
| `npm install` | Installs the dependencies. |
| `npm run dev` | Starts the local dev server at `localhost:4321`. |
| `npm run build` | Builds the production site to `./dist/`. |
| `npm run preview` | Serves the build locally. |
| `npm run check` | Type-checks the project with `astro check`. |
| `npm test` | Builds the site and runs the Playwright end-to-end tests against `astro preview`. |

Install the Playwright browser once before you run the tests: `npx playwright install chromium`.

## Docker

Build the image:

```sh
docker build -t leogaunadotdev .
```

Start a container on port 4321:

```sh
docker run --rm -p 4321:80 leogaunadotdev
```

The image serves the static build with nginx on port 80.

## Project structure

```text
/
├── docs/              ADRs and configuration for the engineering skills
├── public/            Static files (favicons)
├── src/
│   ├── components/    Home.astro, the shared home page for every Locale, and LanguageLink.astro
│   ├── data/          site.ts, the link targets (CV, LinkedIn, GitHub, email)
│   ├── i18n/          The typed copy dictionary and useTranslations()
│   ├── layouts/       Layout.astro, the HTML document and head tags
│   ├── pages/         index.astro (English, /) and es/index.astro (Spanish, /es/)
│   └── styles/        global.css, the Theme colors as custom properties
├── tests/             Playwright end-to-end tests
├── CLAUDE.md
├── Dockerfile
└── playwright.config.ts
```
