import { Check } from "lucide-react";

const SuccessModal = ({
  title,
  message,
  onClose,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "420px",
          background: "var(--card-bg-light)",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,.2)",
          transition: 'background-color 0.2s ease',
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "var(--bg-success-light)",
            color: "var(--status-active-text)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 24px",
          }}
        >
          <Check size={48} strokeWidth={2.5} />
        </div>

        <h2
          style={{
            marginBottom: "12px",
            color: "var(--text-primary-light)",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: "var(--text-secondary-light)",
            marginBottom: "28px",
          }}
        >
          {message}
        </p>

        <button
          onClick={onClose}
          style={{
            background: "var(--accent-light)",
            color: "#fff",
            border: "none",
            padding: "12px 28px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;