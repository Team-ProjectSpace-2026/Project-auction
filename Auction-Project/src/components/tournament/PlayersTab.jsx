import { useNavigate } from "react-router-dom";
import { Search, Pencil, Trash2, Check, X } from "lucide-react";
const players = [
  {
    id: 1,
    name: "Virat Kohli",
    role: "Batsman",
    style: "Right Hand Bat",
    keeper: false,
  },
  {
    id: 2,
    name: "KL Rahul",
    role: "Wicket Keeper",
    style: "Right Hand Bat",
    keeper: true,
  },
  {
    id: 3,
    name: "Ruturaj Gaikwad",
    role: "Batsman",
    style: "Right Hand Bat",
    keeper: false,
  },
  {
    id: 4,
    name: "Hardik Pandya",
    role: "All Rounder",
    style: "Right Hand Bat, Right Arm Fast",
    keeper: false,
  },
  {
    id: 5,
    name: "Ravindra Jadeja",
    role: "All Rounder",
    style: "Left Hand Bat, Slow Left Arm",
    keeper: false,
  },
  {
    id: 6,
    name: "Jasprit Bumrah",
    role: "Bowler",
    style: "Right Arm Fast",
    keeper: false,
  },
  {
    id: 7,
    name: "Yuzvendra Chahal",
    role: "Bowler",
    style: "Right Arm Leg Spin",
    keeper: false,
  },
  {
    id: 8,
    name: "Mohammed Siraj",
    role: "Bowler",
    style: "Right Arm Fast",
    keeper: false,
  },
  {
    id: 9,
    name: "Trent Boult",
    role: "Bowler",
    style: "Left Arm Fast",
    keeper: false,
  },
  {
    id: 10,
    name: "Ishan Kishan",
    role: "Wicket Keeper",
    style: "Left Hand Bat",
    keeper: true,
  },
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

    case "Wicket Keeper":
      return {
        background: "#dcfce7",
        color: "#16a34a",
      };

    default:
      return {
        background: "#f3f4f6",
        color: "#6b7280",
      };
  }
};

const PlayersTab = () => {
    const navigate = useNavigate(); // ✅ MUST be inside component
    return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "var(--text-primary-light)",
            marginBottom: "6px",
          }}
        >
          Players
        </h2>

        <p
          style={{
            color: "var(--text-secondary-light)",
            fontSize: "14px",
          }}
        >
          Manage all players in this tournament.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <input
          placeholder="Search players..."
          style={{
            width: "320px",
            padding: "14px 16px",
            border: "1px solid var(--border-light)",
            borderRadius: "12px",
            fontSize: "14px",
            background: "var(--input-bg)",
            color: "var(--input-text)",
            outline: "none",
            transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <select
            style={{
              width: "180px",
              padding: "14px 16px",
              border: "1px solid var(--border-light)",
              borderRadius: "12px",
              background: "var(--input-bg)",
              color: "var(--input-text)",
              cursor: "pointer",
              transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
            }}
          >
            <option>All Roles</option>
            <option>Batsman</option>
            <option>Bowler</option>
            <option>All Rounder</option>
            <option>Wicket Keeper</option>
          </select>

          <button
            style={{
              background: "var(--accent-light)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 20px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Add Player
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--card-bg-light)",
          border: "1px solid var(--border-light)",
          borderRadius: "16px",
          overflow: "hidden",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "var(--table-header-bg)",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "16px" }}>#</th>
              <th>Player Name</th>
              <th>Role</th>
              <th>Player Style</th>
              <th>Keeper</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {players.map((player, index) => (
              <tr
                key={player.id}
                style={{
                  borderTop: "1px solid var(--table-row-border)",
                }}
              >
                <td style={{ padding: "16px" }}>
                  {index + 1}
                </td>

                <td
                    onClick={() => navigate("/player-details")}
                    style={{
                    fontWeight: "600",
                    color: "var(--accent-light)",
                    cursor: "pointer",
                }}
         >
            {player.name}
            </td>

                <td>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      ...getRoleStyle(player.role),
                    }}
                  >
                    {player.role}
                  </span>
                </td>

                <td>{player.style}</td>

                <td
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: player.keeper
                      ? "#16a34a"
                      : "#ef4444",
                  }}
                >
                  {player.keeper ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                </td>

                <td>
                    <button
                    onClick={() => navigate("/player-details")}
                style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                marginRight: "12px",
                fontSize: "16px",
            }}
            >
            <Pencil size={16} strokeWidth={2} />
        </button>

        <button
            style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "16px",
            }}
        >
        <Trash2 size={16} strokeWidth={2} />
    </button>
    </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayersTab;