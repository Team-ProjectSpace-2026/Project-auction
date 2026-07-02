import { useNavigate } from "react-router-dom";
const TournamentHeader = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "var(--card-bg-light)",
        border: "1px solid var(--border-light)",
        borderRadius: "16px",
        padding: "18px 24px",
        marginBottom: "18px",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/tournaments")}
        style={{
        border: "none",
        background: "transparent",
        color: "var(--accent-light)",
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
              border: "1px solid var(--border-light)",
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
                   color: "var(--text-primary-light)",
                }}
              >
                Summer League 2027
              </h1>

              <span
                style={{
                  background: "var(--status-active-bg)",
                  color: "var(--status-active-text)",
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
                color: "var(--text-secondary-light)",
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
        <button onClick={() => navigate("/edit-tournament")}
          style={{
            background: "var(--card-bg-light)",
            color: "var(--accent-light)",
            border: "1px solid var(--accent-light)",
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