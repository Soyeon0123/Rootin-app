# Responsive Layout Changes

**Date:** September 2026  
**Branch context:** responsive fix on top of `Update_Fin_V2`  
**Validation:** `npm run lint` ✅ · `npm run build` ✅

---

## Problem

The app did not respond to real device widths. It was a **fixed 393×852 iPhone mockup** that only appeared to adapt via JavaScript `transform: scale()`. Transform scales painting and hit-testing, but **not the layout box**, so the page still occupied 393×852 CSS pixels on every device.

### Symptoms on real devices

- Blank scroll space and dead touch areas (especially on widths ≠ 393)
- Landscape phones (`innerWidth > 480`) rendered the **desktop bezelled mockup** inside a ~390px-tall viewport
- Content clipped on short screens (`overflowY: hidden` on non-scroll screens)
- Overflow hidden by globally suppressed scrollbars
- Fixed grids (`repeat(2, 173px)`) never collapsed to one column
- No safe-area handling — content could sit under notches/home indicators
- Zero media queries in any shipped stylesheet (`src/App.css` with `@media` rules was never imported)

### Root causes (ranked)

| # | Cause | Location (before) |
|---|---|---|
| 1 | Fixed 393×852 frame + JS scale hack | `App.jsx` frame + `useScale` |
| 2 | Binary `innerWidth <= 480` mockup switch | `useIsMobile` |
| 3 | No media queries in live CSS; dead `App.css` | `src/App.css` (unimported) |
| 4 | Hardcoded widths keyed to 393 (362, 173, 306, 228) | Calendar, grids, chart, ProgBar |
| 5 | Hardcoded vertical geometry for 852 + magic 104/160/198px paddings | Many screens |
| 6 | `overflowY: hidden` + hidden scrollbars masked overflow | `Scr`, `index.css` |
| 7 | `100vh` vs `100dvh` mismatch; width-only resize handling | `index.css`, `useScale` |
| 8 | No spacing tokens; layout stubs empty; everything inline in `App.jsx` | `tokens.js`, `components/layout/*` |

**Viewport meta was correct** (`width=device-width, initial-scale=1.0`). Vite base path was not a layout issue.

---

## Solution overview

Full responsive fix with desktop mockup preserved for demos:

| Mode | Breakpoint | Behavior |
|---|---|---|
| Fluid app | `< 768px` | Real responsive layout filling the viewport |
| Desktop mockup | `≥ 768px` | 393×852 frame + bezel + notch + capture button, scaled to fit |

---

## Changes by phase

### Phase 1 — Shell & viewport

**Files:** `index.html`, `src/index.css`, `src/App.jsx` (app shell + hooks)

1. **Breakpoint** — replaced `useIsMobile` (`innerWidth <= 480`) with `useIsDesktopMockup` using `matchMedia("(min-width: 768px)")`. Landscape phones and small tablets get the fluid app, not a bezelled mockup.
2. **Removed mobile scale hack** — deleted `useScale()` (`min(w/393, h/852)`). Mobile path no longer uses `transform: scale()`.
3. **Fluid mobile shell:**
   ```jsx
   width: "100%",
   height: "100dvh",
   overflow: "hidden",
   // --safe-top / --safe-bottom from env(safe-area-inset-*)
   ```
4. **Desktop shell** — keeps `width: 393`, `height: 852`, bezel, fake notch, html2canvas button. New `useDesktopScale(active)` scales the frame to fit the stage (`min(1, (h-48)/852, (w-48)/393)`) with a sized wrapper so layout doesn’t overflow.
5. **Safe-area CSS vars** on the shell:
   - Mobile: `env(safe-area-inset-top/bottom, 0px)`
   - Desktop mockup: `60px` / `20px` (fakes notch + home indicator so demos keep original spacing)
6. **`index.html`** — added `viewport-fit=cover` to the viewport meta.
7. **`index.css`** — `#root { min-height: 100dvh }` (was `100vh`); removed global `::-webkit-scrollbar { display: none }` so overflow is visible.
8. Removed the inline `<style>` block in the old frame (duplicate font `@import`, reset, scrollbar hide).

### Phase 2 — Fluid widths & grids

**File:** `src/App.jsx`

| Offender | Before | After |
|---|---|---|
| Calendar card | `width: 362, height: 524` | `width: auto`, margins `32px 20px 20px`, natural height |
| Calendar day cells | `width: 30, height: 30`, `rowGap: 64` | `width: 100%`, `aspectRatio: 1`, `maxWidth: 40`, `rowGap: 10` |
| Trends card | `width: 362, height: 308` | `width: 100%`, `minHeight: 280` |
| Trends wrapper | `padding: 0 15.5px` (393 math) | `padding: 0 20px` |
| Trends SVG | `width={306}` fixed | `width="100%"` + `viewBox` + `preserveAspectRatio` |
| Comorbidity / symptom grids | `repeat(2, 173px)` + `width: 173, height: 133` | `repeat(auto-fit, minmax(140px, 1fr))` + `minHeight: 133` |
| `GridMenu` tiles | Fixed `cardW`/`cardH` tracks | Auto-fit grid; `cardW`/`cardH` props removed from component |
| `ProgBar` | `width: 228` | `width: 100%`, `maxWidth: 280` |
| Result cards | `height: 112` | `minHeight: 112` |
| Large illustrations (140–270px) | Fixed `width`/`height` | `min(vw-based, design size)` + `aspect-ratio` |
| Home plant art | `256×256` | `width: 100%`, `maxWidth: 256`, `aspect-ratio: 1` |

Deleted dead **`src/App.css`** (never imported; contained the only `@media` rules).

### Phase 3 — Fluid vertical layout & safe areas

**Files:** `src/App.jsx`, `src/styles/tokens.js`, layout/UI components

1. **Tokens added** (`tokens.js`):
   - `SAFE_TOP` = `calc(var(--safe-top, 0px) + 44px)` → ≈104px on notched phones, 44px+fake on desktop mockup when combined with shell vars
   - `SAFE_TOP_SPACER` = `calc(var(--safe-top, 0px) + 62px)` (article sticky spacers)
   - `SAFE_BOTTOM` = `calc(var(--safe-bottom, 0px) + 24px)` (CTA bottom padding)
   - `SAFE_NAV_PADDING` for the nav bar
   - Also: `SPACE`, `BREAKPOINTS`, `SCREEN_PADDING`
2. **Magic paddings replaced** across ~30 sites:
   - Sticky headers `104px …` → `` `${SAFE_TOP} …` ``
   - Article/basic-info sticky `height: 62` → `height: SAFE_TOP_SPACER`
   - Overlay `BackBtn` `top: 42` → `calc(var(--safe-top) + 34px)` (hit target enlarged to 44×44)
   - Close button `top: 104` → `SAFE_TOP`
   - Intro screens `paddingTop: 60/84`, consent `198px`, symDone `160px` → `SAFE_TOP`-based calcs
   - Bottom CTAs `44px` → `` `… ${SAFE_BOTTOM}` ``
   - Splash CTA `bottom: 48` → `bottom: SAFE_BOTTOM`
3. **Heights → flexible:**
   - Heroes `height: 359/382/340` → `minHeight` + `height: clamp(…)`
   - `Scr` non-scroll screens: `overflowY: hidden` → **always `auto`** (no silent clipping)
4. **NavBar** — `minHeight: 68` + `paddingBottom: SAFE_NAV_PADDING` (was fixed `height: 88`); 44px min hit targets.

### Phase 4 — Foundation & extraction

**New/updated files:**

| File | Role |
|---|---|
| `src/styles/tokens.js` | Added spacing, breakpoints, safe-area helpers |
| `src/assets/loadAssets.js` | **New** — moved glob asset loader + all icon/illustration exports out of `App.jsx` |
| `src/components/layout/Screen.jsx` | Extracted `Scr` |
| `src/components/layout/ScreenWithNav.jsx` | Extracted `ScrWithNav` |
| `src/components/layout/NavBar.jsx` | Extracted bottom tab bar (was inline in `App.jsx`) |
| `src/components/ui/Pill.jsx` | Extracted pill chip |
| `src/components/ui/ProgrssBar.jsx` | Extracted progress bar (filename keeps legacy typo) |
| `src/components/ui/RadioCard.jsx` | Extracted `Radio` + `Check` |
| `eslint.config.js` | `globalIgnores(['dist', 'docs'])` — stop linting generated GH Pages output |

`App.jsx` keeps thin aliases (`const Scr = Screen`, etc.) so ~50+ screen call sites stay unchanged. Also fixed pre-existing lint issues hit during validation (`Hdr`/`PillToggle` defined during render → plain `renderHdr`/`renderPillToggle` functions; unused vars; `set-state-in-effect` in the scale hook).

---

## Files touched

```
 M eslint.config.js
 M index.html
 D src/App.css                          (dead code, deleted)
 M src/App.jsx
 M src/index.css
 M src/styles/tokens.js
 M src/components/layout/NavBar.jsx     (was 0-byte stub)
 M src/components/layout/Screen.jsx     (was 0-byte stub)
 M src/components/layout/ScreenWithNav.jsx (was 0-byte stub)
 M src/components/ui/Pill.jsx           (was 0-byte stub)
 M src/components/ui/ProgrssBar.jsx     (was 0-byte stub)
 M src/components/ui/RadioCard.jsx      (was 0-byte stub)
 ?? src/assets/loadAssets.js            (new)
```

---

## How to verify

1. `npm run lint` and `npm run build` — both must exit 0.
2. Manual matrix:
   - Widths **320 / 360 / 393 / 430** — portrait and landscape
   - **iOS Safari** — `dvh`, notch safe areas, keyboard on forms
   - **Android Chrome** — rotation, split-screen if available
   - **Desktop ≥768px** — phone-frame mockup, scale-to-fit, capture button
3. Spot-check: home, user survey grids, calendar, trends chart, articles, bottom nav, splash CTA.

---

## Design decisions (for future maintainers)

- **768px breakpoint** — keeps tablets on the fluid app; only true desktop gets the demo frame.
- **Fake safe-area vars on desktop** — `--safe-top: 60px` preserves the original 104px header look in demos without changing every screen’s design values.
- **`auto-fit` grids instead of media queries** — column count adapts to container width with no breakpoint CSS.
- **`clamp()` / `min-height` instead of fixed heights** — short/landscape viewports scroll rather than clip.
- **Scrollbars visible on mobile** — overflow is diagnosable; native overlay scrollbars keep the aesthetic.
- **Layout components extracted** — new screens should import `Screen` / `ScreenWithNav` / `NavBar` rather than re-inlining shells; avoid growing `App.jsx` (see `AGENTS.md`).
