import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddTeamModal from "../teams/AddTeamModal";
import { createTeam } from "../../services/teamService";

const initialTeams = [
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
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [teams, setTeams] = useState(initialTeams);

  const handleAddTeam = async (newTeam) => {
    try {
      const { data } = await createTeam(newTeam);
      setTeams((prev) => [
        ...prev,
        {
          ...data,
          id: data._id || data.id,
        },
      ]);
    } catch {
      setTeams((prev) => [
        ...prev,
        {
          ...newTeam,
          id: Date.now(),
        },
      ]);
    }
    setShowAddModal(false);
  };

  return (
    <div>
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            fontWeight: "700",
            margin: 0,
          }}
        >
          Teams
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "var(--accent-light)",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          + Add Team
        </button>
      </div>

      {/* Teams Grid */}
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
                overflow: "hidden",
              }}
            >
              {team.logo ? (
                <img
                  src={team.logo}
                  alt={team.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                team.short
              )}
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
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary-light)",
                  }}
                >
                  Players Purchased
                </div>
                <div style={{ fontWeight: "700" }}>{team.players}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary-light)",
                  }}
                >
                  Remaining Budget
                </div>
                <div style={{ fontWeight: "700" }}>{team.budget}</div>
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

      {/* Add Team Modal */}
      <AddTeamModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTeam}
      />
    </div>
  );
};

export default TeamsTab;
