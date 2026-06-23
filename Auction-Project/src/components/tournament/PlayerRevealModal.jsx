const PlayerRevealModal = ({ onContinue }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "560px",
          background: "#fff",
          borderRadius: "20px",
          padding: "32px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <h2
          style={{
            fontSize: "30px",
            fontWeight: "700",
            marginBottom: "10px",
            color: "#111827",
          }}
        >
          Revealing Next Player
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "30px",
          }}
        >
          Please wait while we reveal the next player...
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            marginBottom: "30px",
          }}
        >
          <div style={smallCard}>?</div>
          <div style={smallCard}>?</div>

          <div style={centerCard}>?</div>

          <div style={smallCard}>?</div>
          <div style={smallCard}>?</div>
        </div>

        <div
          style={{
            fontSize: "20px",
            color: "#2563eb",
            marginBottom: "18px",
          }}
        >
          ● ● ● ○ ○
        </div>

        <h3
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          Shuffling Players...
        </h3>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          This will only take a few seconds.
        </p>

        <button
          onClick={onContinue}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px 28px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Reveal Player
        </button>
      </div>
    </div>
  );
};

const smallCard = {
  width: "80px",
  height: "120px",
  borderRadius: "14px",
  background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "38px",
  fontWeight: "700",
};

const centerCard = {
  width: "100px",
  height: "150px",
  borderRadius: "14px",
  background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "50px",
  fontWeight: "700",
  boxShadow: "0 10px 30px rgba(37,99,235,0.4)",
};

export default PlayerRevealModal;