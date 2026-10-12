# Rootin — Codebase Overview

A prototype mobile web app for breast cancer survivors on aromatase inhibitor (AI) therapy. It helps patients track symptoms, complete validated questionnaires, and visualize trends over time — designed for a nursing program student project.

**Stack:** React 19 · Vite 8 · plain JSX · ESLint · no test runner

---

## Quick start

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build (base path `/Rootin-app/` for GitHub Pages) |
| `npm run lint` | ESLint across the repo |
| `npm run preview` | Serve the production build locally |

There is no project test suite yet. Validate changes with `npm run build` and `npm run lint`.

---

## Project structure

```
rootin-app/
├── index.html              # Vite entry; viewport-fit=cover, DM Sans font
├── vite.config.js          # base: '/Rootin-app/' on build (GitHub Pages)
├── eslint.config.js        # ignores dist/ and docs/ (build outputs)
├── project-docs/           # Source documentation (this folder)
├── docs/                   # ⚠ GitHub Pages build output — not source docs
├── dist/                   # Local production build output
└── src/
    ├── main.jsx            # React root
    ├── index.css           # Global reset, body, #root
    ├── App.jsx             # App shell + all screens + navigation (~1900 lines)
    ├── styles/
    │   └── tokens.js       # Colors, font, radius, shadow, spacing, safe-area helpers
    ├── assets/
    │   ├── loadAssets.js   # Resilient glob-based asset loader + icon/illustration exports
    │   ├── icons/          # Icon_24px/ and Icon_44px/ SVGs (default + onclick variants)
    │   ├── illustrations/  # Character, Grow, Basic_Info, Symptom_Info art
    │   └── logo/           # Rootin logo SVG
    └── components/
        ├── layout/
        │   ├── Screen.jsx         # Full-viewport screen shell (Scr)
        │   ├── ScreenWithNav.jsx  # Screen shell + bottom NavBar
        │   └── NavBar.jsx         # Bottom tab bar (Home/Calendar/Trends/Info)
        └── ui/
            ├── Button.jsx      # Pill-shaped primary/secondary button
            ├── TextInput.jsx   # Text/numeric input
            ├── Pill.jsx        # Selectable pill chip
            ├── ProgrssBar.jsx  # Survey progress bar (filename keeps legacy typo)
            ├── RadioCard.jsx   # Radio + Check selection rows
            └── CheckboxCard.jsx # Empty stub (unused)
```

---

## Architecture

### App shell (`src/App.jsx` default export)

Two modes, switched by `matchMedia("(min-width: 768px)")`:

| Mode | Breakpoint | Behavior |
|---|---|---|
| **Fluid app** | `< 768px` (phones/tablets) | Full-screen responsive layout (`100dvh`, safe-area insets) |
| **Desktop mockup** | `≥ 768px` | Fixed 393×852 iPhone frame with bezel, fake notch, html2canvas capture button; scaled to fit the stage |

Safe-area CSS variables (`--safe-top`, `--safe-bottom`) are set on the shell:
- **Real devices:** `env(safe-area-inset-*)`
- **Desktop mockup:** faked values (`60px` / `20px`) so screens keep their original spacing in demos

### Screen navigation

`RootinApp` (inside `App.jsx`) holds all navigation state:

- `scr` — current screen id (string)
- `hist` — back-navigation stack
- `tab` — active bottom-nav tab
- Survey steps: `uStep` (user survey, 1–13), `sStep` (symptom survey, 1–9)

Helpers: `go(s)`, `back()`, `navTab(t)`.

Screens are early-return branches (`if (scr === "splash") return (...)`). Each wraps content in `Screen` (`Scr`) or `ScreenWithNav` (`ScrWithNav`).

### Screen shells

- **`Screen` (`Scr`)** — full-size flex column; `overflowY: auto` so short viewports can scroll instead of clipping.
- **`ScreenWithNav`** — scrollable content pane + fixed bottom `NavBar`.
- Sticky headers use `SAFE_TOP` padding (`calc(var(--safe-top) + 44px)`).

### State & data

All state is **in-memory only** (nothing persisted). Includes questionnaire answers (`ud`, `sd`), growth/collection simulation, and reminder settings.

**Scoring logic** (validated instruments, computed live from current inputs):

| Instrument | Function | Notes |
|---|---|---|
| Godin Leisure-Time Exercise | `computeGodin` | Score + activity label |
| Insomnia Severity Index (ISI) | `computeISI` | 0–28 with clinical severity bands |
| General CVD Risk (BMI-based) | `computeCVD` | D'Agostino 2008; 10-year risk % |
| Hot flash interference (HFRDIS) | `computeHotflash` | Raw 0–10 average (no validated cutoff) |
| Joint pain (WOMAC-style) | `computeJointPain` | Raw average |
| Overall mood | `computeMood` | Drives plant art (good/moderate/poor) |

### Asset loading (`src/assets/loadAssets.js`)

Filenames were historically brittle (casing, dash/underscore, `onclick` vs `Onclick`). Assets are glob-loaded and matched by case/punctuation-insensitive keywords. Icons are plain image URLs used with `<img src={...}/>`.

Nav bar uses 44px icons; most other UI uses 24px. Active states use `*_onclick_*` variants.

---

## Design tokens (`src/styles/tokens.js`)

| Export | Contents |
|---|---|
| `COLORS` | bg, green, dark, brown, white, gray, border, lightGray, cardBg, red |
| `FONT_FAMILY` | DM Sans |
| `RADIUS` | pill, card, input |
| `SHADOWS` | soft |
| `SPACE` | xs–xxxl spacing scale |
| `BREAKPOINTS` | sm 480 / md 768 / lg 1024 |
| `SCREEN_PADDING` | 20px |
| `SAFE_TOP`, `SAFE_TOP_SPACER`, `SAFE_BOTTOM`, `SAFE_NAV_PADDING` | Safe-area calc helpers using `--safe-top` / `--safe-bottom` CSS vars |

`App.jsx` imports `COLORS as C` so existing call sites keep the short name.

---

## Styling conventions

- Function components; inline style objects for screen-level UI
- Design values from `tokens.js` where possible
- No CSS modules, no CSS-in-JS library, no media queries required for the fluid layout (grids use `auto-fit` / `minmax`; heights use `clamp` / `min-height` / `aspect-ratio`)
- GitHub Pages base path: production assets live under `/Rootin-app/` — do not use absolute paths that assume `/`

---

## Screens (by flow)

1. **Onboarding:** splash → app explain → data consent → survey intro → user survey (13 steps) → symptom survey intro → symptom survey (9 steps) → character name/adapt → growth milestones  
2. **Home:** health check-in card, plant art, results summary  
3. **Calendar / Trends:** month grid, SVG line/bar symptom charts  
4. **Info:** basic information, articles, symptom management grids  
5. **Profile:** my page, collection, my data, moments (export), settings, reminder detail  

Prototype Testing rows on Settings can reset/simulate first-run and re-open flows.

---

## Known limitations

- Monolithic `App.jsx` (~1900 lines) — extract new screens into components rather than growing it further
- No tests; no TypeScript; `CheckboxCard.jsx` is an empty stub
- `README.md` is still the default Vite template
- `docs/` and `dist/` are generated; source documentation lives in `project-docs/`
- Large image assets in `src/assets/illustrations/` make the JS/CSS bundle warning (>500 kB) expected
