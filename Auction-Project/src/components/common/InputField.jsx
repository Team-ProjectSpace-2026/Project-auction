const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-control ${disabled ? "input-disabled" : ""}`}
      />
    </div>
  );
};

export default InputField;
