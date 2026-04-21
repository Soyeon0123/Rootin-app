import { COLORS, FONT_FAMILY, RADIUS } from "../../styles/tokens";

export default function Button({
  children,
  onClick,
  color = COLORS.brown,
  textColor = COLORS.white,
  disabled = false,
  style = {},
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: color,
        color: textColor,
        border: "none",
        borderRadius: RADIUS.pill,
        padding: "16px 20px",
        fontSize: 17,
        fontWeight: 600,
        fontFamily: FONT_FAMILY,
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        opacity: disabled ? 0.4 : 1,
        letterSpacing: "0.01em",
        ...style,
      }}
    >
      {children}
    </button>
  );
}