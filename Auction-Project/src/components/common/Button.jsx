import './common.css';

const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  className = "",
  disabled,
  style,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`cric-btn cric-btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
