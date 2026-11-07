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
├── public/        Static files (favicons)
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
├── Dockerfile
├── HANDOFF.md
└── KNOWN-ISSUES.md
```

## Known issues

See [KNOWN-ISSUES.md](KNOWN-ISSUES.md).
