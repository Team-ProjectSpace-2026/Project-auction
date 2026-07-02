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
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "var(--status-active-bg)",
            color: "var(--status-active-text)",
            fontSize: "48px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 24px",
          }}
        >
          ✓
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