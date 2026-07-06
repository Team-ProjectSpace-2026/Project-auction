import { useAuction } from "../../context/AuctionContext";
import { formatCurrency } from "../../utils/formatCurrency";

const TEAM_COLORS = [
  "#2563eb", "#16a34a", "#7c3aed", "#d97706",
  "#dc2626", "#0891b2", "#e11d48", "#4f46e5",
];

const ActivityFeed = () => {
  const { bids, teams } = useAuction();

  const getTeamColor = (teamId) => {
    const idx = teams.findIndex((t) => t._id === teamId);
    return TEAM_COLORS[idx % TEAM_COLORS.length];
  };

  return (
    <div style={{
      background: "var(--card-bg-light)",
      borderRadius: "16px",
      border: "1px solid var(--border-light)",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      transition: "background-color 0.2s ease, border-color 0.2s ease",
      alignSelf: "start",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
        <span style={{
          width: "9px", height: "9px", borderRadius: "50%",
          background: "#ef4444", display: "inline-block",
          animation: "livePulse 1.5s ease-in-out infinite",
        }} />
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--text-primary-light)" }}>Live Bidding Feed</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxHeight: "400px", overflowY: "auto" }}>
        {bids.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-secondary-light)", fontSize: "13px" }}>
            No bids placed yet. Bids will appear here in real-time.
          </div>
        ) : (
          bids.map((bid, index) => {
            const teamName = bid.teamId?.name || "Unknown";
            const teamShort = bid.teamId?.short || teamName.slice(0, 2).toUpperCase();
            const teamId = bid.teamId?._id || bid.teamId;
            const time = bid.timestamp
              ? new Date(bid.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
              : "";
            const color = getTeamColor(teamId);

            return (
              <div
                key={bid._id || index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr auto auto",
                  alignItems: "center",
                  gap: "10px",
                  padding: "13px 0",
                  borderBottom: index < bids.length - 1 ? "1px solid color-mix(in srgb, var(--border-light) 50%, transparent)" : "none",
                }}
              >
                <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap", fontWeight: "500" }}>
                  {time}
                </span>

                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  background: color, display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "10px", fontWeight: "800", flexShrink: 0,
                }}>
                  {teamShort.slice(0, 2)}
                </div>

                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary-light)" }}>
                  {teamName}
                </span>

                <span style={{ fontSize: "12px", color: "var(--text-secondary-light)", fontStyle: "italic", fontWeight: "500" }}>
                  bid
                </span>

                <span style={{ fontSize: "14px", fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>
                  {formatCurrency(bid.amount)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
