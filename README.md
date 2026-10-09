# Rootin

A mobile-first React app for a nursing program — onboarding, study/learning screens, trends and calendar views, quizzes, and more. Built as a phone-style app that runs full-screen on real devices and shows a scaled phone-frame mockup on desktop for demos.

## Tech Stack

- React 19 + Vite (plain JSX, no TypeScript)
- Inline style objects with shared design tokens from [`src/styles/tokens.js`](src/styles/tokens.js)
- ESLint for linting; no test suite configured

## Getting Started

```bash
npm install
npm run dev
```

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run lint` | Run ESLint across the repo |
| `npm run preview` | Serve the production build locally |

> Note: production builds use base path `/Rootin-app/` (see [`vite.config.js`](vite.config.js)) for GitHub Pages.

## Responsive Behavior

- **Below 768px** (phones/tablets, portrait and landscape): the app fills the screen (`100dvh`, fluid widths) and respects device safe areas via `env(safe-area-inset-*)`.
- **768px and above**: the app renders inside a 393×852 phone-frame mockup (bezel, fake notch) scaled to fit the window — intended for demos.

## Project Structure

```
src/
├── App.jsx                 # Screen flow, navigation state, most screens
├── index.css               # Global reset, #root sizing, scrollbars
├── styles/tokens.js        # Colors, spacing, breakpoints, safe-area tokens
├── assets/loadAssets.js    # Shared icon/illustration loading
└── components/
    ├── layout/             # Screen, ScreenWithNav, NavBar
    └── ui/                 # Button, TextInput, Pill, ProgressBar, RadioCard
```

`docs/` at the repo root is **generated build output** for GitHub Pages, not source documentation.

## Documentation

- [Codebase overview](project-docs/CODEBASE_OVERVIEW.md) — architecture, conventions, and key files
- [Responsive redesign changes](project-docs/RESPONSIVE_CHANGES.md) — what changed and why
