import { useNavigate } from "react-router-dom";

const teams = [
  {
    id: 1,
    name: "Mangalore Warriors",
    players: "12/18",
    budget: "₹8,50,000",
    short: "MW",
  },
  {
    id: 2,
    name: "Bengaluru Strikers",
    players: "11/18",
    budget: "₹6,25,000",
    short: "BS",
  },
  {
    id: 3,
    name: "Mysore Royals",
    players: "10/18",
    budget: "₹7,75,000",
    short: "MR",
  },
  {
    id: 4,
    name: "Hubli Heroes",
    players: "9/18",
    budget: "₹9,00,000",
    short: "HH",
  },
  {
    id: 5,
    name: "Shimoga Sharks",
    players: "8/18",
    budget: "₹10,50,000",
    short: "SS",
  },
  {
    id: 6,
    name: "Belagavi Bulls",
    players: "11/18",
    budget: "₹5,00,000",
    short: "BB",
  },
  {
    id: 7,
    name: "Udupi United",
    players: "10/18",
    budget: "₹6,00,000",
    short: "UU",
  },
  {
    id: 8,
    name: "Davanagere Dynamos",
    players: "9/18",
    budget: "₹8,75,000",
    short: "DD",
  },
];

const TeamsTab = () => {
  const navigate = useNavigate(); // ✅ MUST be inside component

  return (
    <div>
      <h2
        style={{
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "24px",
        }}
      >
        Teams
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "22px",
        }}
      >
        {teams.map((team) => (
          <div
            key={team.id}
            style={{
              background: "var(--card-bg-light)",
              border: "1px solid var(--border-light)",
              borderRadius: "18px",
              padding: "18px",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 18px",
                borderRadius: "16px",
                background: "var(--info-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: "700",
                color: "var(--accent-light)",
              }}
            >
              {team.short}
            </div>

            <h3
              style={{
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              {team.name}
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary-light)" }}>
                  Players Purchased
                </div>
                <div style={{ fontWeight: "700" }}>
                  {team.players}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "var(--text-secondary-light)" }}>
                  Remaining Budget
                </div>
                <div style={{ fontWeight: "700" }}>
                  {team.budget}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/team-details")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--accent-light)",
                background: "var(--card-bg-light)",
                color: "var(--accent-light)",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              View Team
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamsTab;