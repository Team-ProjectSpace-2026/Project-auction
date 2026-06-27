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
          background: "#fff",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,.2)",
        }}
      >
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "#dcfce7",
            color: "#16a34a",
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
            color: "#111827",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "28px",
          }}
        >
          {message}
        </p>

        <button
          onClick={onClose}
          style={{
            background: "#2563eb",
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