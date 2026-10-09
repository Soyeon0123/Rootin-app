import { COLORS, FONT_FAMILY, SAFE_NAV_PADDING, SPACE } from "../../styles/tokens";
import {
  HomeIcon,
  HomeIconActive,
  CalendarIcon,
  CalendarIconActive,
  TrendIcon,
  InfoIcon,
  InfoIconActive,
} from "../../assets/loadAssets";

export default function NavBar({ active, go }) {
  const tabs = [
    { id: "home", label: "Home" },
    { id: "calendar", label: "Calendar" },
    { id: "trends", label: "Trends" },
    { id: "info", label: "Info" },
  ];
  const icons = {
    home: { default: HomeIcon, active: HomeIconActive },
    calendar: { default: CalendarIcon, active: CalendarIconActive },
    trends: { default: TrendIcon, active: TrendIcon },
    info: { default: InfoIcon, active: InfoIconActive },
  };
  return (
    <div
      style={{
        background: COLORS.bg,
        borderTop: `1px solid ${COLORS.border}`,
        flexShrink: 0,
        minHeight: 68,
        paddingBottom: SAFE_NAV_PADDING,
        display: "flex",
        alignItems: "flex-start",
        paddingTop: SPACE.md,
        justifyContent: "center",
        gap: 0,
      }}
    >
      {tabs.map((t) => {
        const iconSrc = active === t.id ? icons[t.id].active : icons[t.id].default;
        return (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            style={{
              minWidth: 44,
              minHeight: 44,
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: COLORS.dark,
              opacity: active === t.id ? 1 : 0.35,
              transition: "opacity .2s",
              padding: 0,
              marginRight: t.id !== "info" ? SPACE.xxxl : 0,
            }}
          >
            <img src={iconSrc} alt="" style={{ width: 32, height: 32, display: "block", pointerEvents: "none" }} />
            <span
              style={{
                fontSize: 10,
                fontFamily: FONT_FAMILY,
                color: COLORS.dark,
                fontWeight: active === t.id ? 600 : 400,
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
