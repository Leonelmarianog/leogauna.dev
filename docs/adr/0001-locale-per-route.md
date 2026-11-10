# Each Locale has its own route, and only an explicit choice is remembered

The Claude Design mockup ("Personal website mockup review") serves both Locales from one URL, swaps the copy with JavaScript, and picks the Locale from the browser's language. We serve each Locale as its own static page instead (`/` for English, `/es/` for Spanish) with Astro's i18n routing. Each page has the correct `lang`, `<title>` and meta tags, is indexable, and works without JavaScript. Both pages list themselves and each other with `hreflang` links, and `x-default` points to `/`. The language toggle is a link to the same page in the other Locale.

We never guess the visitor's language. Google sends searchers to the page in their language through `hreflang`, and it advises against redirecting "based on what you think the user's language may be", because such redirects can stop users and crawlers from reaching every version. A first-time visitor who opens `/` always gets English.

We do remember an explicit choice. When a visitor selects a Locale with the toggle, we save it as their Locale preference. On `/` only, an inline script sends a visitor whose Locale preference is Spanish to `/es/` before the page paints. `/es/` never redirects. This is not the redirect Google warns about: it follows a choice the visitor made, not a guess. Google's renderer also clears local storage, session storage and cookies on every page load, so a crawler never has a Locale preference and always reaches both pages.

## Considered Options

- **One URL with a client-side copy swap (the mockup's approach):** rejected. Only one Locale is indexable, and the page is wrong without JavaScript.
- **Client-side redirect from `/` to `/es/` when the browser prefers Spanish:** rejected. It is a redirect based on a guess, which Google advises against.
- **A dismissible "¿Ver en español?" prompt on `/`:** rejected. It adds UI that is not in the mockup.
- **Server-side detection with `@astrojs/node` and `Astro.preferredLocale`:** rejected. It replaces static nginx hosting with a Node server for a one-page site, and it is still a guess.
- **No remembered choice:** rejected. A visitor who chose Spanish would get English again each time they open the bare domain.

## Consequences

- A visitor who chose Spanish and then follows a link to `/` lands on `/es/`. They select EN to switch back.
- On a site with more pages, only `/` reads the Locale preference. Every other page keeps its Locale through its URL.
