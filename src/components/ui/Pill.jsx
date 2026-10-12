import { COLORS, FONT_FAMILY, RADIUS } from "../../styles/tokens";

export default function Pill({ label, on, click }) {
  return (
    <button
      onClick={click}
      style={{
        padding: "10px 18px",
        borderRadius: RADIUS.pill,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: FONT_FAMILY,
        border: on ? `1.5px solid ${COLORS.green}` : `1.5px solid ${COLORS.border}`,
        background: on ? COLORS.green : COLORS.white,
        color: on ? COLORS.white : COLORS.dark,
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}
