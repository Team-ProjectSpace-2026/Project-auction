import './common.css';

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  id,
  required,
  min,
  max,
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        className={`input-control ${disabled ? "input-disabled" : ""}`}
      />
    </div>
  );
};

export default InputField;
