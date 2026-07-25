import { FiEdit2, FiTrash2 } from "react-icons/fi";

const formatCurrency = (amount) => {
  if (amount == null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const getBudgetColor = (remaining, total) => {
  if (!total) return "var(--text-primary-light)";
  const pct = remaining / total;
  if (pct > 0.5) return "#16a34a";
  if (pct > 0.2) return "#d97706";
  return "#ef4444";
};

const TeamCard = ({ team, onView, onEdit, onDelete }) => {
  const playersPurchased = team.players || 0;
  const maxPlayers = team.maxPlayers || 18;
  const playerPct = Math.min((playersPurchased / maxPlayers) * 100, 100);
  const accentColor = team.primaryColor || "var(--accent-light)";
  const budgetColor = getBudgetColor(team.remainingBudget, team.totalBudget);

  return (
    <div
      style={{
        background: "var(--card-bg-light)",
        border: "1px solid var(--border-light)",
        borderTop: `3px solid ${accentColor}`,
        borderRadius: "18px",
        padding: "22px 18px 18px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: "76px",
          height: "76px",
          margin: "0 auto 14px",
          borderRadius: "14px",
          background: team.logo ? "transparent" : `${accentColor}15`,
          border: team.logo ? "none" : `2px dashed ${accentColor}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontWeight: "800",
          color: accentColor,
          overflow: "hidden",
          transition: "border-color 0.2s ease",
        }}
      >
        {team.logo ? (
          <img src={team.logo} alt={team.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          team.short
        )}
      </div>

      {/* Name & Owner */}
      <h3 style={{ textAlign: "center", fontSize: "17px", fontWeight: "700", marginBottom: "2px" }}>
        {team.name}
      </h3>
      {team.ownerName && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-secondary-light)", marginBottom: "16px" }}>
          Owner: {team.ownerName}
        </p>
      )}

      {/* Player Progress */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
          <span style={{ color: "var(--text-secondary-light)" }}>Players</span>
          <span style={{ fontWeight: "700" }}>{playersPurchased}/{maxPlayers}</span>
        </div>
        <div style={{ height: "6px", borderRadius: "3px", background: "var(--border-light)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${playerPct}%`, borderRadius: "3px", background: accentColor, transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* Budget */}
      <div style={{ textAlign: "center", marginBottom: "18px" }}>
        <div style={{ fontSize: "11px", color: "var(--text-secondary-light)", marginBottom: "2px" }}>Remaining Budget</div>
        <div style={{ fontSize: "20px", fontWeight: "800", color: budgetColor }}>{formatCurrency(team.remainingBudget)}</div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onView?.(team)}
          style={{
            flex: 1, padding: "9px", borderRadius: "10px",
            border: `1px solid ${accentColor}`, background: `${accentColor}10`,
            color: accentColor, fontWeight: "600", cursor: "pointer", fontSize: "13px",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = `${accentColor}20`}
          onMouseLeave={(e) => e.currentTarget.style.background = `${accentColor}10`}
        >
          View
        </button>
        <button
          onClick={() => onEdit?.(team)}
          aria-label="Edit team"
          style={{
            padding: "9px 11px", borderRadius: "10px",
            border: "1px solid var(--border-light)", background: "var(--card-bg-light)",
            color: "var(--text-secondary-light)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background-color 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--info-bg)"; e.currentTarget.style.color = "var(--accent-light)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--card-bg-light)"; e.currentTarget.style.color = "var(--text-secondary-light)"; }}
        >
          <FiEdit2 size={15} />
        </button>
        <button
          onClick={() => onDelete?.(team)}
          aria-label="Delete team"
          style={{
            padding: "9px 11px", borderRadius: "10px",
            border: "1px solid var(--border-light)", background: "var(--card-bg-light)",
            color: "#e74c3c", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--card-bg-light)"}
        >
          <FiTrash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default TeamCard;
