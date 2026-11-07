# Handoff

## Current state

- The site is one static page. It shows "leogauna.dev" in the center of a dark background.
- The stack is Astro 7 with no other dependencies. The build output is static.
- The `Dockerfile` builds the site with Node and serves `dist/` with `nginx:alpine` on port 80.
- The open problems are in `KNOWN-ISSUES.md`.

## Decisions

- Specs, plans, and notes are in `dev/`. Git ignores `dev/`, because repository users do not need this material.
- `HANDOFF.md` and `KNOWN-ISSUES.md` are in the root and tracked by git.
- The page uses system fonts. It loads no external fonts or assets.
- Background color: `#111`. Text color: `#e5e5e5`.

## Open work

None.

## Next steps

- Correct the problems in `KNOWN-ISSUES.md`.
- Add content to the site: a bio, projects, and social links.
- Rename `src/components/Welcome.astro` to a more descriptive name, for example `Landing.astro`.

## Merge log

| Date | Branch | Summary |
|---|---|---|
| 2026-11-07 | `chore/dev-workspace-and-rules` | Added project rules in `CLAUDE.md`, `HANDOFF.md`, and `KNOWN-ISSUES.md`. Ignored `dev/`. Rewrote the README. Removed unused starter files. |
