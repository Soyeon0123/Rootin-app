import { COLORS } from "../../styles/tokens";

export default function ProgressBar({ v }) {
  return (
    <div
      style={{
        height: 9,
        background: COLORS.lightGray,
        borderRadius: 13,
        margin: "4px auto 12px",
        width: "100%",
        maxWidth: 280,
        alignSelf: "center",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${v * 100}%`,
          background: COLORS.dark,
          borderRadius: 13,
          transition: "width .3s",
        }}
      />
    </div>
  );
}
