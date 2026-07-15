import { XCircle } from "lucide-react";

const UnsoldPlayerModal = ({ onClose, onNextPlayer, playerName }) => {
  return (
    <div className="auction-screen"
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
          background: "var(--card-bg-light)",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          transition: 'background-color 0.2s ease',
        }}
      >
        <div
          style={{
            marginBottom: "12px",
          }}
        >
          <XCircle size={60} strokeWidth={1.5} style={{ color: "#ef4444" }} />
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
            color: "var(--text-primary-light)",
            marginBottom: "10px",
          }}
        >
          {playerName || "Unknown Player"}
        </h2>

        <p
          style={{
            color: "var(--text-secondary-light)",
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
            background: "var(--accent-light)",
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
