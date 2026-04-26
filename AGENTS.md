# Rootin-app Agent Guide

## Project Snapshot

- Stack: React 19 + Vite, plain JSX, ESLint, no test runner configured.
- The current prototype is centered in [src/App.jsx](src/App.jsx); most screens, navigation state, and several UI helpers live there.
- Shared design tokens live in [src/styles/tokens.js](src/styles/tokens.js). Reusable primitives currently in use are [src/components/ui/Button.jsx](src/components/ui/Button.jsx) and [src/components/ui/TextInput.jsx](src/components/ui/TextInput.jsx).
- [docs/](docs/) is generated build output for GitHub Pages, not source documentation.

## Commands

- `npm run dev` starts the Vite dev server.
- `npm run build` creates the production build.
- `npm run lint` runs ESLint across the repo.
- `npm run preview` serves the production build locally.
- `npm run deploy` publishes the build to GitHub Pages.

## Working Rules

- Validate UI changes with `npm run build` and `npm run lint` before handoff. There is no project test suite yet.
- Prefer minimal edits for small fixes, but avoid making [src/App.jsx](src/App.jsx) more monolithic for larger work. If you are adding a new screen or a substantial UI block, extract it into a component instead of adding another large inline helper.
- Match the existing implementation style: function components, inline style objects for most screen-level UI, and design values sourced from [src/styles/tokens.js](src/styles/tokens.js) where possible.
- Before editing files under [src/components/layout](src/components/layout) or the unused UI stubs, confirm the behavior is not currently implemented inline in [src/App.jsx](src/App.jsx).
- Keep the GitHub Pages base path in mind: production builds use `/Rootin-app/` from [vite.config.js](vite.config.js). Do not introduce absolute asset paths that assume `/` in production.

## Key References

- [package.json](package.json) for scripts and dependencies.
- [src/App.jsx](src/App.jsx) for screen flow and current application state.
- [src/styles/tokens.js](src/styles/tokens.js) for colors, font, radius, and shadow values.
- [vite.config.js](vite.config.js) for deployment-specific base path behavior.
- [README.md](README.md) is still the default Vite template; do not treat it as authoritative project documentation unless you update it.
