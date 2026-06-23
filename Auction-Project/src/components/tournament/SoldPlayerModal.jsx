const SoldPlayerModal = ({ onClose, onNextPlayer }) => {
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
          background: "#fff",
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#16a34a",
            marginBottom: "20px",
          }}
        >
          ✅ PLAYER SOLD!
        </h1>

        <h2>Virat Kohli</h2>

        <p
          style={{
            marginTop: "10px",
          }}
        >
          Sold To
        </p>

        <h3
          style={{
            color: "#2563eb",
          }}
        >
          Mangalore Warriors
        </h3>

        <h1
          style={{
            color: "#16a34a",
            marginTop: "20px",
          }}
        >
          ₹85,000
        </h1>

        <button
          onClick={() => {
            onClose();
            onNextPlayer();
          }}
          style={{
            marginTop: "25px",
            background: "#2563eb",
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