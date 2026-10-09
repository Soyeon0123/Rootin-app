export const COLORS = {
  bg: "#F3EFE3",
  green: "#344C3D",
  dark: "#001910",
  brown: "#582F0E",
  white: "#FFFFFF",
  gray: "#7A7A7A",
  border: "#D4CFC5",
  lightGray: "#E3DDD4",
  cardBg: "#FFFFFF",
  red: "#8B2020",
};

export const FONT_FAMILY = "'DM Sans', sans-serif";

export const RADIUS = {
  pill: "100px",
  card: "16px",
  input: "14px",
};

export const SHADOWS = {
  soft: "0 8px 24px rgba(0,0,0,0.12)",
};

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
};

export const SCREEN_PADDING = SPACE.xl;

// Safe-area helpers. The desktop phone-frame mockup sets --safe-top / --safe-bottom
// CSS variables to fake notch/home-indicator clearance; real devices get env() values.
export const SAFE_TOP = "calc(var(--safe-top, 0px) + 44px)";
export const SAFE_TOP_SPACER = "calc(var(--safe-top, 0px) + 62px)";
export const SAFE_BOTTOM = "calc(var(--safe-bottom, 0px) + 24px)";
export const SAFE_NAV_PADDING = "var(--safe-bottom, 0px)";
