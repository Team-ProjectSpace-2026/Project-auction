// import './common.css'; // Uncomment if you create a specific CSS file

const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`cric-btn cric-btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
