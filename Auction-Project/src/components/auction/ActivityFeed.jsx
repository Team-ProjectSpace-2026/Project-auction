import { useMemo } from "react";
import { useAuction } from "../../context/AuctionContext";
import { formatCurrency } from "../../utils/formatCurrency";

const TEAM_COLORS = [
  "#2563eb", "#16a34a", "#7c3aed", "#d97706",
  "#dc2626", "#0891b2", "#e11d48", "#4f46e5",
];

const ActivityFeed = () => {
  const { bids, teams, currentPlayer } = useAuction();

  const getTeamColor = (teamId) => {
    const idx = teams.findIndex((t) => t._id === teamId);
    return TEAM_COLORS[(idx >= 0 ? idx : 0) % TEAM_COLORS.length];
  };

  // Show latest live bids (newest at index 0). If currentPlayer is active, filter for current player's bids.
  const displayBids = useMemo(() => {
    if (!bids || bids.length === 0) return [];
    if (currentPlayer?._id) {
      const curId = String(currentPlayer._id);
      const playerBids = bids.filter((b) => {
        const bidPid = b.playerId?._id || b.playerId;
        return bidPid && String(bidPid) === curId;
      });
      if (playerBids.length > 0) return playerBids.slice(0, 10);
    }
    return bids.slice(0, 10);
  }, [bids, currentPlayer]);

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "9px", height: "9px", borderRadius: "50%",
            background: "#ef4444", display: "inline-block",
            animation: "livePulse 1.5s ease-in-out infinite",
          }} />
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--text-primary-light)" }}>Live Bidding Feed</h3>
        </div>
        {currentPlayer?.name && (
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary-light)", background: "color-mix(in srgb, var(--accent-light, #2563eb) 8%, transparent)", padding: "2px 8px", borderRadius: "6px" }}>
            {currentPlayer.name}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxHeight: "400px", overflowY: "auto" }}>
        {displayBids.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-secondary-light)", fontSize: "13px" }}>
            {currentPlayer ? `No bids placed for ${currentPlayer.name} yet.` : "No bids placed yet. Bids will appear here in real-time."}
          </div>
        ) : (
          displayBids.map((bid, index) => {
            const teamId = bid.teamId?._id || bid.teamId;
            const matchedTeam = teams.find((t) => t._id === teamId);
            const teamName = bid.teamId?.name || matchedTeam?.name || "Unknown";
            const teamShort = bid.teamId?.short || matchedTeam?.short || teamName.slice(0, 2).toUpperCase();
            const time = bid.timestamp
              ? new Date(bid.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "";
            const color = getTeamColor(teamId);
            const isLatest = index === 0;

            return (
              <div
                key={bid._id || index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr auto auto",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 8px",
                  borderRadius: "8px",
                  background: isLatest ? "color-mix(in srgb, var(--accent-light, #2563eb) 5%, transparent)" : "transparent",
                  borderBottom: index < displayBids.length - 1 ? "1px solid color-mix(in srgb, var(--border-light) 50%, transparent)" : "none",
                  transition: "background 0.3s ease",
                }}
              >
                <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", fontWeight: "500" }}>
                  {time}
                </span>

                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: color, display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "10px", fontWeight: "800", flexShrink: 0,
                }}>
                  {teamShort.slice(0, 2)}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                  <span style={{ fontSize: "13px", fontWeight: isLatest ? "700" : "600", color: "var(--text-primary-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {teamName}
                  </span>
                  {isLatest && (
                    <span style={{
                      fontSize: "9px",
                      fontWeight: "800",
                      background: "#16a34a",
                      color: "#fff",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      letterSpacing: "0.3px",
                      textTransform: "uppercase"
                    }}>
                      LATEST
                    </span>
                  )}
                </div>

                <span style={{ fontSize: "11px", color: "var(--text-secondary-light)", fontStyle: "italic", fontWeight: "500" }}>
                  bid
                </span>

                <span style={{ fontSize: "14px", fontWeight: "800", color: isLatest ? "#2563eb" : "#d97706", whiteSpace: "nowrap" }}>
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
