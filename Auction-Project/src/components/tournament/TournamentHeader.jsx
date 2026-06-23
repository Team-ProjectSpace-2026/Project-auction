import { useNavigate } from "react-router-dom";
const TournamentHeader = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "18px 24px",
        marginBottom: "18px",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/tournaments")}
        style={{
        border: "none",
        background: "transparent",
        color: "#2563eb",
        fontWeight: "600",
        cursor: "pointer",
        marginBottom: "14px",
        fontSize: "14px",
      }}
    >
    ← Back to Tournaments
  </button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Tournament Logo */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "0px",
              background: "transparent",
              border: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "34px",
            }}
          >
            🏆
          </div>

          <div>
            {/* Title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                Summer League 2027
              </h1>

              <span
                style={{
                  background: "#dcfce7",
                  color: "#16a34a",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                Active
              </span>
            </div>

            {/* Info Row */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                color: "#6b7280",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <span>🏆 T20 League</span>
              <span>👥 12 Teams</span>
              <span>📅 Auction on 20 Jun 2027</span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <button
          style={{
            background: "#fff",
            color: "#2563eb",
            border: "1px solid #2563eb",
            borderRadius: "10px",
            padding: "12px 18px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ✏ Edit Tournament
        </button>
      </div>
    </div>
  );
};

export default TournamentHeader;