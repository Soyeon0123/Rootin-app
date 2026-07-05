import { useState, useEffect, useRef} from "react";
import html2canvas from "html2canvas";
import Button from "./components/ui/Button";
import TextInput from "./components/ui/TextInput.jsx";

import RootinLogo from "./assets/logo/Rootin_logo.svg?react";

/* ─── Resilient asset loading ────────────────────────────────
   Exact hard-coded filenames kept breaking on tiny naming differences
   (casing, dash vs underscore, "onclick" vs "Onclick", etc). Instead,
   we glob-load every file in each folder and pick the one whose name
   *contains* the keywords we want, ignoring case/punctuation. Everything
   (icons included) is loaded as a plain image URL string and rendered
   with <img src={...}/> — works the same for .svg and .png, no special
   component wrapping needed. A miss just returns null (a harmless empty
   <img>, never a crash) and prints every keyword tried + every file
   actually found in that folder to the browser console — copy that if
   something still doesn't show. */
const icon24Modules = import.meta.glob("./assets/icons/Icon_24px/*.svg", { eager: true, import: "default" });
const icon44Modules = import.meta.glob("./assets/icons/Icon_44px/*.svg", { eager: true, import: "default" });
const charModules = import.meta.glob("./assets/illustrations/Character/*.{png,jpg,jpeg,PNG,JPG}", { eager: true, import: "default" });
const growModules = import.meta.glob("./assets/illustrations/Grow/*.{png,jpg,jpeg,PNG,JPG}", { eager: true, import: "default" });
const basicInfoModules = import.meta.glob("./assets/illustrations/Basic_Info/*.{png,jpg,jpeg,PNG,JPG}", { eager: true, import: "default" });
const symptomModules = import.meta.glob("./assets/illustrations/Symptom_Info/*.{png,jpg,jpeg,PNG,JPG}", { eager: true, import: "default" });

const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function findAsset(modules, mustInclude, mustExclude = []) {
  const entries = Object.entries(modules);
  const hit = entries.find(([path]) => {
    const p = norm(path);
    return mustInclude.every(k => p.includes(norm(k))) && !mustExclude.some(k => p.includes(norm(k)));
  });
  if (!hit) {
    console.warn(`[assets] no file matched [${mustInclude.join(", ")}]` + (mustExclude.length ? ` (excluding ${mustExclude.join(", ")})` : "") + `. Files found in this folder:`, entries.map(([p]) => p));
    return null;
  }
  return hit[1];
}
const icon24 = (...include) => findAsset(icon24Modules, include, ["onclick"]);
const icon24Active = (...include) => findAsset(icon24Modules, [...include, "onclick"]);
const icon44 = (...include) => findAsset(icon44Modules, include, ["onclick"]);
const icon44Active = (...include) => findAsset(icon44Modules, [...include, "onclick"]);
const char = (...include) => findAsset(charModules, include);
const grow = (...include) => findAsset(growModules, include);
const basicInfo = (...include) => findAsset(basicInfoModules, include);
const symptom = (...include) => findAsset(symptomModules, include);

// icons — 44px versions for the nav bar + the survey "Next" button, everything
// else uses the 24px versions. All are plain image URLs, used as <img src=.../>.
// NOTE: single-letter keywords like "r"/"l"/"x" are dangerous here — "arrow" itself
// contains "r", and "24px"/"44px" contains "x", so they falsely match unrelated
// files. Combined tokens ("arrowl", "arrowr", "xicon") avoid that entirely.
const HomeIcon = icon44("home", "icon");
const HomeIconActive = icon44Active("home", "icon");
const CalendarIcon = icon44("calendar", "icon");
const CalendarIconActive = icon44Active("calendar", "icon");
const TrendIcon = icon44("trend", "icon");
const InfoIcon = icon44("info", "icon");
const InfoIconActive = icon44Active("info", "icon");
const ArrowLeft = findAsset(icon24Modules, ["arrowl", "icon"], ["circle", "onclick"]);
const ArrowRight = findAsset(icon24Modules, ["arrowr", "icon"], ["circle", "onclick"]);
const ArrowUp = icon24("arrow", "up", "icon");
const ArrowDown = icon24("arrow", "down", "icon");
const CircleArrowRight = findAsset(icon44Modules, ["circle", "arrowr", "icon"], ["onclick"]);
const CircleArrowRightActive = findAsset(icon44Modules, ["circle", "arrowr", "icon", "onclick"]);
const UserIcon = icon24("user", "icon");
const DataIcon = icon24("data", "icon");
const SettingsIcon = icon24("setting", "icon");
const XIcon = icon24("xicon");
// symptom / condition icons — replace the emoji placeholders
const DiabetesIcon = icon24("diabetes", "icon");
const CardioVIcon = icon24("cardiov", "icon");
const DepressionIcon = icon24("depression", "icon");
const HypertensionIcon = icon24("hypertension", "icon");
const OsteoPIcon = icon24("osteop", "icon");
const OthersIcon = icon24("others", "icon");
const CardioIcon = findAsset(icon24Modules, ["cardio", "icon"], ["onclick", "cardiov"]);
const OsteoIcon = findAsset(icon24Modules, ["osteo", "icon"], ["onclick", "osteop"]);
const AimssIcon = icon24("aimss", "icon");
const HotflashIcon = icon24("hotflash", "icon");
const FatigueIcon = icon24("fatigue", "icon");

// illustrations — character (daily mood art) + growth-stage art (Grow folder)
const RootinGood1 = char("good", "01") || char("good", "1");
const RootinGood2 = char("good", "02") || char("good", "2");
const RootinGood3 = char("good", "03") || char("good", "3");
const RootinGood4 = char("good", "04") || char("good", "4");
const RootinBad1 = char("bad", "01") || char("bad", "1");
const RootinBad2 = char("bad", "02") || char("bad", "2");
const GrowSeed = grow("seed");
const GrowSprout = grow("sprout");
const GrowBloom = grow("bloom");

// Day 1 → Seed, Day 2 → Sprout, Day 3 → Bloom (fixed growth-stage art), Day 4+ →
// functional: a random Good/Bad variant driven by that round's symptom mood.
function growthImage(day, mood, variantSeed = 0) {
  if (day === 1) return GrowSeed;
  if (day === 2) return GrowSprout;
  if (day === 3) return GrowBloom;
  if (mood === "poor") return BAD_IMAGES[0];
  if (mood === "moderate") return BAD_IMAGES[1];
  return GOOD_IMAGES[variantSeed % GOOD_IMAGES.length];
}

// illustrations — basic info
const BreastCancerIllustration = basicInfo("breast");
const AIIllustration = basicInfo("ai", "illust");

// illustrations — symptom info
const RootinCardiovascular = symptom("cardio");
const RootinBoneLoss = symptom("bone", "loss");
const RootinBoneFractures = symptom("bone", "fract");
const RootinMusclePain = symptom("muscle");
const RootinHotFlash = symptom("hotflash") || symptom("hot", "flash");
const RootinFatigue = symptom("fatigue");

// App function (Temporary prototype)

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function useScale() {
  const [scale, setScale] = useState(1);
  const widthRef = useRef(typeof window !== "undefined" ? window.innerWidth : 0);
  useEffect(() => {
    const calc = () => {
      const s = Math.min(window.innerWidth / 393, window.innerHeight / 852);
      setScale(s); // fill the real screen — don't cap at 1x anymore
    };
    calc();
    // Mobile keyboards shrink window.innerHeight, not width. Only recompute the
    // scale on real layout changes (rotation/resize), so opening a text input
    // no longer rescales the whole app up and down.
    const handler = () => {
      if (window.innerWidth !== widthRef.current) {
        widthRef.current = window.innerWidth;
        calc();
      }
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return scale;
}

/* ─── Design Tokens ──────────────────────────────────────── */
const C = {
  bg: "#F3EFE3", green: "#344C3D", dark: "#001910",
  brown: "#582F0E", white: "#FFFFFF", gray: "#7A7A7A",
  border: "#D4CFC5", lightGray: "#E3DDD4", cardBg: "#FFFFFF",
  red: "#8B2020",
};

// Collection rewards are the 4 "Good" variants only — the 2 "Bad" variants are
// reserved for showing a poor/moderate mood, not for the collectible set.
const VAR_IMAGES = [RootinGood1, RootinGood2, RootinGood3, RootinGood4];
const GOOD_IMAGES = VAR_IMAGES;
const BAD_IMAGES = [RootinBad1, RootinBad2];

/* ─── Scoring logic (based on validated criteria) ───────────
   Godin, ISI, CVD have clear published cutoffs → scored live.
   Hot flash (HFRDIS) has no validated cutoff in the source paper,
   so it is only shown as a raw 0–10 average, not a severity label. */

// Godin Leisure-Time Exercise Questionnaire — Godin & Shephard 2011
function computeGodin(ud) {
  const stren = Number(ud.stren) || 0, mod = Number(ud.mod) || 0, mild = Number(ud.mild) || 0;
  const score = stren * 9 + mod * 5 + mild * 3;
  const label = score >= 24 ? "Active" : score >= 14 ? "Moderately Active" : "Insufficiently Active/Sedentary";
  return { score, label };
}

// Insomnia Severity Index — Bastien et al. 2001 (0–28)
function computeISI(sd) {
  const keys = ["isi_fall", "isi_stay", "isi_early", "isi_sat", "isi_int", "isi_not", "isi_wor"];
  const total = keys.reduce((sum, k) => sum + (Number(sd[k]) || 0), 0);
  const answered = keys.filter(k => sd[k] !== undefined).length;
  const level =
    total <= 7  ? { label: "No clinically significant insomnia", color: "#4CAF50" } :
    total <= 14 ? { label: "Subthreshold insomnia",              color: "#FF9800" } :
    total <= 21 ? { label: "Clinical insomnia (moderate)",       color: "#F44336" } :
                  { label: "Clinical insomnia (severe)",         color: "#B71C1C" };
  return { total, level, answered, complete: answered === keys.length };
}

// General CVD Risk (BMI-based) — D'Agostino et al. 2008, Circulation (Framingham)
function computeCVD(sd) {
  const sex = sd.cvdSex, sbp = Number(sd.sbp), age = Number(sd.cvdAge), bmi = Number(sd.bmiVal);
  const trt = sd.cvdHtn === "Yes", smoke = sd.cvdSmk === "Yes", diab = sd.cvdDiab === "Yes";
  if (!sex || !sbp || !age || !bmi) return { valid: false };
  const lnAge = Math.log(age), lnSbp = Math.log(sbp), lnBmi = Math.log(bmi);
  const s = smoke ? 1 : 0, d = diab ? 1 : 0;
  let sum, s0, mean;
  if (sex === "Man") {
    const sbpCoef = trt ? 1.92672 : 1.85508;
    sum = lnAge * 3.11296 + lnSbp * sbpCoef + s * 0.70953 + lnBmi * 0.79277 + d * 0.5316;
    s0 = 0.88431; mean = 23.9388;
  } else {
    const sbpCoef = trt ? 2.88267 : 2.81291;
    sum = lnAge * 2.72107 + lnSbp * sbpCoef + s * 0.61868 + lnBmi * 0.51125 + d * 0.77763;
    s0 = 0.94833; mean = 26.0145;
  }
  let risk = 1 - Math.pow(s0, Math.exp(sum - mean));
  const pct = risk * 100;
  const level =
    pct < 10 ? { label: "Low 10-year risk", color: "#4CAF50" } :
    pct < 20 ? { label: "Moderate 10-year risk", color: "#FF9800" } :
               { label: "High 10-year risk", color: "#F44336" };
  return { valid: true, pct: pct > 30 ? 30 : pct, capped: pct > 30, level };
}

// Hot flash-Related Daily Interference Scale — raw average only (no validated cutoff)
function computeHotflash(sd) {
  const items = ["Work","Social activities","Leisure activities","Sleep","Mood","Concentration","Relations with others","Sexuality","Enjoyment of life","Overall quality of life"];
  const vals = items.map(i => Number(sd[`hf_${i}`]) || 0);
  const avg = vals.reduce((a, b) => a + b, 0) / items.length;
  return { avg };
}

// Joint pain (WOMAC-style grids) — raw average across all recorded grids, no published cutoff
function computeJointPain(sd) {
  const vals = Object.keys(sd)
    .filter(k => k.startsWith("jp_") || k.startsWith("jpd_") || k.startsWith("jpd2_") || k === "jp_stiff1" || k === "jp_stiff2")
    .map(k => sd[k]).filter(v => v !== undefined);
  if (!vals.length) return { avg: 0 };
  return { avg: vals.reduce((a, b) => a + b, 0) / vals.length };
}

// Overall mood for the plant, from whatever this round's scores are (best-effort, informational only)
function computeMood({ isi, cvd, hotflash, joint }) {
  let badness = 0, n = 0;
  if (isi && isi.complete) { badness += isi.total / 28; n++; }
  if (cvd && cvd.valid) { badness += Math.min(cvd.pct, 30) / 30; n++; }
  if (hotflash) { badness += hotflash.avg / 10; n++; }
  if (joint) { badness += joint.avg / 4; n++; }
  if (!n) return "neutral";
  const avg = badness / n;
  return avg < 0.33 ? "good" : avg < 0.66 ? "moderate" : "poor";
}

/* ─── Base components ────────────────────────────────────── */
// mood: "good" | "moderate" | "poor" | "neutral" — drives which real plant art is shown.
// variantSeed lets callers get a bit of visual variety among the "good" images
// instead of always showing the same one.
const Sprout = ({ size = 120, locked = false, mood = "neutral", variantSeed = 0 }) => {
  const src =
    mood === "poor"     ? BAD_IMAGES[0] :
    mood === "moderate" ? BAD_IMAGES[1] :
                           GOOD_IMAGES[variantSeed % GOOD_IMAGES.length]; // "good" and "neutral" (no data yet) both use a Good_ variant — there's no separate neutral asset
  return (
    <img src={src} alt="Rootin character" style={{ width: size, height: size, objectFit: "contain", display: "block", opacity: locked ? 0.45 : 1, filter: locked ? "grayscale(100%)" : "none" }} />
  );
};

// ✅ Logo: img → SVG 컴포넌트
const Logo = ({ size = 90 }) => (
  <RootinLogo style={{ width: size, height: size, display: "block" }} />
);

const Scr = ({ children, scroll = false, bg = C.bg, style = {} }) => (
  <div style={{ width: "100%", height: "100%", background: bg, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", color: C.dark, overflowY: scroll ? "auto" : "hidden", overflowX: "hidden", position: "relative", ...style }}>{children}</div>
);

const ScrWithNav = ({ children, activeTab, navGo, bg = C.bg }) => (
  <div style={{ width: "100%", height: "100%", background: bg, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", color: C.dark, position: "relative" }}>
    <div style={{ flex: 1, overflowY: "auto", overflowX: "clip", display: "flex", flexDirection: "column" }}>{children}</div>
    <NavBar active={activeTab} go={navGo} />
  </div>
);

const ProgBar = ({ v }) => (
  <div style={{ height: 9, background: C.lightGray, borderRadius: 13, margin: "4px auto 12px", width: 228, alignSelf: "center" }}>
    <div style={{ height: "100%", width: `${v * 100}%`, background: C.dark, borderRadius: 13, transition: "width .3s" }} />
  </div>
);

// ✅ BackBtn: circle_arrow_L_icon_24px (+ onclick/pressed variant)
const BackBtn = ({ go, overlay = false }) => (
  <button onClick={go} style={{
    width: 34, height: 34, border: "none", cursor: "pointer", padding: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    ...(overlay
      ? { position: "absolute", top: 42, left: 20, background: "transparent", zIndex: 10 }
      : { background: "transparent" }
    ),
  }}>
    <img src={ArrowLeft} alt="" style={{ width: 20, height: 20, display: "block", pointerEvents: "none" }} />
  </button>
);

// ✅ ChevronRight: img → ArrowRight 컴포넌트
const ChevronRight = ({ size = 20 }) => (
  <img src={ArrowRight} alt="" style={{ width: size, height: size, display: "block", flexShrink: 0, opacity: 0.5, pointerEvents: "none" }} />
);

const GhostBtn = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{ background: "transparent", color: C.dark, border: `1.5px solid ${C.border}`, borderRadius: 100, padding: "13px 20px", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", ...style }}>{children}</button>
);

// ✅ ArrowBtn: img → 조건부 SVG 컴포넌트
const ArrowBtn = ({ onClick }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)} onClick={onClick} style={{ width: 50, height: 50, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }}>
      {pressed
        ? <img src={CircleArrowRightActive} alt="" style={{ width: 44, height: 44, display: "block", pointerEvents: "none" }} />
        : <img src={CircleArrowRight} alt="" style={{ width: 44, height: 44, display: "block", pointerEvents: "none" }} />
      }
    </button>
  );
};

const Radio = ({ label, on, set }) => (
  <div onClick={set} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: C.cardBg, borderRadius: 14, cursor: "pointer", border: on ? `2px solid ${C.green}` : `1px solid ${C.border}` }}>
    <span style={{ fontSize: 15 }}>{label}</span>
    <div style={{ width: 22, height: 22, borderRadius: "50%", border: on ? `7px solid ${C.green}` : `2px solid ${C.border}`, background: "white", flexShrink: 0 }} />
  </div>
);

const Check = ({ label, on, toggle }) => (
  <div onClick={toggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: C.cardBg, borderRadius: 14, cursor: "pointer", border: on ? `2px solid ${C.green}` : `1px solid ${C.border}` }}>
    <span style={{ fontSize: 15 }}>{label}</span>
    <div style={{ width: 22, height: 22, borderRadius: "50%", border: on ? `7px solid ${C.green}` : `2px solid ${C.border}`, background: "white", flexShrink: 0 }} />
  </div>
);

const Pill = ({ label, on, click }) => (
  <button onClick={click} style={{ padding: "10px 18px", borderRadius: 100, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", border: on ? `1.5px solid ${C.green}` : `1.5px solid ${C.border}`, background: on ? C.green : "white", color: on ? "white" : C.dark, transition: "all .15s" }}>{label}</button>
);

const Dropdown = ({ label, value, onChange, opts }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(o => !o)} style={{ background: C.cardBg, borderRadius: 14, border: `1px solid ${open ? C.green : C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <span style={{ fontSize: 15, fontFamily: "'DM Sans', sans-serif", color: value ? C.dark : C.gray }}>{value || label}</span>
        <span style={{ color: C.gray, display: "flex", alignItems: "center" }}>{open ? <img src={ArrowUp} alt="" style={{ width: 16, height: 16 }} /> : <img src={ArrowDown} alt="" style={{ width: 16, height: 16 }} />}</span>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "white", borderRadius: 14, border: `1px solid ${C.border}`, zIndex: 200, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          {opts.map((o, i) => (
            <div key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ padding: "14px 16px", borderBottom: i < opts.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", fontSize: 15, fontFamily: "'DM Sans', sans-serif", background: value === o ? `${C.green}11` : "white", color: value === o ? C.green : C.dark, fontWeight: value === o ? 600 : 400 }}>
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Tog = ({ on, flip, color = C.green }) => (
  <div onClick={e => { e.stopPropagation(); flip(); }} style={{ width: 51, height: 31, borderRadius: 100, background: on ? color : "#C7C7CC", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
    <div style={{ width: 27, height: 27, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: on ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.22)" }} />
  </div>
);

// ✅ NavBar: img → 동적 SVG 컴포넌트
const NavBar = ({ active, go }) => {
  const tabs = [{ id: "home", label: "Home" }, { id: "calendar", label: "Calendar" }, { id: "trends", label: "Trends" }, { id: "info", label: "Info" }];
  const icons = {
    home:     { default: HomeIcon,     active: HomeIconActive },
    calendar: { default: CalendarIcon, active: CalendarIconActive },
    trends:   { default: TrendIcon,    active: TrendIcon },
    info:     { default: InfoIcon,     active: InfoIconActive },
  };
  return (
    <div style={{ background: C.bg, borderTop: `1px solid ${C.border}`, flexShrink: 0, height: 88, display: "flex", alignItems: "flex-start", paddingTop: 15, justifyContent: "center", gap: 0 }}>
      {tabs.map(t => {
        const iconSrc = active === t.id ? icons[t.id].active : icons[t.id].default;
        return (
          <button key={t.id} onClick={() => go(t.id)} style={{ width: 44, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: C.dark, opacity: active === t.id ? 1 : 0.35, transition: "opacity .2s", padding: 0, marginRight: t.id !== "info" ? 32 : 0 }}>
            <img src={iconSrc} alt="" style={{ width: 32, height: 32, display: "block", pointerEvents: "none" }} />
            <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: C.dark, fontWeight: active === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const PainGrid = ({ label, value, set }) => {
  const lvls = ["None", "Mild", "Moderate", "Severe", "Extreme"];
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 13, color: C.dark, marginBottom: 8, lineHeight: 1.5 }}>{label}</p>
      <div style={{ display: "flex", gap: 5 }}>
        {lvls.map((l, i) => (
          <div key={l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.gray, textAlign: "center", lineHeight: 1.2 }}>{l}</span>
            <div onClick={() => set(i)} style={{ width: "100%", aspectRatio: "1", maxWidth: 44, border: value === i ? `2px solid ${C.green}` : `1.5px solid ${C.border}`, borderRadius: 7, background: value === i ? C.green : "white", cursor: "pointer" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const SliderRow = ({ label, value, set }) => (
  <div style={{ background: "white", borderRadius: 14, padding: 14, marginBottom: 8 }}>
    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{label}</p>
    <input type="range" min={0} max={10} value={value} onChange={e => set(+e.target.value)} style={{ width: "100%", accentColor: C.green, cursor: "pointer" }} />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.gray, marginTop: 2 }}>
      <span>0</span><span style={{ fontWeight: 600, color: C.green }}>{value}</span><span>10</span>
    </div>
  </div>
);

const ArticlePage = ({ title, body, back, heroImg, isPhoto = false }) => (
  <Scr scroll>
    <div style={{ height: 62, flexShrink: 0, position: "sticky", top: 0, zIndex: 20, background: C.bg }} />
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ height: 359, background: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {heroImg && (
          <img src={heroImg} alt={title} style={{ width: "100%", height: "100%", objectFit: isPhoto ? "cover" : "contain", display: "block" }} />
        )}
      </div>
      <BackBtn go={back} overlay />
    </div>
    <div style={{ padding: "20px 22px 60px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18, lineHeight: 1.35, color: C.dark }}>{title}</h1>
      <div style={{ fontSize: 14, lineHeight: 1.85, color: "#2a2a2a" }}>
        {body.map((p, i) => typeof p === "string" ? <p key={i} style={{ marginBottom: 14 }}>{p}</p> : <div key={i}>{p}</div>)}
      </div>
    </div>
  </Scr>
);

const GridMenu = ({ title, subtitle, items, back, cardW, cardH, topGap, gridGap = 12 }) => (
  <Scr scroll>
    <div style={{ padding: "104px 20px 0", flexShrink: 0, position: "sticky", top: 0, zIndex: 5, background: C.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: subtitle ? 6 : 16 }}>
        <BackBtn go={back} />
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{title}</h2>
      </div>
      {subtitle && <p style={{ fontSize: 13, color: C.dark, padding: "0 0 14px", lineHeight: 1.65 }}>{subtitle}</p>}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: cardW ? `repeat(2, ${cardW}px)` : "1fr 1fr", justifyContent: cardW ? "center" : "initial", gap: gridGap, padding: `${topGap ?? 0}px 20px 60px` }}>
      {items.map((item) => (
        <div key={item.label} onClick={item.go} style={{ background: "white", borderRadius: 16, padding: "22px 12px 18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, border: `1.5px solid ${C.brown}33`, cursor: "pointer", ...(cardW ? { width: cardW, height: cardH, boxSizing: "border-box" } : {}) }}>
          {item.Icon
            ? <img src={item.Icon} alt={item.label} style={{ width: 32, height: 32, display: "block" }} />
            : item.img
            ? <img src={item.img} alt={item.label} style={{ width: 72, height: 72, objectFit: "contain" }} />
            : <div style={{ width: 44, height: 44, background: C.lightGray, borderRadius: 8 }} />
          }
          <p style={{ fontSize: 13, fontWeight: 600, textAlign: "center", color: C.dark }}>{item.label}</p>
        </div>
      ))}
    </div>
  </Scr>
);

/* ─── Main App ───────────────────────────────────────────── */
function RootinApp() {
  const [scr, setScr] = useState("splash");
  const [hist, setHist] = useState([]);
  const [tab, setTab] = useState("home");
  const [uStep, setUStep] = useState(1);
  const [sStep, setSStep] = useState(1);
  const [ud, setUd] = useState({});
  const [sd, setSd] = useState({});
  const [charName, setCharName] = useState("Sprout");
  const [notifs, setNotifs] = useState({ main: false, med: true, doc: true });
  const [expand, setExpand] = useState({});
  const [dayCount, setDayCount] = useState(1);
  const [isSetup, setIsSetup] = useState(true);
  const [slide, setSlide] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [inp, setInp] = useState("Sprout");
  const [ni, setNi] = useState(0);
  const [af, setAf] = useState("Hot flash");
  const [period, setPeriod] = useState("Week");
  const [cType, setCType] = useState("Line Chart");
  const [remType, setRemType] = useState("Medication");
  const [remOn, setRemOn] = useState({ med: true, doc: true });
  const [remTime, setRemTime] = useState({ med: "8:00 AM", doc: "9:00 AM" });
  const [remRepeat, setRemRepeat] = useState({ med: "Daily", doc: "Weekly" });
  const [btnActive, setBtnActive] = useState(false);
  const [reminderText, setReminderText] = useState("Take your Anastrozole");
  const [selectedChar, setSelectedChar] = useState(0);

  // ── Usability-test simulation state (in-memory only, nothing persisted) ──
  const [round, setRound] = useState(0);            // number of symptom surveys completed
  const [growthStage, setGrowthStage] = useState("seed"); // "seed" | "sprout"
  const [collection, setCollection] = useState([]); // indices into VAR_IMAGES unlocked from round 3+
  const [history, setHistory] = useState([]);       // one record per completed symptom survey

  const go = (s) => { setHist(h => [...h, scr]); setScr(s); };
  const back = () => { if (hist.length) { setScr(hist[hist.length - 1]); setHist(h => h.slice(0, -1)); } };
  const navTab = (t) => { setTab(t); setHist([]); setScr({ home: "home", calendar: "calendar", trends: "trends", info: "helpfulInfo" }[t]); };
  const uu = (k, v) => setUd(d => ({ ...d, [k]: v }));
  const su = (k, v) => setSd(d => ({ ...d, [k]: v }));
  const tog = (arr, value) => arr?.includes(value) ? arr.filter(x => x !== value) : [...(arr || []), value];

  // Live scores for whatever is currently in `sd` (this round, in progress or just finished)
  const godinResult = computeGodin(ud);
  const isiResult = computeISI(sd);
  const cvdResult = computeCVD(sd);
  const hotflashResult = computeHotflash(sd);
  const jointResult = computeJointPain(sd);
  const currentMood = computeMood({ isi: isiResult, cvd: cvdResult, hotflash: hotflashResult, joint: jointResult });
  const lastRecord = history[history.length - 1];
  const latestMood = lastRecord ? lastRecord.mood : "neutral";

  // Finish one symptom-survey round: snapshot scores into history, advance growth, reset inputs.
  const finishSymptomRound = () => {
    const record = {
      day: dayCount,
      isi: isiResult,
      cvd: cvdResult,
      hotflash: hotflashResult,
      joint: jointResult,
      mood: currentMood,
    };
    setHistory(h => [...h, record]);
    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound === 2) setGrowthStage("sprout");
    if (nextRound >= 3) {
      setCollection(c => {
        const remaining = VAR_IMAGES.map((_, i) => i).filter(i => !c.includes(i));
        if (!remaining.length) return c;
        const pick = remaining[Math.floor(Math.random() * remaining.length)];
        return [...c, pick];
      });
    }
    setSd({}); // reset the questionnaire inputs — reopening the survey always starts blank
    return { record, nextRound };
  };

  /* ─── SPLASH ──────────────────────────────────────── */
  if (scr === "splash") return (
    <Scr style={{ alignItems: "center", justifyContent: "center" }}>
      <Logo size={180} />
      <p style={{ fontSize: 28, fontWeight: 700, marginTop: 20, color: C.dark }}>rootin</p>
      <p style={{ fontSize: 14, color: C.gray, marginTop: 6 }}>Grow with your routine</p>
      <div style={{ position: "absolute", bottom: 48, width: "80%" }}>
        <Button onClick={() => go("appExp")} color={C.green}>Get Started</Button>
      </div>
    </Scr>
  );

  /* ─── APP EXPLAIN ─────────────────────────────────── */
  if (scr === "appExp") {
    const slides = [
      { h: "Rootin is a medication care app designed for Aromatase Inhibitor survivors.", b: "It helps you track and manage specific symptoms, making it easier to communicate your condition clearly with your doctor." },
      { h: "Rootin is here to support your daily journey.", b: "Record your symptoms, monitor your progress, and build a healthier routine—one day at a time." },
      { h: "Are you ready to let Rootin become part of your routine?", b: "Let a small Rootin take root in your everyday life and grow with you." },
    ];
    return (
      <Scr>
        <div style={{ flexShrink: 0, paddingTop: 84 }}>
          <div style={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}><Sprout size={230} /></div>
        </div>
        <div style={{ flex: 1, padding: "40px 28px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {slides.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= slide ? C.dark : C.lightGray, transition: "background .3s" }} />)}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.45, textAlign: "center", marginBottom: 14 }}>{slides[slide].h}</h2>
            <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.75, textAlign: "center" }}>{slides[slide].b}</p>
          </div>
          <Button color={C.green} onClick={() => slide < 2 ? setSlide(s => s + 1) : go("dataConsent")}>Next</Button>
        </div>
      </Scr>
    );
  }

  /* ─── DATA CONSENT ────────────────────────────────── */
  if (scr === "dataConsent") return (
    <Scr scroll>
      <div style={{ padding: "198px 24px 0" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 88, textAlign: "center" }}>Personal Data Consent</h2>
        <div style={{ height: 88, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 88 }}>
          <Logo size={88} />
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.75, textAlign: "center", marginBottom: 16 }}>Rootin collects your health information to help you track symptoms and improve your care experience. Your data is securely stored and never sold.</p>
        <p style={{ fontSize: 14, lineHeight: 1.75, textAlign: "center", marginBottom: 28 }}>By tapping "I Agree," you consent to the collection and use of your information.</p>
        <div onClick={() => setAgreed(a => !a)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 32 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: agreed ? C.green : "transparent", border: agreed ? "none" : `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
            {agreed && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, lineHeight: 1.5 }}>I Agree to the Collection and Use of My Information</span>
        </div>
      </div>
      <div style={{ padding: "16px 24px 40px" }}>
        <Button color={C.brown} onClick={() => agreed && go("surveyIntro")} disabled={!agreed}>Confirm</Button>
      </div>
    </Scr>
  );

  /* ─── SURVEY INTRO ────────────────────────────────── */
  if (scr === "surveyIntro") return (
    <Scr style={{ alignItems: "center", justifyContent: "space-between", paddingTop: 60 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
        <img src={GrowBloom} alt="Rootin" style={{ width: 140, height: 140, objectFit: "contain" }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 28, marginBottom: 12, textAlign: "center" }}>Hi, I'm Rootin.</h2>
        <p style={{ fontSize: 15, lineHeight: 1.75, textAlign: "center", marginBottom: 10 }}>Let's get to know you a little better. I'm here to support you and your daily routine.</p>
        <p style={{ fontSize: 13, color: C.gray }}>Your data is safe and stays with you.</p>
      </div>
      <div style={{ padding: "16px 24px 44px", width: "100%" }}>
        <Button color={C.brown} onClick={() => { setUStep(1); go("uSurvey"); }}>Confirm</Button>
      </div>
    </Scr>
  );

  /* ─── USER SURVEY ─────────────────────────────────── */
  if (scr === "uSurvey") {
    const total = 13;
    const next = () => {
      if (uStep === 10 && ud.alcohol !== "Yes") { setUStep(12); return; } // skip the frequency-only step unless they said Yes
      if (uStep < total) { setUStep(s => s + 1); return; }
      go("symSurveyIntro");
    };
    const prev = () => {
      if (uStep === 12 && ud.alcohol !== "Yes") { setUStep(10); return; } // mirror the skip when going back
      uStep > 1 ? setUStep(s => s - 1) : back();
    };
    const Hdr = () => (
      <div style={{ padding: "104px 20px 8px", flexShrink: 0, position: "sticky", top: 0, zIndex: 5, background: C.bg }}>
        <ProgBar v={uStep / total} />
        <BackBtn go={prev} />
      </div>
    );

    if (uStep === 1) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Tell us your information</h2>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Tell us your age</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <TextInput placeholder="Year" value={ud.birthYear || ""} onChange={v => uu("birthYear", v)} inputMode="numeric" numericOnly maxLength={4} />
            <Dropdown label="Month" value={ud.birthMonth || ""} onChange={v => uu("birthMonth", v)} opts={["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"]} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>What's your gender?</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {["Man","Woman","Non-binary","Prefer not to say","Prefer to self-describe"].map(g => <Pill key={g} label={g} on={ud.gender === g} click={() => uu("gender", g)} />)}
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 2) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Tell us your information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Dropdown label="Education" value={ud.edu || ""} onChange={v => uu("edu", v)} opts={["High school/Vocational school or less","Associates degree or some college","Bachelor's degree","Graduate/professional school","Decline to answer"]} />
            <Dropdown label="Marital Status" value={ud.marital || ""} onChange={v => uu("marital", v)} opts={["Married","Divorced","Widowed","Never married","Decline to answer"]} />
            <Dropdown label="Income" value={ud.income || ""} onChange={v => uu("income", v)} opts={["Less than $35,000","$35,000–$49,999","$50,000–$74,999","$75,000–$99,999","$100,000–$149,999","More than $150,000","Unknown"]} />
            <Dropdown label="Race" value={ud.race || ""} onChange={v => uu("race", v)} opts={["Non-Hispanic White","Hispanic White","Black/African American","American Indian/Pacific Islander","Asian","Native American/Alaskan Native","Other"]} />
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 3) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Tell us your information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <Dropdown label="Area type" value={ud.area || ""} onChange={v => uu("area", v)} opts={["Suburb","Living","Urban","Rural Area"]} />
            <Dropdown label="State" value={ud.state || ""} onChange={v => uu("state", v)} opts={["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","AS","GU","MP","PR","VI"]} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Do you have health insurance?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["No","Not sure","Not Answered","Yes"].map(o => <Radio key={o} label={o} on={ud.insurance === o} set={() => uu("insurance", o)} />)}
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 4) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Age at breast cancer diagnosis</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TextInput placeholder="Year" value={ud.diagYear || ""} onChange={v => uu("diagYear", v)} />
            <TextInput placeholder="Month" value={ud.diagMonth || ""} onChange={v => uu("diagMonth", v)} />
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 5) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>What kind of AI do you use for your medication?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Anastrozole","Letrozole","Exemestane","Other"].map(o => <Radio key={o} label={o} on={ud.aiMed === o} set={() => uu("aiMed", o)} />)}
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 6) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>When have you started taking AI for treatment?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TextInput placeholder="Year" value={ud.txYear || ""} onChange={v => uu("txYear", v)} />
            <TextInput placeholder="Month" value={ud.txMonth || ""} onChange={v => uu("txMonth", v)} />
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 7) {
      const conds = [
        ["Diabetes", DiabetesIcon],
        ["Cardiovascular Disease", CardioIcon],
        ["Depression", DepressionIcon],
        ["Hypertension", HypertensionIcon],
        ["Osteoporosis", OsteoIcon],
        ["Others", OthersIcon],
      ];
      return (
        <Scr scroll key={uStep}><Hdr />
          <div style={{ padding: "0 20px 24px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Select your comorbid conditions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 173px)", justifyContent: "center", gap: 12 }}>
              {conds.map(([c, iconSrc]) => {
                const on = (ud.comorbid || []).includes(c);
                return (
                  <div key={c} onClick={() => uu("comorbid", tog(ud.comorbid, c))} style={{ width: 173, height: 133, boxSizing: "border-box", background: "white", borderRadius: 16, padding: "20px 10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, border: on ? `2px solid ${C.brown}` : `1px solid ${C.border}`, cursor: "pointer" }}>
                    <img src={iconSrc} alt={c} style={{ width: 30, height: 30, display: "block" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
        </Scr>
      );
    }

    if (uStep === 8) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Current general health compared to one year ago</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Poor","Fair","Good","Very good","Excellent","Decline to answer"].map(o => <Radio key={o} label={o} on={ud.health === o} set={() => uu("health", o)} />)}
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 9) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Current smoker?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Yes","No","Decline to answer"].map(o => <Radio key={o} label={o} on={ud.smoker === o} set={() => uu("smoker", o)} />)}
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 10) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Drank alcohol at least once a month for 6 months or more</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Yes","No","Decline to answer"].map(o => <Radio key={o} label={o} on={ud.alcohol === o} set={() => uu("alcohol", o)} />)}
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 11) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>If yes, please indicate your frequency.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["2–3 times a week","Monthly or less","4 or more times a week","2–4 times a month"].map(o => <Radio key={o} label={o} on={ud.alcFreq === o} set={() => uu("alcFreq", o)} />)}
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 12) return (
      <Scr scroll key={uStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Indicate your BMI</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Underweight","Normal","Overweight","Obese","Decline to answer"].map(o => <Radio key={o} label={o} on={ud.bmi === o} set={() => uu("bmi", o)} />)}
          </div>
        </div>
        <div style={{ padding: "8px 20px 32px", display: "flex", justifyContent: "flex-end" }}><ArrowBtn onClick={next} /></div>
      </Scr>
    );

    if (uStep === 13) {
      const exs = [
        { key: "stren", label: "STRENUOUS EXERCISE (HEART BEATS RAPIDLY)", desc: "e.g., running, jogging, hockey, football, soccer, squash, basketball, cross country skiing, judo, roller skating, vigorous swimming, vigorous long distance bicycling" },
        { key: "mod",   label: "MODERATE EXERCISE (NOT EXHAUSTING)",       desc: "e.g., fast walking, baseball, tennis, easy bicycling, volleyball, badminton, easy swimming, alpine skiing, popular and folk dancing" },
        { key: "mild",  label: "MILD/LIGHT EXERCISE (MINIMAL EFFORT)",     desc: "e.g., yoga, archery, fishing from river bank, bowling, horseshoes, golf, snow–mobiling, easy walking" },
      ];
      return (
        <Scr scroll key={uStep}><Hdr />
          <div style={{ padding: "0 20px 24px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Godin Leisure – Time Exercise</h2>
            <p style={{ fontSize: 13, color: C.gray, marginBottom: 20 }}>Enter number of times per week</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {exs.map(ex => (
                <div key={ex.key} style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{ex.label}</p>
                    <p style={{ fontSize: 11, color: C.gray, lineHeight: 1.6 }}>{ex.desc}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginTop: 4 }}>
                    <button onClick={() => uu(ex.key, Math.max(0, (ud[ex.key] || 0) - 1))} style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${C.border}`, background: "white", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ minWidth: 22, textAlign: "center", fontSize: 16, fontWeight: 700 }}>{ud[ex.key] || 0}</span>
                    <button onClick={() => uu(ex.key, (ud[ex.key] || 0) + 1)} style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${C.border}`, background: "white", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
        </Scr>
      );
    }
  }

  /* ─── SYMPTOMS SURVEY INTRO ───────────────────────── */
  if (scr === "symSurveyIntro") return (
    <Scr style={{ alignItems: "center", justifyContent: "space-between", paddingTop: 60 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
        <img src={GrowBloom} alt="Rootin" style={{ width: 140, height: 140, objectFit: "contain" }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 28, marginBottom: 12, textAlign: "center" }}>Let's start your symptom survey.</h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, textAlign: "center", marginBottom: 8 }}>I'm here to support you.</p>
        <p style={{ fontSize: 13, color: C.gray }}>Your data is safe and stays with you.</p>
      </div>
      <div style={{ padding: "16px 24px 44px", width: "100%" }}>
        <Button color={C.brown} onClick={() => { setSStep(1); go("sSurvey"); }}>Confirm</Button>
      </div>
    </Scr>
  );

  /* ─── SYMPTOMS SURVEY ─────────────────────────────── */
  if (scr === "sSurvey") {
    const total = 9; // Joint Pain (1-6) → ISI page 1 (7) → ISI page 2 (8) → CVD (9)
    const fromHome = hist.includes("home");
    const next = () => {
      if (sStep < total) { setSStep(s => s + 1); return; }
      // Last step reached: snapshot this round's scores, advance growth stage.
      const { nextRound } = finishSymptomRound();
      if (isSetup) { go("charName"); return; } // very first run → plant the seed
      setDayCount(d => d + 1);
      setSStep(1);
      if (nextRound === 2) { go("growthSprout"); return; }       // 2nd survey → sprout
      if (nextRound >= 3) { go("growthCollection"); return; }    // 3rd+ → collection grows
      if (fromHome) { setHist([]); setScr("home"); return; }
      go("symDone");
    };
    const prev = () => sStep > 1 ? setSStep(s => s - 1) : back();
    const Hdr = () => (
      <div style={{ padding: "104px 20px 8px", flexShrink: 0, position: "sticky", top: 0, zIndex: 5, background: C.bg }}>
        <ProgBar v={sStep / total} />
        <BackBtn go={prev} />
      </div>
    );

    if (sStep === 1) {
      const opts = ["Diabetes","Cardiovascular Disease","Depression","Hypertension","Osteoporosis"];
      return (
        <Scr scroll key={sStep}><Hdr />
          <div style={{ padding: "0 20px 24px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>What symptoms would you like to track?</h2>
            <p style={{ fontSize: 13, color: C.gray, marginBottom: 20, lineHeight: 1.6 }}>Select the symptoms you experience most frequently, you can always add more later.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {opts.map(o => { const on = (sd.track || []).includes(o); return <Check key={o} label={o} on={on} toggle={() => su("track", tog(sd.track, o))} />; })}
            </div>
          </div>
          <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
        </Scr>
      );
    }

    if (sStep === 2) {
      const items = ["Work","Social activities","Leisure activities","Sleep","Mood","Concentration","Relations with others","Sexuality","Enjoyment of life","Overall quality of life"];
      return (
        <Scr scroll key={sStep}><Hdr />
          <div style={{ padding: "0 20px 24px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, lineHeight: 1.35 }}>Hot flash–Related Daily Interference Scale</h2>
            <p style={{ fontSize: 13, color: C.gray, marginBottom: 16, lineHeight: 1.6 }}>Choose a level from "Do not interfere" to "Completely interfere."</p>
            {items.map(item => <SliderRow key={item} label={item} value={sd[`hf_${item}`] || 0} set={v => su(`hf_${item}`, v)} />)}
          </div>
          <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
        </Scr>
      );
    }

    if (sStep === 3) {
      const items = ["Walking on a flat surface","Going up and down stairs","At night while in bed, pain disturbs your sleep","Sitting or lying","Standing upright"];
      return (
        <Scr scroll key={sStep}><Hdr />
          <div style={{ padding: "0 20px 24px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Joint Pain</h2>
            <p style={{ fontSize: 13, color: C.gray, marginBottom: 6, lineHeight: 1.6 }}>Think about the pain you felt in your hip and knee during the last 48 hours.</p>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>How much pain do you have?</p>
            {items.map(item => <PainGrid key={item} label={item} value={sd[`jp_${item}`]} set={v => su(`jp_${item}`, v)} />)}
          </div>
          <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
        </Scr>
      );
    }

    if (sStep === 4) return (
      <Scr scroll key={sStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Joint Pain</h2>
          <p style={{ fontSize: 13, color: C.gray, marginBottom: 18, lineHeight: 1.65 }}>Think about the stiffness (not pain) you have in your hip and knee during the last 48 hours.</p>
          <PainGrid label="How severe is your stiffness after first awakening in the morning?" value={sd.jp_stiff1} set={v => su("jp_stiff1", v)} />
          <PainGrid label="How severe is your stiffness after sitting, lying, or resting in the day?" value={sd.jp_stiff2} set={v => su("jp_stiff2", v)} />
        </div>
        <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
      </Scr>
    );

    if (sStep === 5) {
      const items = ["Descending stairs","Ascending stairs","Rising from sitting","Standing","Bending to the floor","Walking on flat surfaces","Getting in and out of a car, or on or off a bus"];
      return (
        <Scr scroll key={sStep}><Hdr />
          <div style={{ padding: "0 20px 24px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Joint Pain</h2>
            <p style={{ fontSize: 13, color: C.gray, marginBottom: 6, lineHeight: 1.65 }}>Think about the difficulty due to your hip and knee during the last 48 hours.</p>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>What degree of difficulty do you have?</p>
            {items.map(item => <PainGrid key={item} label={item} value={sd[`jpd_${item}`]} set={v => su(`jpd_${item}`, v)} />)}
          </div>
          <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
        </Scr>
      );
    }

    if (sStep === 6) {
      const items = ["Going shopping","Putting on your socks or stockings","Rising from the bed","Taking off your socks or stockings","Lying in bed","Getting in or out of the bath","Sitting","Getting on or off the toilet","Performance heavy domestic duties","Performing light domestic duties"];
      return (
        <Scr scroll key={sStep}><Hdr />
          <div style={{ padding: "0 20px 24px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Joint Pain</h2>
            <p style={{ fontSize: 13, color: C.gray, marginBottom: 6, lineHeight: 1.65 }}>Think about the difficulty due to your hip and knee during the last 48 hours.</p>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>What degree of difficulty do you have?</p>
            {items.map(item => <PainGrid key={item} label={item} value={sd[`jpd2_${item}`]} set={v => su(`jpd2_${item}`, v)} />)}
          </div>
          <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
        </Scr>
      );
    }

    // ISI page 1 — severity items + satisfaction. Margins follow the reference
    // screenshot exactly: 20,32,16,32,16,20,16,20,16,20,16,20,16,32
    if (sStep === 7) {
      const severityItems = [
        { k: "isi_fall",  label: "Difficulty falling asleep",     lvls: ["None","Mild","Moderate","Severe","Very"] },
        { k: "isi_stay",  label: "Difficulty staying asleep",     lvls: ["None","Mild","Moderate","Severe","Very"] },
        { k: "isi_early", label: "Problem waking up too early",   lvls: ["None","Mild","Moderate","Severe","Very"] },
        { k: "isi_sit",   label: "Sitting or lying",              lvls: ["None","Mild","Moderate","Severe","Extreme"] },
        { k: "isi_stand", label: "Standing upright",              lvls: ["None","Mild","Moderate","Severe","Extreme"] },
      ];
      return (
        <Scr scroll key={sStep}><Hdr />
          <div style={{ padding: "0 20px 20px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Insomnia Severity Index</h2>
            <p style={{ fontSize: 13, color: C.gray, marginBottom: 32, lineHeight: 1.6 }}>Please rate the current (i.e., last 2 weeks) SEVERITY of your insomnia problem(s).</p>
            {severityItems.map(({ k, label, lvls }, idx) => (
              <div key={k} style={{ marginBottom: idx === 0 ? 32 : 20 }}>
                <p style={{ fontSize: 13, color: C.dark, marginBottom: 16, lineHeight: 1.5 }}>{label}</p>
                <div style={{ display: "flex", gap: 5 }}>
                  {lvls.map((l, i) => (
                    <div key={l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.gray, textAlign: "center", lineHeight: 1.2 }}>{l}</span>
                      <div onClick={() => su(k, i)} style={{ width: "100%", aspectRatio: "1", maxWidth: 44, border: sd[k] === i ? `2px solid ${C.green}` : `1.5px solid ${C.border}`, borderRadius: 7, background: sd[k] === i ? C.green : "white", cursor: "pointer" }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>How SATISFIED/dissatisfied are you with your current sleep pattern?</p>
            <div style={{ background: "white", borderRadius: 14, padding: 14, marginBottom: 32 }}>
              <input type="range" min={0} max={4} value={sd.isi_sat ?? 2} onChange={e => su("isi_sat", +e.target.value)} style={{ width: "100%", accentColor: C.green, cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.gray, marginTop: 4 }}>
                <span>Very satisfied</span><span>Very dissatisfied</span>
              </div>
            </div>
          </div>
          <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
        </Scr>
      );
    }

    // ISI page 2 — interference / noticeability / worry + scoring guideline (ISI total shown live)
    if (sStep === 8) {
      const impactItems = [
        { k: "isi_int", label: "To what extent do you consider your sleep problem to INTERFERE with your daily functioning (e.g. daytime fatigue, ability to function at work/daily chores, concentration, memory, mood, etc.)." },
        { k: "isi_not", label: "How NOTICEABLE to others do you think your sleeping problem is in terms of impairing the quality of your life?" },
        { k: "isi_wor", label: "How WORRIED/distressed are you about your current sleep problem?" },
      ];
      const lvls = ["Not at all","A Little","Somewhat","Much","Very Much"];
      const isi = isiResult;
      return (
        <Scr scroll key={sStep}><Hdr />
          <div style={{ padding: "0 20px 32px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Insomnia Severity Index</h2>
            {impactItems.map(({ k, label }, idx) => (
              <div key={k} style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 13, color: C.dark, marginBottom: 16, lineHeight: 1.5 }}>{label}</p>
                <div style={{ display: "flex", gap: 5 }}>
                  {lvls.map((l, i) => (
                    <div key={l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.gray, textAlign: "center", lineHeight: 1.2 }}>{l}</span>
                      <div onClick={() => su(k, i)} style={{ width: "100%", aspectRatio: "1", maxWidth: 44, border: sd[k] === i ? `2px solid ${C.green}` : `1.5px solid ${C.border}`, borderRadius: 7, background: sd[k] === i ? C.green : "white", cursor: "pointer" }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* ISI has a validated 0–28 cutoff, so the result is surfaced right away */}
            <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1.5px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>ISI Total Score</p>
                <div style={{ background: isi.level.color, borderRadius: 100, padding: "4px 14px" }}>
                  <span style={{ color: "white", fontSize: 15, fontWeight: 700 }}>{isi.total} / 28</span>
                </div>
              </div>
              <div style={{ background: C.lightGray, borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${(isi.total / 28) * 100}%`, background: isi.level.color, borderRadius: 8, transition: "width .4s" }} />
              </div>
              <p style={{ fontSize: 13, color: isi.level.color, fontWeight: 600 }}>{isi.level.label}</p>
              <p style={{ fontSize: 11, color: C.gray, marginTop: 6, lineHeight: 1.6 }}>0–7: No significant insomnia · 8–14: Subthreshold · 15–21: Moderate · 22–28: Severe</p>
            </div>
          </div>
          <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
        </Scr>
      );
    }

    // CVD Risk Prediction (General CVD, BMI-based, D'Agostino 2008) — validated cutoff, shown live
    if (sStep === 9) return (
      <Scr scroll key={sStep}><Hdr />
        <div style={{ padding: "0 20px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>CVD Risk Prediction</h2>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Sex</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {["Man","Woman"].map(s => <Pill key={s} label={s} on={sd.cvdSex === s} click={() => su("cvdSex", s)} />)}
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Systolic Blood Pressure</p>
          <div style={{ marginBottom: 16 }}><TextInput placeholder="mmHg" value={sd.sbp || ""} onChange={v => su("sbp", v)} inputMode="numeric" numericOnly /></div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Age</p>
          <div style={{ marginBottom: 20 }}><TextInput placeholder="Years" value={sd.cvdAge || ""} onChange={v => su("cvdAge", v)} inputMode="numeric" numericOnly /></div>
          {[{label:"Treatment for Hypertension",key:"cvdHtn"},{label:"Smoking",key:"cvdSmk"},{label:"Diabetes",key:"cvdDiab"}].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{f.label}</p>
              <div style={{ display: "flex", gap: 10 }}>
                {["Yes","No"].map(o => <Pill key={o} label={o} on={sd[f.key] === o} click={() => su(f.key, o)} />)}
              </div>
            </div>
          ))}
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Body Mass Index</p>
          <div style={{ marginBottom: 20 }}><TextInput placeholder="kg/m²" value={sd.bmiVal || ""} onChange={v => su("bmiVal", v)} inputMode="numeric" numericOnly /></div>
          {cvdResult.valid && (
            <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1.5px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>10-Year CVD Risk</p>
                <div style={{ background: cvdResult.level.color, borderRadius: 100, padding: "4px 14px" }}>
                  <span style={{ color: "white", fontSize: 15, fontWeight: 700 }}>{cvdResult.capped ? ">30" : cvdResult.pct.toFixed(1)}%</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: cvdResult.level.color, fontWeight: 600 }}>{cvdResult.level.label}</p>
              <p style={{ fontSize: 11, color: C.gray, marginTop: 6, lineHeight: 1.6 }}>Framingham General CVD (BMI-based) equation · &lt;10%: Low · 10–20%: Moderate · ≥20%: High</p>
            </div>
          )}
        </div>
        <div style={{ padding: "0 20px 40px" }}><Button color={C.green} onClick={next}>Next</Button></div>
      </Scr>
    );
  }

  /* ─── CHARACTER NAME ──────────────────────────────── */
  if (scr === "charName") {
    const names = ["Sprout","Bloom","Petal","Leaf","Fern","Clover","Moss","Sage","Willow","Ivy","Cedar","Thistle"];
    return (
      <Scr style={{ alignItems: "center", justifyContent: "space-between", paddingTop: 60 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>You planted a seed!</h2>
          <p style={{ fontSize: 14, color: C.gray, marginBottom: 28, textAlign: "center" }}>Name your little sprout!</p>
          <img src={GrowSeed} alt="Seed planted" style={{ width: 160, height: 160, objectFit: "contain" }} />
          <div style={{ width: "100%", marginTop: 28, marginBottom: 14 }}><TextInput placeholder="Name" value={inp} onChange={setInp} /></div>
          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <GhostBtn style={{ flex: 1 }} onClick={() => { const n = (ni + 1) % names.length; setNi(n); setInp(names[n]); }}>Shuffle</GhostBtn>
            <Button style={{ flex: 1 }} color={C.green} onClick={() => setCharName(inp)}>Save</Button>
          </div>
        </div>
        <div style={{ padding: "16px 24px 44px", width: "100%" }}>
          <Button color={C.green} onClick={() => go("charAdapt")}>Next</Button>
        </div>
      </Scr>
    );
  }

  /* ─── CHARACTER ADAPT ─────────────────────────────── */
  if (scr === "charAdapt") return (
    <Scr style={{ alignItems: "center", justifyContent: "space-between", paddingTop: 60 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 32, lineHeight: 1.4 }}>Let Rootin take root in your routine.</h2>
        <img src={GrowSeed} alt="Seed planted" style={{ width: 170, height: 170, objectFit: "contain" }} />
        <p style={{ fontSize: 14, color: C.gray, marginTop: 28, textAlign: "center" }}>The more you track, the stronger it grows with you.</p>
      </div>
      <div style={{ padding: "16px 24px 44px", width: "100%" }}>
        <Button color={C.green} onClick={() => { setIsSetup(false); setDayCount(1); go("symDone"); }}>Next</Button>
      </div>
    </Scr>
  );

  /* ─── GROWTH: SPROUT (2nd completed survey) ───────── */
  if (scr === "growthSprout") return (
    <Scr style={{ alignItems: "center", justifyContent: "space-between", paddingTop: 60 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>{charName} sprouted!</h2>
        <p style={{ fontSize: 14, color: C.gray, marginBottom: 28, textAlign: "center" }}>Two surveys in — your routine is taking root.</p>
        <img src={GrowSprout} alt="Sprouted" style={{ width: 170, height: 170, objectFit: "contain" }} />
      </div>
      <div style={{ padding: "16px 24px 44px", width: "100%" }}>
        <Button color={C.green} onClick={() => { setSStep(1); setHist([]); setScr("home"); }}>Next</Button>
      </div>
    </Scr>
  );

  /* ─── GROWTH: COLLECTION (3rd+ completed survey) ──── */
  if (scr === "growthCollection") {
    const justAdded = collection[collection.length - 1];
    const img = justAdded !== undefined ? VAR_IMAGES[justAdded] : RootinGood1;
    return (
      <Scr style={{ alignItems: "center", justifyContent: "space-between", paddingTop: 60 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>A new Rootin joined your collection!</h2>
          <p style={{ fontSize: 14, color: C.gray, marginBottom: 28, textAlign: "center" }}>Keep checking in to collect them all.</p>
          <img src={img} alt="New Rootin" style={{ width: 170, height: 170, objectFit: "contain" }} />
          <p style={{ fontSize: 13, color: C.gray, marginTop: 16 }}>{collection.length} of {VAR_IMAGES.length} collected</p>
        </div>
        <div style={{ padding: "16px 24px 44px", width: "100%", display: "flex", gap: 12 }}>
          <GhostBtn style={{ flex: 1 }} onClick={() => { setSStep(1); setHist([]); go("rootinColl"); }}>View Collection</GhostBtn>
          <Button style={{ flex: 1 }} color={C.green} onClick={() => { setSStep(1); setHist([]); setScr("home"); }}>Next</Button>
        </div>
      </Scr>
    );
  }

  /* ─── HOME ────────────────────────────────────────── */
  if (scr === "home") return (
    <ScrWithNav activeTab={tab} navGo={navTab}>
      <div style={{ padding: "104px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 16 }}>
          {/* ✅ UserIcon, DataIcon: img → SVG 컴포넌트 */}
          <button onClick={() => go("myPage")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
            <img src={UserIcon} alt="" style={{ width: 24, height: 24, display: "block", pointerEvents: "none"}} />
          </button>
          <button onClick={() => go("moments")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
            <img src={DataIcon} alt="" style={{ width: 24, height: 24, display: "block", pointerEvents: "none" }} />
          </button>
        </div>
        {/* ✅ SettingsIcon: img → SVG 컴포넌트 */}
        <button onClick={() => go("settings")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
          <img src={SettingsIcon} alt="" style={{ width: 24, height: 24, display: "block", pointerEvents: "none" }} />
        </button>
      </div>
      <div style={{ padding: "0 20px 14px" }}>
        <p style={{ fontSize: 13, color: C.gray }}>Today, 28 August</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>Health Check-in</h2>
      </div>
      <div style={{ margin: "0 20px 16px", background: "white", borderRadius: 22, padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
        <img src={growthImage(dayCount, latestMood, history.length)} alt="Rootin" style={{ width: 256, height: 256, objectFit: "contain" }} />
        <p style={{ fontSize: 12, color: C.gray, marginTop: 8, textTransform: "capitalize" }}>{growthStage} · {history.length} check-in{history.length === 1 ? "" : "s"}</p>
      </div>
      <div style={{ margin: "0 20px 12px" }}>
        <div onClick={() => { setSStep(1); go("symSurveyIntro"); }} style={{ background: "white", borderRadius: 16, padding: "18px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${C.border}`, cursor: "pointer" }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Daily Health Check-in</p>
            <p style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>{lastRecord ? "Completed today" : "0/1"}</p>
          </div>
          <ChevronRight />
        </div>
      </div>
      <div style={{ margin: "0 20px 20px" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
          {lastRecord ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.dark }} />
                <span style={{ fontSize: 15 }}>Insomnia (ISI)  <strong>{lastRecord.isi.total}/28</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.gray }} />
                <span style={{ fontSize: 13, color: C.gray }}>Day {lastRecord.day}  <strong style={{ color: C.dark }}>{lastRecord.isi.level.label}</strong></span>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: C.gray }}>No check-ins yet — complete a survey to see results here.</p>
          )}
        </div>
      </div>
    </ScrWithNav>
  );

  /* ─── SYMPTOM LOG COMPLETE ────────────────────────── */
  if (scr === "symDone") return (
    <Scr style={{ alignItems: "center" }}>
      <button onClick={() => { setHist([]); setScr("home"); }} style={{ position: "absolute", top: 104, right: 24, background: "transparent", border: "none", padding: 0, width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><img src={XIcon} alt="" style={{ width: 20, height: 20 }} /></button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "160px 20px 0", width: "100%" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 44, textAlign: "center" }}>DAY {dayCount} Rooted!</h2>
        <div style={{ width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 44 }}>
          <img src={growthImage(dayCount, latestMood, history.length)} alt="Rootin" style={{ width: 140, height: 140, objectFit: "contain" }} />
        </div>
        <p style={{ fontSize: 14, color: C.gray, marginBottom: 44, textAlign: "center", lineHeight: 1.7 }}>One small root today.<br />Let's grow again tomorrow.</p>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          {lastRecord && [
            { l: "Insomnia (ISI)", v: `${lastRecord.isi.total}/28`, s: lastRecord.isi.level.label },
            lastRecord.cvd.valid
              ? { l: "CVD 10-yr risk", v: `${lastRecord.cvd.capped ? ">30" : lastRecord.cvd.pct.toFixed(1)}%`, s: lastRecord.cvd.level.label }
              : { l: "Hot flash interference", v: `${lastRecord.hotflash.avg.toFixed(1)}/10`, s: lastRecord.hotflash.avg >= 5 ? "High interference" : "Low–moderate" },
          ].map((e, i) => (
            <div key={i} style={{ height: 112, boxSizing: "border-box", background: "white", borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#555", flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 500 }}>{e.l}&nbsp;&nbsp;<strong>{e.v}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#999", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.gray }}>Day {lastRecord.day}&nbsp;&nbsp;<strong style={{ color: C.dark }}>{e.s}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px 20px 44px", width: "100%" }}>
        <Button color={C.dark} onClick={() => { setHist([]); setScr("home"); }}>Next</Button>
      </div>
    </Scr>
  );

  /* ─── SETTINGS ────────────────────────────────────── */
  if (scr === "settings") return (
    <Scr scroll>
      <div style={{ padding: "104px 20px 12px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <BackBtn go={back} />
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h2>
      </div>
      <div style={{ padding: "0 20px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 600 }}>Notification</p>
            <p style={{ fontSize: 13, color: C.gray, marginTop: 3 }}>Daily reminders and updates</p>
          </div>
          <Tog on={notifs.main} flip={() => setNotifs(n => ({ ...n, main: !n.main }))} />
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, marginTop: 24, marginBottom: 16 }}>Reminder</p>
        {[{k:"med",label:"Medication"},{k:"doc",label:"Doctoral Appointment"}].map(r => (
          <div key={r.k} onClick={() => { setRemType(r.label); go("settingDetail"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{r.label}</p>
              <p style={{ fontSize: 13, color: C.gray, marginTop: 3 }}>Daily reminders and updates</p>
            </div>
            <Tog on={notifs[r.k]} flip={() => setNotifs(n => ({ ...n, [r.k]: !n[r.k] }))} />
          </div>
        ))}
        <div style={{ marginTop: 32 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.gray, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Prototype Testing</p>
          <div style={{ background: "white", borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div onClick={() => { setIsSetup(true); setSlide(0); setAgreed(false); setCharName("Sprout"); setInp("Sprout"); setNi(0); setUStep(1); setSStep(1); setDayCount(1); setRound(0); setGrowthStage("seed"); setCollection([]); setHistory([]); setUd({}); setSd({}); setHist([]); setScr("splash"); }} style={{ padding: "18px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600 }}>Simulate First Run</p>
                <p style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>Restart from Splash → Onboarding (seed planted)</p>
              </div>
              <span style={{ fontSize: 18, color: C.gray }}>↺</span>
            </div>
            <div onClick={() => { setIsSetup(false); setSStep(1); setSd({}); setHist([]); setScr("symSurveyIntro"); }} style={{ padding: "18px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600 }}>Simulate Re-opening</p>
                <p style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>App re-open → Symptom Survey (round {round + 1})</p>
              </div>
              <span style={{ fontSize: 18, color: C.gray }}>▶</span>
            </div>
            <div onClick={() => { setRound(0); setGrowthStage("seed"); setCollection([]); setHistory([]); setSd({}); setHist([]); }} style={{ padding: "18px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600 }}>Reset Growth &amp; History</p>
                <p style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>Clear in-session check-ins, keep onboarding</p>
              </div>
              <span style={{ fontSize: 18, color: C.gray, display: "flex" }}><img src={XIcon} alt="" style={{ width: 18, height: 18 }} /></span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "24px 20px 44px" }}>
        <Button color={C.dark} onClick={() => {}}>＋  Add Reminder</Button>
      </div>
    </Scr>
  );

  if (scr === "settingDetail") {
    const key = remType === "Medication" ? "med" : "doc";
    const times = ["6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM"];
    const repeats = ["Daily","Weekdays","Weekends","Weekly","Monthly"];
    const reminderTexts = remType === "Medication"
      ? ["Take your Anastrozole","Time for your medication","Don't forget your AI medication","Medication reminder"]
      : ["Doctor appointment today","Upcoming appointment check","Schedule your next visit","Appointment reminder"];
    return (
      <Scr scroll>
        <div style={{ padding: "104px 20px 12px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <BackBtn go={back} />
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{remType}</h2>
        </div>
        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Active</p>
              <p style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>Enable this reminder</p>
            </div>
            <Tog on={remOn[key]} flip={() => setRemOn(r => ({ ...r, [key]: !r[key] }))} />
          </div>
          <div style={{ padding: "20px 0", borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Reminder Text</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reminderTexts.map(t => (
                <div key={t} onClick={() => setReminderText(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${reminderText === t ? C.green : C.border}`, background: reminderText === t ? `${C.green}0d` : "white", cursor: "pointer" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${reminderText === t ? C.green : C.border}`, background: reminderText === t ? C.green : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {reminderText === t && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                  </div>
                  <span style={{ fontSize: 14, color: reminderText === t ? C.green : C.dark, fontWeight: reminderText === t ? 600 : 400 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "20px 0", borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Time</p>
            <Dropdown label="Select time" value={remTime[key]} onChange={v => setRemTime(r => ({ ...r, [key]: v }))} opts={times} />
          </div>
          <div style={{ padding: "20px 0", borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Repeats</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {repeats.map(r => (
                <button key={r} onClick={() => setRemRepeat(rp => ({ ...rp, [key]: r }))} style={{ padding: "10px 18px", borderRadius: 100, border: `1.5px solid ${remRepeat[key] === r ? C.green : C.border}`, background: remRepeat[key] === r ? C.green : "white", color: remRepeat[key] === r ? "white" : C.dark, fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>{r}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "28px 20px 44px" }}>
          <button onMouseDown={() => setBtnActive(true)} onMouseUp={() => setBtnActive(false)} onMouseLeave={() => setBtnActive(false)} onTouchStart={() => setBtnActive(true)} onTouchEnd={() => setBtnActive(false)} onClick={() => {}} style={{ width: "100%", padding: "16px 20px", borderRadius: 100, border: `1.5px dashed ${C.dark}`, background: btnActive ? C.dark : "transparent", color: btnActive ? "white" : C.dark, fontSize: 17, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
            Add Reminder
          </button>
        </div>
      </Scr>
    );
  }

  /* ─── MY PAGE ─────────────────────────────────────── */
  if (scr === "myPage") return (
    <Scr scroll>
      <div style={{ padding: "104px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BackBtn go={back} />
        <button onClick={() => go("myData")} style={{ background: C.lightGray, border: "none", borderRadius: 10, padding: "7px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Edit</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px 20px" }}>
        <div style={{ width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <img src={GrowBloom} alt="Rootin" style={{ width: 140, height: 140, objectFit: "contain" }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Alex</h2>
        <p style={{ fontSize: 13, color: C.gray, marginBottom: 18 }}>Joined on 28 August 2025</p>
        <Button color={C.dark} onClick={() => go("rootinColl")} style={{ width: "auto", padding: "12px 32px" }}>Rootin Collection</Button>
      </div>
      <div style={{ padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
        {["Hot flash","Joint Pain","Insomnia","CVD Risk","General Health"].map(s => (
          <div key={s} onClick={() => setExpand(e => ({ ...e, [s]: !e[s] }))} style={{ background: "white", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", cursor: "pointer" }}>
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>{s}</span>
              <img src={ArrowDown} alt="" style={{ width: 16, height: 16, transform: expand[s] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />
            </div>
            {expand[s] && (
              <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 13, color: C.gray, marginTop: 12 }}>No recent entries for {s}. Complete your daily check-in to track this symptom.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Scr>
  );

  /* ─── ROOTIN COLLECTION ───────────────────────────── */
  if (scr === "rootinColl") {
    const chars = VAR_IMAGES.map((img, i) => ({ name: `Rootin ${i + 1}`, img, unlocked: collection.includes(i) }));
    return (
      <Scr scroll>
        <div style={{ padding: "104px 20px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <BackBtn go={back} />
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Rootin Collection</h2>
        </div>
        <p style={{ fontSize: 13, color: C.gray, paddingLeft: 20, marginBottom: 16 }}>{collection.length}/{VAR_IMAGES.length} unlocked</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px 40px" }}>
          {chars.map((c, i) => (
            <div key={i} onClick={() => { if (c.unlocked) { setSelectedChar(i); go("rootinDetail"); } }} style={{ background: "white", borderRadius: 16, padding: "22px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, border: `1px solid ${C.border}`, cursor: c.unlocked ? "pointer" : "default", opacity: c.unlocked ? 1 : 0.4 }}>
              {c.img
                ? <img src={c.img} alt={c.name} style={{ width: 80, height: 80, objectFit: "contain", filter: c.unlocked ? "none" : "grayscale(100%)" }} />
                : <div style={{ width: 80, height: 80, borderRadius: 12, background: C.lightGray }} />
              }
              <p style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</p>
            </div>
          ))}
        </div>
      </Scr>
    );
  }

  /* ─── ROOTIN DETAIL ───────────────────────────────── */
  if (scr === "rootinDetail") {
    const varImg = VAR_IMAGES[selectedChar] || VAR_IMAGES[0];
    return (
      <Scr scroll>
        <div style={{ padding: "104px 20px 0" }}>
          <BackBtn go={back} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "88px 24px 48px", textAlign: "center" }}>
          <img src={varImg} alt="Rootin character" style={{ width: 256, height: 256, objectFit: "contain" }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 88, marginBottom: 20 }}>Rootin {selectedChar + 1}</h2>
          <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.75 }}>A Rootin born from your balanced health.<br />Its bright leaves glow with vitality, reflecting the strength of your routine.</p>
        </div>
      </Scr>
    );
  }

  if (scr === "myData") return (
    <Scr scroll>
      <div style={{ padding: "104px 20px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <BackBtn go={back} />
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>My Data</h2>
      </div>
      <div style={{ padding: "0 20px 48px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div><p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Age</p><Dropdown label="18–30" value={ud.ageRange || ""} onChange={v => uu("ageRange", v)} opts={["18–30","31–40","41–50","51–60","61–70","71+"]} /></div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Gender</p>
          <div style={{ display: "flex", gap: 10 }}>
            {["Male","Female","Other"].map(g => <Pill key={g} label={g} on={ud.gender === g} click={() => uu("gender", g)} />)}
          </div>
        </div>
        <div><p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>AI Medication</p><TextInput placeholder="Name" value={ud.aiMed || ""} onChange={v => uu("aiMed", v)} /></div>
        <div><p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Treatment Duration</p><Dropdown label="3–6 months" value={ud.txDur || ""} onChange={v => uu("txDur", v)} opts={["< 3 months","3–6 months","6–12 months","1–2 years","> 2 years"]} /></div>
        <div><p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>BMI</p><Dropdown label="Normal" value={ud.bmiRange || ""} onChange={v => uu("bmiRange", v)} opts={["Underweight","Normal","Overweight","Obese"]} /></div>
      </div>
    </Scr>
  );

  /* ─── MOMENTS ─────────────────────────────────────── */
  if (scr === "moments") {
    const filters = ["Hot flash","Joint Pain","Insomnia","CVD Risk"];
    const entriesMap = {
      "Hot flash":  history.map(r => ({ d: `Day ${r.day}`, n: r.day, l: "Hot flash interference", v: r.hotflash.avg.toFixed(1), s: r.hotflash.avg >= 5 ? "High interference" : "Low–moderate" })),
      "Joint Pain": history.map(r => ({ d: `Day ${r.day}`, n: r.day, l: "Joint pain (avg)", v: r.joint.avg.toFixed(1), s: r.joint.avg >= 2 ? "Notable" : "Mild" })),
      "Insomnia":   history.map(r => ({ d: `Day ${r.day}`, n: r.day, l: "ISI total", v: `${r.isi.total}/28`, s: r.isi.level.label })),
      "CVD Risk":   history.filter(r => r.cvd.valid).map(r => ({ d: `Day ${r.day}`, n: r.day, l: "10-yr CVD risk", v: `${r.cvd.capped ? ">30" : r.cvd.pct.toFixed(1)}%`, s: r.cvd.level.label })),
    };
    const entries = (entriesMap[af] || []).slice().reverse();
    return (
      <ScrWithNav activeTab={tab} navGo={navTab}>
        <div style={{ padding: "104px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Moments</h2>
          <button style={{ background: C.lightGray, border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: C.dark }}>Export ↑</button>
        </div>
        {/* ✅ ArrowLeft, ArrowRight: img → SVG 컴포넌트 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
            <img src={ArrowLeft} alt="" style={{ width: 20, height: 20, opacity: 0.5, pointerEvents: "none" }} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Today</span>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
            <img src={ArrowRight} alt="" style={{ width: 20, height: 20, opacity: 0.5, pointerEvents: "none" }} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "0 20px 16px", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setAf(f)} style={{ padding: "9px 16px", borderRadius: 100, border: "none", flexShrink: 0, background: af === f ? C.dark : C.lightGray, color: af === f ? "white" : C.dark, fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>{f}</button>
          ))}
        </div>
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.gray, fontSize: 14 }}>No entries yet for {af}</div>
          ) : entries.map((e, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, padding: 16, display: "flex", gap: 14, border: `1px solid ${C.border}` }}>
              <div style={{ flexShrink: 0, textAlign: "center", minWidth: 32 }}>
                <p style={{ fontSize: 11, color: C.gray }}>{e.d}</p>
                <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>{e.n}</p>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.dark, flexShrink: 0 }} />
                  <span style={{ fontSize: 14 }}>{e.l}  <strong>{e.v}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.gray, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.gray }}><strong style={{ color: C.dark }}>{e.s}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrWithNav>
    );
  }

  /* ─── CALENDAR ────────────────────────────────────── */
  if (scr === "calendar") {
    const days = ["S","M","T","W","T","F","S"];
    const cells = Array(3 + 31).fill(null).map((_, i) => i >= 3 ? i - 3 + 1 : null);
    while (cells.length % 7 !== 0) cells.push(null);
    // Map each completed check-in to "today minus N days" so the calendar fills in
    // live as the person repeats the survey in this session (no data is persisted).
    const today = 28;
    const moodByDay = {};
    history.forEach((r, i) => {
      const dayOfMonth = today - (history.length - 1 - i);
      if (dayOfMonth > 0) moodByDay[dayOfMonth] = r.mood;
    });
    const greenDays = Object.keys(moodByDay).filter(d => moodByDay[d] === "good").map(Number);
    const redDays = Object.keys(moodByDay).filter(d => moodByDay[d] === "poor").map(Number);
    const amberDays = Object.keys(moodByDay).filter(d => moodByDay[d] === "moderate").map(Number);
    return (
      <ScrWithNav activeTab={tab} navGo={navTab}>
        <div style={{ padding: "104px 20px 0 32px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>Calendar</h2>
          <p style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>See your progress</p>
        </div>
        <div style={{ width: 362, height: 524, margin: "32px auto 20px", background: "white", borderRadius: 22, padding: "18px 16px 24px", border: `1px solid ${C.border}`, boxSizing: "border-box", overflow: "hidden" }}>
          {/* ✅ ArrowLeft, ArrowRight: img → SVG 컴포넌트 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
              <img src={ArrowLeft} alt="" style={{ width: 20, height: 20, opacity: 0.5, pointerEvents: "none" }} />
            </button>
            <p style={{ fontSize: 15, fontWeight: 600 }}>October 2025</p>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
              <img src={ArrowRight} alt="" style={{ width: 20, height: 20, opacity: 0.5, pointerEvents: "none" }} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 10 }}>
            {days.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 12, color: C.gray, fontWeight: 500, padding: "4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", rowGap: 64, columnGap: 5 }}>
            {cells.map((day, i) => {
              const isG = day && greenDays.includes(day), isR = day && redDays.includes(day), isA = day && amberDays.includes(day);
              const bg = isG ? C.green : isR ? C.red : isA ? "#C98A2E" : day ? C.lightGray : "transparent";
              return <div key={i} style={{ width: 30, height: 30, justifySelf: "center", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: bg, fontSize: 12, color: (isG || isR || isA) ? "white" : day ? C.dark : "transparent", fontWeight: day ? 500 : 400 }}>{day || ""}</div>;
            })}
          </div>
        </div>
      </ScrWithNav>
    );
  }

  /* ─── TRENDS ──────────────────────────────────────── */
  if (scr === "trends") {
    const W = 306, H = 170;
    // Real per-round values, scaled onto the same 0–H axis: ISI (0–28), hot flash
    // interference (0–10 → ×2.8), CVD risk (0–30% → ×5.67). No data persists, so
    // this only ever reflects the check-ins completed in this session.
    const rounds = history.length ? history : [];
    const toXY = (vals, w) => {
      if (!vals.length) return [[w / 2, H]];
      const step = vals.length > 1 ? (w - 28) / (vals.length - 1) : 0;
      return vals.map((v, i) => [14 + i * step, Math.max(0, H - v)]);
    };
    const isiVals = rounds.map(r => H * (r.isi.total / 28));
    const hfVals = rounds.map(r => H * (r.hotflash.avg / 10));
    const cvdVals = rounds.map(r => r.cvd.valid ? H * (Math.min(r.cvd.pct, 30) / 30) : 0);
    const labels = rounds.map(r => `Day ${r.day}`);
    const avgIsi = rounds.length ? (rounds.reduce((s, r) => s + r.isi.total, 0) / rounds.length).toFixed(1) : "–";
    const d = {
      p1: toXY(isiVals, W), p2: toXY(hfVals, W), p3: toXY(cvdVals, W),
      avg: avgIsi, total: String(rounds.length),
      labels: labels.length ? labels : [""], bw: 10, gap: 3,
    };
    const mkPath = pts => { let p = `M ${pts[0][0]} ${pts[0][1]}`; for (let i = 1; i < pts.length; i++) { const t = 0.35, dx = pts[i][0]-pts[i-1][0]; p += ` C ${pts[i-1][0]+dx*t} ${pts[i-1][1]}, ${pts[i][0]-dx*t} ${pts[i][1]}, ${pts[i][0]} ${pts[i][1]}`; } return p; };
    const PillToggle = ({ opts, value, set }) => (
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {opts.map(o => <button key={o} onClick={() => set(o)} style={{ flex: 1, padding: "12px 0", borderRadius: 100, background: value===o ? "#3A3A3A" : C.lightGray, color: value===o ? "white" : C.dark, border: "none", fontSize: 14, fontWeight: value===o ? 600 : 400, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>{o}</button>)}
      </div>
    );
    const gridYs = [0, Math.round(H*0.33), Math.round(H*0.66), H];
    return (
      <ScrWithNav activeTab={tab} navGo={navTab}>
        <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
        <div style={{ padding: "104px 20px 14px 32px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Symptom Trends</h2>
        </div>
        <div style={{ padding: "0 15.5px 20px" }}>
          <PillToggle opts={["Week","Month","Quarter"]} value={period} set={setPeriod} />
          <PillToggle opts={["Line Chart","Bar Chart"]} value={cType} set={setCType} />
          <div style={{ width: 362, height: 308, background: "white", borderRadius: 18, padding: 28, border: `1px solid ${C.border}`, marginBottom: 14, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {!rounds.length && (
              <p style={{ fontSize: 13, color: C.gray, textAlign: "center", marginTop: 70 }}>Complete a symptom survey to see your trends here.</p>
            )}
            {!!rounds.length && <svg key={`${period}-${cType}`} width={W} height={208} viewBox={`0 0 ${W} ${H + 20}`} style={{ display: "block", overflow: "visible", animation: "fadeIn .35s ease-in" }}>
              {gridYs.map(y => <line key={y} x1="0" y1={y} x2={W} y2={y} stroke={C.border} strokeWidth="0.7" strokeDasharray="4 3"/>)}
              {cType === "Line Chart" ? (<>
                <path d={mkPath(d.p1)} fill="none" stroke={C.dark}  strokeWidth="2.2" strokeLinecap="round"/>
                <path d={mkPath(d.p2)} fill="none" stroke={C.brown} strokeWidth="2.2" strokeLinecap="round"/>
                <path d={mkPath(d.p3)} fill="none" stroke={C.gray}  strokeWidth="2.2" strokeLinecap="round"/>
                {d.p1.map((pt,i) => <circle key={i} cx={pt[0]} cy={pt[1]} r={period==="Quarter"?4.5:3} fill={C.dark}/>)}
                {d.p2.map((pt,i) => <circle key={i} cx={pt[0]} cy={pt[1]} r={period==="Quarter"?4.5:3} fill={C.brown}/>)}
              </>) : (<>
                {d.p1.map((pt,i) => { const bw=d.bw,g=d.gap,x1=pt[0]-bw*1.5-g,x2=pt[0]-bw*0.5,x3=pt[0]+bw*0.5+g; return (<g key={i}><rect x={x1} y={pt[1]} width={bw} height={H-pt[1]} fill={C.dark} rx="3" opacity="0.9"/><rect x={x2} y={d.p2[i][1]} width={bw} height={H-d.p2[i][1]} fill={C.brown} rx="3" opacity="0.9"/><rect x={x3} y={d.p3[i][1]} width={bw} height={H-d.p3[i][1]} fill={C.gray} rx="3" opacity="0.9"/></g>); })}
              </>)}
              {d.labels.map((l,i) => <text key={i} x={d.p1[i][0]} y={H+16} textAnchor="middle" fontSize="9" fill={C.gray}>{l}</text>)}
            </svg>}
            <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
              {[[C.dark,"Insomnia (ISI)"],[C.brown,"Hot flash"],[C.gray,"CVD risk"]].map(([color,label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 22, height: 3, background: color, borderRadius: 2 }}/>
                  <span style={{ fontSize: 11, color: C.gray }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[["Average ISI Score", d.avg],["Check-ins", d.total]].map(([label,value]) => (
              <div key={label} style={{ flex: 1, background: "white", borderRadius: 16, padding: "18px 16px", border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 13, color: C.gray, marginBottom: 8 }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: C.dark }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrWithNav>
    );
  }

  /* ─── HELPFUL INFO ────────────────────────────────── */
  if (scr === "helpfulInfo") return (
    <ScrWithNav activeTab={tab} navGo={navTab}>
      <div style={{ padding: "104px 20px 32px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Helpful Information</h2>
        <p style={{ fontSize: 14, color: C.gray }}>Discover helpful information to support your journey.</p>
      </div>
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[{title:"Basic Information",sub:"Learn the basics about Aromatase Inhibitors and related symptoms.",dest:"basicInfo"},{title:"Symptom Management",sub:"Learn ways to manage your symptoms.",dest:"symptomMgmt"}].map(item => (
          <div key={item.title} onClick={() => go(item.dest)} style={{ background: "white", borderRadius: 18, padding: 24, border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.6 }}>{item.sub}</p>
            </div>
            <ChevronRight />
          </div>
        ))}
      </div>
    </ScrWithNav>
  );

  /* ─── BASIC INFO ──────────────────────────────────── */
  if (scr === "basicInfo") return (
    <Scr scroll>
      <div style={{ height: 62, flexShrink: 0, position: "sticky", top: 0, zIndex: 20, background: C.bg }} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ height: 382, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={GrowBloom} alt="Rootin" style={{ width: 270, height: 270, objectFit: "contain" }} />
        </div>
        <BackBtn go={back} overlay />
      </div>
      <div style={{ padding: "20px 20px 60px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Basic Information</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[{l:"What is Breast Cancer?",d:"bcSummary"},{l:"What is Aromatase Inhibitors?",d:"aiSummary"},{l:"Symptoms",d:"sympGrid"}].map(item => (
            <div key={item.l} onClick={() => go(item.d)} style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15 }}>{item.l}</span>
              <ChevronRight />
            </div>
          ))}
        </div>
      </div>
    </Scr>
  );

  /* ─── BREAST CANCER SUMMARY ───────────────────────── */
  if (scr === "bcSummary") return (
    <Scr scroll>
      <div style={{ height: 62, flexShrink: 0, position: "sticky", top: 0, zIndex: 20, background: C.bg }} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ height: 359, overflow: "hidden" }}>
          <img src={BreastCancerIllustration} alt="Breast Cancer" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 80%", display: "block" }} />
        </div>
        <BackBtn go={back} overlay />
      </div>
      <div style={{ padding: "20px 22px 32px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, lineHeight: 1.35 }}>What is Breast Cancer?</h1>
        <p style={{ fontSize: 14, lineHeight: 1.85, color: "#2a2a2a", marginBottom: 14 }}>Breast cancer is one of the most common cancers worldwide and a leading cause of cancer-related death among women. In 2024, about 310,720 new cases were diagnosed in the U.S., with approximately 42,250 deaths reported.¹</p>
        <p style={{ fontSize: 14, lineHeight: 1.85, color: "#2a2a2a" }}>Breast cancer begins when cells in the breast grow uncontrollably. Many breast cancers are hormone receptor–positive (HR+), meaning their growth is driven by estrogen or progesterone.</p>
      </div>
      <div style={{ padding: "0 22px 48px" }}>
        <Button color={C.brown} onClick={() => go("articleBC")}>Read More</Button>
      </div>
    </Scr>
  );

  /* ─── AI SUMMARY ──────────────────────────────────── */
  if (scr === "aiSummary") return (
    <Scr scroll>
      <div style={{ height: 62, flexShrink: 0, position: "sticky", top: 0, zIndex: 20, background: C.bg }} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ height: 359, overflow: "hidden" }}>
          <img src={AIIllustration} alt="Aromatase Inhibitor" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <BackBtn go={back} overlay />
      </div>
      <div style={{ padding: "20px 22px 32px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, lineHeight: 1.35 }}>What is an Aromatase Inhibitor?</h1>
        <p style={{ fontSize: 14, lineHeight: 1.85, color: "#2a2a2a", marginBottom: 14 }}>Aromatase is an enzyme that produces estrogen by converting androgens in tissues such as fat, muscle, and breast tissue.⁹ After menopause, aromatase becomes the main source of estrogen in the body.</p>
        <p style={{ fontSize: 14, lineHeight: 1.85, color: "#2a2a2a" }}>Aromatase inhibitors (AIs) lower estrogen levels by blocking this enzyme, slowing or stopping the growth of hormone-sensitive breast cancer cells.</p>
      </div>
      <div style={{ padding: "0 22px 48px" }}>
        <Button color={C.brown} onClick={() => go("articleAI")}>Read More</Button>
      </div>
    </Scr>
  );

  /* ─── ARTICLE: BREAST CANCER ──────────────────────── */
  if (scr === "articleBC") return (
    <Scr scroll>
      <div style={{ height: 62, flexShrink: 0, position: "sticky", top: 0, zIndex: 20, background: C.bg }} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ height: 359, overflow: "hidden" }}>
          <img src={BreastCancerIllustration} alt="Breast Cancer" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 80%", display: "block" }} />
        </div>
        <BackBtn go={back} overlay />
      </div>
      <div style={{ padding: "20px 22px 48px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, lineHeight: 1.35 }}>What is Breast Cancer?</h1>
        <p style={{ fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>Breast cancer is one of the most common cancers worldwide and a leading cause of cancer-related death among women. In 2024, about 310,720 new cases were diagnosed in the U.S., with approximately 42,250 deaths reported.¹</p>
        <p style={{ fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>Breast cancer begins when cells in the breast grow uncontrollably, most often in the milk ducts or lobules. Many breast cancers are hormone receptor–positive (HR+), meaning their growth is driven by hormones such as estrogen or progesterone. HR+ cancers account for about two thirds to 80% of all breast cancer cases.¹</p>
        <p style={{ fontSize: 14, lineHeight: 1.85 }}>Breast cancer is most commonly diagnosed in postmenopausal women, with a median diagnosis age of around 63 years. Most cases are detected at early stages (I–III), when curative treatment is possible.⁷ Lifestyle factors such as smoking, alcohol use, obesity after menopause, and high-fat diets can increase breast cancer risk.⁸</p>
      </div>
    </Scr>
  );

  /* ─── ARTICLE: AROMATASE INHIBITOR ───────────────── */
  if (scr === "articleAI") return (
    <Scr scroll>
      <div style={{ height: 62, flexShrink: 0, position: "sticky", top: 0, zIndex: 20, background: C.bg }} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ height: 359, overflow: "hidden" }}>
          <img src={AIIllustration} alt="Aromatase Inhibitor" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <BackBtn go={back} overlay />
      </div>
      <div style={{ padding: "20px 22px 48px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, lineHeight: 1.35 }}>What is an Aromatase Inhibitor?</h1>
        <p style={{ fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>Aromatase is an enzyme that produces estrogen by converting androgens in tissues such as fat, muscle, and breast tissue.⁹ After menopause, the ovaries produce very little estrogen, making aromatase the main source of estrogen in the body.</p>
        <p style={{ fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>Because some breast cancers grow in response to estrogen, aromatase activity can influence tumor growth. Aromatase inhibitors (AIs) are medications that lower estrogen levels by blocking this enzyme.¹⁰ ¹¹</p>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 8 }}>There are two main types of AIs:</p>
          <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.85, color: "#444" }}>
            <li>Non-steroidal AIs (anastrozole, letrozole): temporarily block aromatase activity</li>
            <li>Steroidal AIs (exemestane): permanently inactivate the aromatase enzyme</li>
          </ul>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.85 }}>Clinical guidelines recommend at least 5 years of AI therapy, with extended treatment up to 10 years for patients at higher risk of recurrence (e.g., node-positive disease).¹²</p>
      </div>
    </Scr>
  );

  /* ─── SYMPTOMS GRID ───────────────────────────────── */
  if (scr === "sympGrid") return <GridMenu back={back} title="Symptoms" topGap={32} gridGap={12} cardW={173} cardH={133}
    subtitle="While aromatase inhibitors improve survival outcomes, they can cause side effects related to low estrogen levels. Common symptoms include heart-related risks, bone loss, joint and muscle pain, hot flashes, fatigue, sleep problems, and mood changes.¹² ¹⁶"
    items={[
      { label: "Cardiovascular",      Icon: CardioVIcon,   go: () => go("aCardio") },
      { label: "Bone Loss",           Icon: OsteoIcon,     go: () => go("aBoneLoss") },
      { label: "Bone Fractures",      Icon: OsteoPIcon,    go: () => go("aBoneFx") },
      { label: "Joint & Muscle Pain", Icon: AimssIcon,     go: () => go("aJoint") },
      { label: "Hot Flashes",         Icon: HotflashIcon,  go: () => go("aHotFlash") },
      { label: "Fatigue",             Icon: FatigueIcon,   go: () => go("aFatigue") },
    ]}
  />;

  /* ─── SYMPTOM ARTICLES ──────────────────────────── */
  if (scr === "aCardio")   return <ArticlePage back={back} heroImg={RootinCardiovascular} title="Heart Health (Cardiotoxicity)" body={[
    <h3 key="r" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Risk</h3>,
    "Extended AI therapy is linked to a modest increase in cardiovascular risk, with about a 19% higher risk compared to shorter treatment durations.¹⁶",
    <h3 key="w" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Why it happens</h3>,
    "Estrogen helps protect the heart by supporting healthy cholesterol levels and blood vessels. Lower estrogen from AI therapy can worsen cholesterol profiles and increase cardiovascular risk.¹²",
    <h3 key="n" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>What patients may notice</h3>,
    "Changes are often silent at first and detected through blood tests or screenings, but over time may lead to high cholesterol, high blood pressure, or heart disease.",
  ]} />;

  if (scr === "aBoneLoss")  return <ArticlePage back={back} heroImg={RootinBoneLoss} title="Bone Loss (Osteoporosis)" body={[
    <h3 key="r" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Risk</h3>,
    "AI therapy significantly increases the risk of bone loss and osteoporosis by 53%. Women on AIs can lose bone density much faster than normal aging.¹⁷",
    <h3 key="w" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Why it happens</h3>,
    "Estrogen is essential for maintaining bone balance. Women receiving AI therapy may lose up to ~5% BMD per year, compared to ~1% with normal aging.¹⁷ ¹⁸",
    <h3 key="n" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>What patients may notice</h3>,
    "Osteoporosis often has no early symptoms. Fractures may occur with minor falls, especially in the spine, hip, or wrist, and some may notice height loss or ongoing back pain over time.",
  ]} />;

  if (scr === "aBoneFx")    return <ArticlePage back={back} heroImg={RootinBoneFractures} title="Bone Fractures" body={[
    <h3 key="r" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Risk</h3>,
    "Patients receiving extended AI therapy have a 33% higher risk of bone fractures compared with shorter AI therapy, and fracture risk is also higher than with tamoxifen.¹²",
    <h3 key="w" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Why it happens</h3>,
    "Bone thinning and structural weakening under AI therapy increase fracture susceptibility, particularly in older patients or those with low body weight or prior fractures.¹⁷ ¹⁸",
    <h3 key="n" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>What patients may notice</h3>,
    "Fractures can cause sudden pain, reduced mobility, long-term discomfort, and loss of independence, especially after spine or hip fractures.",
  ]} />;

  if (scr === "aJoint")     return <ArticlePage back={back} heroImg={RootinMusclePain} title="Joint and Muscle Pain (AIMSS)" body={[
    <h3 key="r" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Risk</h3>,
    "Joint pain, stiffness, and muscle aches affect 20–74% of women receiving AI therapy, with a pooled prevalence of about 46–54%.³ ¹¹",
    <h3 key="w" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Why it happens</h3>,
    "The exact mechanisms are not fully understood, but they appear closely linked to estrogen deprivation. Estrogen normally helps regulate inflammation and supports the health of bones, cartilage, tendons, and ligaments.²¹ ²² ²³",
    <h3 key="n" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>What patients may notice</h3>,
    "Pain and stiffness often affect both sides of the body — especially the hands, wrists, knees, hips, shoulders, and lower back. These symptoms can reduce grip strength and make daily activities significantly more difficult.³",
  ]} />;

  if (scr === "aHotFlash")  return <ArticlePage back={back} heroImg={RootinHotFlash} title="Hot Flashes" body={[
    <h3 key="r" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Risk</h3>,
    "Hot flashes are very common during AI therapy, affecting 30–95% of breast cancer survivors.¹² ²⁴ Extended AI treatment is associated with a 40% higher frequency of hot flashes.¹⁶",
    <h3 key="w" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Why it happens</h3>,
    "Estrogen loss disrupts the brain's temperature regulation, causing small changes in body temperature to trigger sudden heat, sweating, and flushing.¹² ²⁵",
    <h3 key="n" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>What patients may notice</h3>,
    "Sudden episodes of warmth and sweating, often accompanied by chills, sleep disruption, fatigue, and mood changes, which can significantly affect quality of life.²⁴ ²⁵",
  ]} />;

  if (scr === "aFatigue")   return <ArticlePage back={back} heroImg={RootinFatigue} title="Fatigue, Sleep, Mood, and Headaches" body={[
    <h3 key="r" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Risk</h3>,
    "Fatigue, sleep problems, anxiety, and depression are commonly reported during AI therapy, with studies reporting prevalence of up to 59% for insomnia, 51% for depression, and 42% for anxiety.¹⁶",
    <h3 key="w" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Why it happens</h3>,
    "Symptoms likely result from a combination of hormonal changes, inflammation, pain, and sleep disruption, which together can contribute to reduced energy levels and fatigue.¹²",
    <h3 key="n" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>What patients may notice</h3>,
    "Persistent tiredness, poor sleep, difficulty concentrating, low mood, anxiety, and occasional headaches that often occur together and reduce daily functioning.",
  ]} />;

  /* ─── SYMPTOM MANAGEMENT ─────────────────────────── */
  if (scr === "symptomMgmt") return (
    <Scr scroll>
      <div style={{ height: 62, flexShrink: 0, position: "sticky", top: 0, zIndex: 20, background: C.bg }} />
      <div style={{ position: "relative", flexShrink: 0, height: 62 }}>
        <BackBtn go={back} overlay />
      </div>
      <div style={{ padding: "60px 20px 60px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 88 }}>Symptom Management</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 173px)", justifyContent: "center", gap: 12 }}>
          {[
            { label: "Cardiovascular", Icon: CardioVIcon,  go: () => go("mCardio") },
            { label: "Osteoporosis",   Icon: OsteoPIcon,   go: () => go("mOsteo") },
            { label: "AIMSS",          Icon: AimssIcon,    go: () => go("mAIMSS") },
            { label: "Hot Flashes",    Icon: HotflashIcon, go: () => go("mHotFlash") },
            { label: "Fatigue",        Icon: FatigueIcon,  go: () => go("mFatigue") },
          ].map(item => (
            <div key={item.label} onClick={item.go} style={{ width: 173, height: 133, boxSizing: "border-box", background: "white", borderRadius: 16, padding: "22px 12px 18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, border: `1.5px solid ${C.brown}33`, cursor: "pointer" }}>
              <img src={item.Icon} alt={item.label} style={{ width: 32, height: 32, display: "block" }} />
              <p style={{ fontSize: 13, fontWeight: 600, textAlign: "center", color: C.dark }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Scr>
  );

  if (scr === "mCardio")   return <ArticlePage back={back} heroImg={RootinCardiovascular} title="Cardiotoxicity (Heart Health)" body={[
    <h3 key="np" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Non-pharmacologic</h3>,
    "Regular exercise, a balanced diet, weight control, and smoking cessation are key strategies to support heart health.¹",
    <h3 key="p" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Pharmacologic</h3>,
    "Not specified in the original source.",
  ]} />;

  if (scr === "mOsteo")    return <ArticlePage back={back} heroImg={RootinBoneFractures} title="Osteoporosis (Bone Thinning)" body={[
    <h3 key="np" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Non-pharmacologic</h3>,
    "Supervised exercise, especially weight-bearing and resistance training, supports bone strength.² Lifestyle changes such as reducing smoking and alcohol intake are recommended.²",
    <h3 key="p" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Pharmacologic / Supplementation</h3>,
    "Adequate vitamin D and calcium intake is required.² ⁵ Antiresorptive therapy may be recommended for higher-risk patients (e.g., T-score < −2.0).⁵",
    <h3 key="g" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Guideline note</h3>,
    "In appropriate patients, adjuvant bisphosphonates (e.g., IV zoledronate) may be used within oncological care plans and are associated with reduced recurrence and mortality.²",
  ]} />;

  if (scr === "mAIMSS")    return <ArticlePage back={back} heroImg={RootinMusclePain} title="Myalgia / AIMSS" body={[
    <h3 key="np" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Non-pharmacologic (ASCO-aligned)</h3>,
    "Exercise-based programs (aerobic or supervised training; including walking, Nordic walking, or aquatic exercise) are commonly recommended.¹ Yoga and other mind–body approaches may improve pain and physical function.⁷ Acupuncture is supported across prospective studies and is generally considered safe.⁷",
    <h3 key="p" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Pharmacologic (ASCO-aligned)</h3>,
    "Duloxetine is a medication option supported by prospective evidence.⁷ Omega-3 supplementation may be considered as a supportive option in some care plans.⁷",
    <h3 key="r" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>If symptoms are persistent (refractory)</h3>,
    "A short AI interruption or switching to another AI may be considered by clinicians when symptoms are severe and unresponsive, balancing symptom control with cancer outcomes.⁷",
  ]} />;

  if (scr === "mHotFlash")  return <ArticlePage back={back} heroImg={RootinHotFlash} title="Hot Flashes (Vasomotor Symptoms)" body={[
    <h3 key="np" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Non-pharmacologic</h3>,
    "Evidence-supported supportive care options include acupuncture, cognitive behavioral therapy (CBT), and hypnosis.¹¹ Network meta-analysis data suggest acupuncture is frequently ranked among the most effective nonhormonal options.¹³",
    <h3 key="p" style={{fontSize:15,fontWeight:700,marginBottom:8,marginTop:14}}>Pharmacologic (nonhormonal)</h3>,
    "Common nonhormonal medication options include venlafaxine, gabapentin, and clonidine.¹",
  ]} />;

  if (scr === "mFatigue")   return <ArticlePage back={back} heroImg={RootinFatigue} title="Headaches & Fatigue-Related Symptoms" body={[
    <h3 key="np" style={{fontSize:15,fontWeight:700,marginBottom:8}}>Non-pharmacologic</h3>,
    "Supportive options include exercise, yoga, meditation or mindfulness practices, CBT, and acupressure, which may also improve sleep quality and overall energy.¹ Improved sleep quality from yoga practice may indirectly reduce headache burden.¹",
  ]} />;

  return (
    <Scr style={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
      <p style={{ color: C.gray, fontSize: 15 }}>Screen: <code>{scr}</code></p>
      <Button color={C.green} onClick={() => go("home")} style={{ width: "auto", padding: "12px 28px" }}>← Go Home</Button>
    </Scr>
  );
}

/* ─── iPhone 16 Pro Frame ─────────────────────────────────── */
export default function App() {
  const isMobile = useIsMobile();
  const scale = useScale();
  const screenRef = useRef(null);

  const handleCapture = async () => {
    await document.fonts.ready;
    const canvas = await html2canvas(screenRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });
    const link = document.createElement("a");
    link.download = "screen.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100dvh",
      background: isMobile ? C.bg : "#111",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        width: 393,
        height: 852,
        borderRadius: isMobile ? 0 : 54,
        overflow: "hidden",
        position: "relative",
        transform: isMobile ? `scale(${scale})` : "none",
        transformOrigin: "top center",
        boxShadow: isMobile
          ? "none"
          : "0 0 0 10px #2a2a2a, 0 0 0 12px #3a3a3a, 0 30px 80px rgba(0,0,0,0.8)",
        flexShrink: 0,
        background: C.bg,
      }}>
        {!isMobile && (
          <div style={{
            position: "absolute",
            top: 14, left: "50%",
            transform: "translateX(-50%)",
            width: 120, height: 34,
            borderRadius: 20,
            background: "#000",
            zIndex: 100,
          }} />
        )}

        {/* ✅ ref — 앱 화면만 캡처 */}
        <div ref={screenRef} style={{ width: "100%", height: "100%" }}>
          <RootinApp />
        </div>
      </div>

      {!isMobile && (
        <button onClick={handleCapture} style={{
          position: "fixed", bottom: 32, right: 32,
          background: "#344C3D", color: "white",
          border: "none", borderRadius: 100,
          padding: "12px 24px", fontSize: 15,
          fontWeight: 600, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          📷 캡처
        </button>
      )}
    </div>
  );
}
