import { FiEdit2, FiTrash2 } from "react-icons/fi";

const formatCurrency = (amount) => {
  if (amount == null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const TeamCard = ({ team, onView, onEdit, onDelete }) => {
  const playersPurchased = team.players || 0;
  const maxPlayers = team.maxPlayers || 18;

  return (
    <div
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
          marginBottom: "4px",
        }}
      >
        {team.name}
      </h3>

      {team.ownerName && (
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "var(--text-secondary-light)",
            marginBottom: "16px",
          }}
        >
          Owner: {team.ownerName}
        </p>
      )}

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
          <div style={{ fontWeight: "700" }}>{playersPurchased}/{maxPlayers}</div>
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
          <div style={{ fontWeight: "700" }}>{formatCurrency(team.remainingBudget)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onView?.(team)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid var(--accent-light)",
            background: "var(--card-bg-light)",
            color: "var(--accent-light)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          View
        </button>
        <button
          onClick={() => onEdit?.(team)}
          aria-label="Edit team"
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            background: "var(--card-bg-light)",
            color: "var(--text-secondary-light)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiEdit2 size={16} />
        </button>
        <button
          onClick={() => onDelete?.(team)}
          aria-label="Delete team"
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            background: "var(--card-bg-light)",
            color: "#e74c3c",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TeamCard;