const TournamentHeader = () => {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      style={{ marginBottom: "20px" }}
    >
      {/* Back Button */}
      <button
        style={{
          border: "none",
          background: "transparent",
          color: "#2563eb",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← Back to Tournaments
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Left Section */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          {/* Tournament Logo Placeholder */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "12px",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            🏆
          </div>

          <div>
            {/* Title + Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
              }}
            >
              <h1
                style={{
                  fontSize: "42px",
                  fontWeight: 800,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Summer League 2027
              </h1>

              <span
                style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Active
              </span>
            </div>

            {/* Tournament Info */}
            <div
              style={{
                display: "flex",
                gap: "28px",
                color: "#6b7280",
                fontSize: "15px",
                fontWeight: 500,
              }}
            >
              <span>🏆 T20 League</span>
              <span>👥 12 Teams</span>
              <span>📅 Auction on 20 Jun 2027</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <button
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px 22px",
            fontWeight: 700,
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