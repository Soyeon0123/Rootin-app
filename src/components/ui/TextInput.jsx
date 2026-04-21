import { COLORS, FONT_FAMILY, RADIUS } from "../../styles/tokens";

export default function TextInput({
  placeholder,
  value,
  onChange,
  type = "text",
  inputMode = "text",
  numericOnly = false,
  maxLength,
  style = {},
}) {
  const handleChange = (e) => {
    let nextValue = e.target.value;

    if (numericOnly) {
      nextValue = nextValue.replace(/\D/g, "");
    }

    if (maxLength) {
      nextValue = nextValue.slice(0, maxLength);
    }

    onChange(nextValue);
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      inputMode={inputMode}
      style={{
        width: "100%",
        padding: "15px 16px",
        borderRadius: RADIUS.input,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.cardBg,
        fontSize: 15,
        fontFamily: FONT_FAMILY,
        color: COLORS.dark,
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}