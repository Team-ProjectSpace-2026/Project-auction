const UnsoldPlayerModal = ({ onClose, onNextPlayer }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "500px",
          background: "#fff",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "60px",
            marginBottom: "12px",
          }}
        >
          ❌
        </div>

        <h1
          style={{
            color: "#ef4444",
            marginBottom: "20px",
            fontSize: "42px",
          }}
        >
          PLAYER UNSOLD
        </h1>

        <h2
          style={{
            color: "#111827",
            marginBottom: "10px",
          }}
        >
          Virat Kohli
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "30px",
          }}
        >
          No team placed a winning bid.
        </p>

        <button
          onClick={() => {
            onClose();
            onNextPlayer();
          }}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "14px 30px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Reveal Next Player
        </button>
      </div>
    </div>
  );
};

export default UnsoldPlayerModal;