import { COLORS, FONT_FAMILY } from "../../styles/tokens";

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 16,
  background: COLORS.cardBg,
  borderRadius: 14,
  cursor: "pointer",
};

export function Radio({ label, on, set }) {
  return (
    <div
      onClick={set}
      style={{
        ...rowStyle,
        border: on ? `2px solid ${COLORS.green}` : `1px solid ${COLORS.border}`,
      }}
    >
      <span style={{ fontSize: 15, fontFamily: FONT_FAMILY, paddingRight: 12 }}>{label}</span>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: on ? `7px solid ${COLORS.green}` : `2px solid ${COLORS.border}`,
          background: COLORS.white,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

export function Check({ label, on, toggle }) {
  return (
    <div
      onClick={toggle}
      style={{
        ...rowStyle,
        border: on ? `2px solid ${COLORS.green}` : `1px solid ${COLORS.border}`,
      }}
    >
      <span style={{ fontSize: 15, fontFamily: FONT_FAMILY, paddingRight: 12 }}>{label}</span>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: on ? `7px solid ${COLORS.green}` : `2px solid ${COLORS.border}`,
          background: COLORS.white,
          flexShrink: 0,
        }}
      />
    </div>
  );
}
