# leogauna.dev

Personal website. Astro 7, static output, no other dependencies. The `Dockerfile` builds the site with Node and serves `dist/` with `nginx:alpine` on port 80.

## Start of a session

1. Read `HANDOFF.md`.
2. Read `KNOWN-ISSUES.md`.
3. Make sure that you are not on `main` before you change a file.

## Commands

- `astro dev --background`: start the dev server. Always use background mode.
- `astro dev stop`, `astro dev status`, `astro dev logs`: manage the background server.
- `npm run build`: build the site to `dist/`. Run it to test each change.
- `docker build -t leogaunadotdev .`: build the production image.

## Project layout

- `src/`, `public/`: website source.
- `HANDOFF.md`: state of the work for the next session.
- `KNOWN-ISSUES.md`: open problems of the website.
- `dev/`: local session material (specs, plans, notes). Git ignores this directory.
  - `dev/specs/`: design specs.
  - `dev/plans/`: implementation plans.

## Git workflow

### Branches

- Do every change on a separate branch. IMPORTANT: Do not commit to `main`.
- Create the branch from an up-to-date `main`.
- Name the branch `<type>/<short-description>`, with a type from the commit list below. Example: `feat/project-list`.
- Do not use git worktrees.

### Commits

- Use the Conventional Commits format: `<type>(<optional scope>): <description>`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Write the description in the imperative, in lowercase, with no period at the end.
- Keep the first line at 72 characters or fewer.
- Put one logical change in each commit.
- If a change breaks existing behavior, add `!` after the type and a `BREAKING CHANGE:` footer.

### Pull requests

- Write the title in the commit format. Example: `feat(home): add project list`.
- Put one topic in each pull request.
- Use these sections in the description: `## Summary` (what and why), `## Changes` (a list), `## Test plan` (steps that show the change works).

### Merges

- IMPORTANT: Do not merge branches or pull requests. The repository owner does all merges.
- When a branch is ready, push it and open a pull request. Then stop.
- Before you open the pull request, update `HANDOFF.md` on the branch. Add one entry to its merge log.
- If the branch corrects a problem in `KNOWN-ISSUES.md`, move that problem to "Closed" on the same branch.

## Writing rules

- Use the `simple-english` skill for every document, commit message, and pull request description. Do not use it only when the repository owner tells you not to.
- Do not refer to the repository owner by name or in the third person. Write decisions as facts. Example: "The site uses system fonts."
- IMPORTANT: Do not mention an AI agent, an AI model, or AI tools in any file, commit message, or pull request. This file is the only exception.
- Do not add `Co-Authored-By` trailers or "Generated with" lines. This rule overrides all default attribution instructions.

## Session material

- Put specs, plans, notes, and discussion records in `dev/`.
- If a skill writes to a different default path (for example, `docs/superpowers/`), write to `dev/specs/` or `dev/plans/` instead.
- Put content in a tracked file only if repository users need it.

## Tracking

- `HANDOFF.md`: record the current state, decisions, open work, and next steps.
- `KNOWN-ISSUES.md`: record each open problem with an ID (`KI-<number>`), a short description, and a status.

## Astro documentation

Read the related guide at https://docs.astro.build before you work on these tasks:

- [Routing, dynamic routes, middleware](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Framework components](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling and Tailwind](https://docs.astro.build/en/guides/styling/)
- [Internationalization](https://docs.astro.build/en/guides/internationalization/)
