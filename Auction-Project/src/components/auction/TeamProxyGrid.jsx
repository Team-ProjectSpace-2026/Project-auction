import { useAuction } from "../../context/AuctionContext";

const TEAM_COLORS = [
  "#2563eb", "#16a34a", "#7c3aed", "#d97706",
  "#dc2626", "#0891b2", "#e11d48", "#4f46e5",
];

const TeamProxyGrid = ({ selectedTeamId, onSelectTeam }) => {
  const { teams, currentPlayer, auctionStatus } = useAuction();

  const isBidding = auctionStatus === "bidding" && currentPlayer;

  return (
    <div style={{
      background: "var(--card-bg-light)",
      borderRadius: "16px",
      border: "1px solid var(--border-light)",
      padding: "24px 28px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      transition: "background-color 0.2s ease, border-color 0.2s ease",
    }}>
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary-light)", margin: 0, textTransform: "uppercase", letterSpacing: "0.3px" }}>
        All Teams <span style={{ fontWeight: "400", color: "var(--text-secondary-light)", textTransform: "none", fontSize: "12px" }}>(Click to bid for a team)</span>
      </h3>
      <div style={{ display: "flex", gap: "12px", marginTop: "16px", overflowX: "auto", paddingBottom: "4px" }}>
        {teams.map((team, idx) => {
          const isSelected = selectedTeamId === team._id;
          const color = TEAM_COLORS[idx % TEAM_COLORS.length];
          const initials = team.name
            ? team.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
            : team.short || "??";

          return (
            <div
              key={team._id}
              onClick={() => isBidding && onSelectTeam?.(team._id)}
              className="auction-team-selectable"
              style={{
                border: isSelected ? "2.5px solid var(--accent-light)" : "1.5px solid var(--border-light)",
                borderRadius: "12px",
                padding: "14px 10px 10px",
                textAlign: "center",
                cursor: isBidding ? "pointer" : "default",
                background: isSelected ? "color-mix(in srgb, var(--accent-light) 8%, transparent)" : "var(--card-bg-light)",
                minWidth: "105px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                opacity: !isBidding ? 0.6 : 1,
              }}
            >
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                background: color,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "12px", fontWeight: "800",
              }}>
                {initials}
              </div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: isSelected ? "var(--accent-light)" : "var(--text-primary-light)", lineHeight: "1.3" }}>
                {team.name}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-secondary-light)" }}>
                {team.remainingBudget != null ? `₹${team.remainingBudget.toLocaleString("en-IN")}` : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamProxyGrid;
