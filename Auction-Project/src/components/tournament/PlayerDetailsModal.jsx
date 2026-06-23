import { useNavigate } from "react-router-dom";
const PlayerDetailsModal = ({ onClose, onStartBidding }) => {
    const navigate = useNavigate();
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
          width: "760px",
          background: "#fff",
          borderRadius: "20px",
          padding: "28px",
          position: "relative",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            border: "none",
            background: "transparent",
            fontSize: "24px",
            cursor: "pointer",
            color: "#6b7280",
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              color: "#1d4ed8",
              fontSize: "34px",
              fontWeight: "800",
              marginBottom: "8px",
            }}
          >
            PLAYER REVEALED!
          </h2>
        </div>

        {/* Player Info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "28px",
            alignItems: "center",
          }}
        >
          {/* Image */}
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a"
            alt="player"
            style={{
                width: "100%",
                height: "320px",
                objectFit: "cover",
                borderRadius: "12px",
            }}
        />
          </div>

          {/* Details */}
          <div>
            <h2
              style={{
                fontSize: "34px",
                fontWeight: "800",
                color: "#111827",
                marginBottom: "10px",
              }}
            >
              VIRAT KOHLI
            </h2>

            <span
              style={{
                background: "#dbeafe",
                color: "#2563eb",
                padding: "6px 12px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              BATSMAN
            </span>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                color: "#374151",
              }}
            >
              <div>
                <strong>Batting Style:</strong> Right Hand Bat
              </div>

              <div>
                <strong>Bowling Style:</strong> Medium Pace
              </div>

              <div>
                <strong>Nationality:</strong> India
              </div>

              <div>
                <strong>Base Price:</strong> ₹50,000
              </div>
            </div>
          </div>
        </div>

        {/* Bid Section */}
        <div
          style={{
            marginTop: "28px",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "28px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#6b7280",
              marginBottom: "10px",
            }}
          >
            Starting Bid
          </p>

          <h1
            style={{
              fontSize: "44px",
              color: "#2563eb",
              fontWeight: "800",
              marginBottom: "24px",
            }}
          >
            ₹ 50,000
          </h1>

          <button
            onClick={() => {
            navigate("/live-auction");
            }}
        style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "14px 32px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
        }}
        >
        Start Bidding
        </button>

          <p
            style={{
              marginTop: "16px",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            Bidding will begin once you click Start Bidding.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailsModal;