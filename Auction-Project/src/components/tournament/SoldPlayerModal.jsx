import { formatCurrency } from "../../utils/formatCurrency";

const SoldPlayerModal = ({ onClose, onNextPlayer, playerName, teamName, soldPrice }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "600px",
          background: "var(--card-bg-light)",
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center",
          transition: 'background-color 0.2s ease',
        }}
      >
        <h1
          style={{
            color: "var(--status-active-text)",
            marginBottom: "20px",
          }}
        >
          PLAYER SOLD!
        </h1>

        <h2 style={{ color: "var(--text-primary-light)" }}>{playerName || "Unknown Player"}</h2>

        <p
          style={{
            marginTop: "10px",
            color: "var(--text-secondary-light)",
          }}
        >
          Sold To
        </p>

        <h3
          style={{
            color: "var(--accent-light)",
          }}
        >
          {teamName || "Unknown Team"}
        </h3>

        <h1
          style={{
            color: "var(--status-active-text)",
            marginTop: "20px",
          }}
        >
          {formatCurrency(soldPrice)}
        </h1>

        <button
          onClick={() => {
            onClose();
            onNextPlayer();
          }}
          style={{
            marginTop: "25px",
            background: "var(--accent-light)",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
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

export default SoldPlayerModal;
