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
const icon24Modules = import.meta.glob("./icons/Icon_24px/*.svg", { eager: true, import: "default" });
const icon44Modules = import.meta.glob("./icons/Icon_44px/*.svg", { eager: true, import: "default" });
const charModules = import.meta.glob("./illustrations/Character/*.{png,jpg,jpeg,PNG,JPG}", { eager: true, import: "default" });
const growModules = import.meta.glob("./illustrations/Grow/*.{png,jpg,jpeg,PNG,JPG}", { eager: true, import: "default" });
const basicInfoModules = import.meta.glob("./illustrations/Basic_Info/*.{png,jpg,jpeg,PNG,JPG}", { eager: true, import: "default" });
const symptomModules = import.meta.glob("./illustrations/Symptom_Info/*.{png,jpg,jpeg,PNG,JPG}", { eager: true, import: "default" });

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
export const HomeIcon = icon44("home", "icon");
export const HomeIconActive = icon44Active("home", "icon");
export const CalendarIcon = icon44("calendar", "icon");
export const CalendarIconActive = icon44Active("calendar", "icon");
export const TrendIcon = icon44("trend", "icon");
export const InfoIcon = icon44("info", "icon");
export const InfoIconActive = icon44Active("info", "icon");
export const ArrowLeft = findAsset(icon24Modules, ["arrowl", "icon"], ["circle", "onclick"]);
export const ArrowRight = findAsset(icon24Modules, ["arrowr", "icon"], ["circle", "onclick"]);
export const ArrowUp = icon24("arrow", "up", "icon");
export const ArrowDown = icon24("arrow", "down", "icon");
export const CircleArrowRight = findAsset(icon44Modules, ["circle", "arrowr", "icon"], ["onclick"]);
export const CircleArrowRightActive = findAsset(icon44Modules, ["circle", "arrowr", "icon", "onclick"]);
export const UserIcon = icon24("user", "icon");
export const DataIcon = icon24("data", "icon");
export const SettingsIcon = icon24("setting", "icon");
export const XIcon = icon24("xicon");
// symptom / condition icons
export const DiabetesIcon = icon24("diabetes", "icon");
export const CardioVIcon = icon24("cardiov", "icon");
export const DepressionIcon = icon24("depression", "icon");
export const HypertensionIcon = icon24("hypertension", "icon");
export const OsteoPIcon = icon24("osteop", "icon");
export const OthersIcon = icon24("others", "icon");
export const CardioIcon = findAsset(icon24Modules, ["cardio", "icon"], ["onclick", "cardiov"]);
export const OsteoIcon = findAsset(icon24Modules, ["osteo", "icon"], ["onclick", "osteop"]);
export const AimssIcon = icon24("aimss", "icon");
export const HotflashIcon = icon24("hotflash", "icon");
export const FatigueIcon = icon24("fatigue", "icon");

// illustrations — character (daily mood art) + growth-stage art (Grow folder)
export const RootinGood1 = char("good", "01") || char("good", "1");
export const RootinGood2 = char("good", "02") || char("good", "2");
export const RootinGood3 = char("good", "03") || char("good", "3");
export const RootinGood4 = char("good", "04") || char("good", "4");
export const RootinBad1 = char("bad", "01") || char("bad", "1");
export const RootinBad2 = char("bad", "02") || char("bad", "2");
export const GrowSeed = grow("seed");
export const GrowSprout = grow("sprout");
export const GrowBloom = grow("bloom");

// illustrations — basic info
export const BreastCancerIllustration = basicInfo("breast");
export const AIIllustration = basicInfo("ai", "illust");

// illustrations — symptom info
export const RootinCardiovascular = symptom("cardio");
export const RootinBoneLoss = symptom("bone", "loss");
export const RootinBoneFractures = symptom("bone", "fract");
export const RootinMusclePain = symptom("muscle");
export const RootinHotFlash = symptom("hotflash") || symptom("hot", "flash");
export const RootinFatigue = symptom("fatigue");
