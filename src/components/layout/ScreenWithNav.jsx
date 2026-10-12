import { COLORS, FONT_FAMILY } from "../../styles/tokens";
import NavBar from "./NavBar";

export default function ScreenWithNav({ children, activeTab, navGo, bg = COLORS.bg }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT_FAMILY,
        color: COLORS.dark,
        position: "relative",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", overflowX: "clip", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
      <NavBar active={activeTab} go={navGo} />
    </div>
  );
}
