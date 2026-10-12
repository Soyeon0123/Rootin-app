import { COLORS, FONT_FAMILY } from "../../styles/tokens";

export default function Screen({ children, bg = COLORS.bg, style = {} }) {
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
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
