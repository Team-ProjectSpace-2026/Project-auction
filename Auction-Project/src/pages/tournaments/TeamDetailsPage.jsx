import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

const players = [
  { id: 1, name: "Virat Kohli", role: "Batsman", price: "₹85,00,000" },
  { id: 2, name: "KL Rahul", role: "Wicket Keeper", price: "₹75,00,000" },
  { id: 3, name: "Ruturaj Gaikwad", role: "Batsman", price: "₹55,00,000" },
  { id: 4, name: "Hardik Pandya", role: "All Rounder", price: "₹95,00,000" },
  { id: 5, name: "Ravindra Jadeja", role: "All Rounder", price: "₹80,00,000" },
  { id: 6, name: "Jasprit Bumrah", role: "Bowler", price: "₹70,00,000" },
  { id: 7, name: "Mohammed Siraj", role: "Bowler", price: "₹45,00,000" },
  { id: 8, name: "Yuzvendra Chahal", role: "Bowler", price: "₹30,00,000" },
  { id: 9, name: "Tilak Varma", role: "Batsman", price: "₹35,00,000" },
  { id: 10, name: "Washington Sundar", role: "All Rounder", price: "₹20,00,000" },
  { id: 11, name: "Arshdeep Singh", role: "Bowler", price: "₹25,00,000" },
  { id: 12, name: "Ishan Kishan", role: "Wicket Keeper", price: "₹25,00,000" },
];

const getRoleStyle = (role) => {
  switch (role) {
    case "Batsman":
      return {
        background: "#dbeafe",
        color: "#2563eb",
      };

    case "Bowler":
      return {
        background: "#fef3c7",
        color: "#d97706",
      };

    case "All Rounder":
      return {
        background: "#ede9fe",
        color: "#7c3aed",
      };

    default:
      return {
        background: "#dcfce7",
        color: "#16a34a",
      };
  }
};

const TeamDetailsPage = () => {
  const navigate = useNavigate();
  const exportSquad = () => {
  const csvContent = [
    ["Player Name", "Role", "Price"],
    ...players.map((p) => [p.name, p.role, p.price]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Mangalore_Warriors_Squad.csv";
  link.click();
};
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f6fb",
      }}
    >
      <Sidebar activePage="tournaments" />

      <div
        style={{
          marginLeft: "220px",
          flex: 1,
        }}
      >
        <TopBar
          user={{
            name: "Rahul Organizer",
            role: "Organizer",
          }}
        />

        <main
          style={{
            padding: "96px 32px 32px",
          }}
        >
          {/* Back */}
          <button
             onClick={() =>
  navigate("/tournament-details", {
    state: { activeTab: "teams" },
  })
}
            style={{
            border: "none",
            background: "transparent",
            color: "#2563eb",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "14px",
        }}
      >
        ← Back to Teams
        </button>

          {/* Header */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8eaf0",
              borderRadius: "20px",
              padding: "22px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "18px",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2563eb",
                }}
              >
                MW
              </div>

              <div>
                <h1
                  style={{
                    fontSize: "32px",
                    fontWeight: "800",
                    color: "#111827",
                    marginBottom: "14px",
                  }}
                >
                  Mangalore Warriors
                </h1>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    color: "#6b7280",
                    fontSize: "16px",
                  }}
                >
                  <span>👤 Owner: Rajesh Shetty</span>
                  <span>👥 Players Purchased: 12</span>
                </div>
              </div>
            </div>

            <button
                onClick={exportSquad}
                style={{
                padding: "12px 24px",
                borderRadius: "12px",
                border: "1px solid #2563eb",
                background: "#fff",
                color: "#2563eb",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
            ⬇ Export Squad
          </button>
          </div>

          {/* Squad List */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8eaf0",
              borderRadius: "20px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "34px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "20px",
              }}
            >
              Squad List
            </h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <th style={{ padding: "16px", textAlign: "left" }}>#</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>
                    Player Name
                  </th>
                  <th style={{ padding: "16px", textAlign: "left" }}>Role</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>
                    Purchase Price
                  </th>
                </tr>
              </thead>

              <tbody>
                {players.map((player) => (
                  <tr
                    key={player.id}
                    style={{
                      borderTop: "1px solid #eef2f7",
                    }}
                  >
                    <td style={{ padding: "16px" }}>{player.id}</td>

                    <td
                      style={{
                        padding: "16px",
                        fontWeight: "600",
                      }}
                    >
                      {player.name}
                    </td>

                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "600",
                          ...getRoleStyle(player.role),
                        }}
                      >
                        {player.role}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "16px",
                        fontWeight: "700",
                      }}
                    >
                      {player.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamDetailsPage;