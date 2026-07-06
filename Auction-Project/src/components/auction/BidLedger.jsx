import { useAuction } from "../../context/AuctionContext";
import { formatCurrency } from "../../utils/formatCurrency";

const BidLedger = () => {
  const { bids, currentPlayer } = useAuction();

  const playerBids = currentPlayer
    ? bids.filter((b) => {
        const pid = b.playerId?._id || b.playerId;
        return pid === currentPlayer._id;
      })
    : [];

  return (
    <div style={{
      background: "var(--card-bg-light)",
      borderRadius: "16px",
      border: "1px solid var(--border-light)",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      transition: "background-color 0.2s ease, border-color 0.2s ease",
      maxHeight: "300px",
      overflowY: "auto",
    }}>
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary-light)", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
        Bid Ledger
      </h3>

      {playerBids.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-secondary-light)", fontSize: "13px" }}>
          No bids yet for this player
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 90px 70px",
            padding: "8px 0",
            borderBottom: "1.5px solid var(--border-light)",
            marginBottom: "4px",
          }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase" }}>Time</div>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase" }}>Team</div>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", textAlign: "right" }}>Amount</div>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", textAlign: "right" }}>Status</div>
          </div>

          {playerBids.map((bid, index) => {
            const teamName = bid.teamId?.name || "Unknown";
            const teamShort = bid.teamId?.short || teamName.slice(0, 2).toUpperCase();
            const time = bid.timestamp ? new Date(bid.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
            const isActive = bid.status === "Active";
            const isWon = bid.status === "Won" || bid.isWinningBid;

            return (
              <div
                key={bid._id || index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 90px 70px",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: index < playerBids.length - 1 ? "1px solid color-mix(in srgb, var(--border-light) 50%, transparent)" : "none",
                  background: isWon ? "color-mix(in srgb, #16a34a 5%, transparent)" : "transparent",
                  borderRadius: "6px",
                  paddingLeft: "6px",
                  paddingRight: "6px",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--text-secondary-light)", fontWeight: "500" }}>
                  {time}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: isActive ? "#2563eb" : isWon ? "#16a34a" : "#94a3b8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "9px", fontWeight: "800", flexShrink: 0,
                  }}>
                    {teamShort.slice(0, 2)}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary-light)" }}>
                    {teamName}
                  </span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: "800", color: isWon ? "#16a34a" : "#d97706", textAlign: "right" }}>
                  {formatCurrency(bid.amount)}
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: "600", textAlign: "right",
                  color: isWon ? "#16a34a" : isActive ? "#2563eb" : "#94a3b8",
                  textTransform: "uppercase",
                }}>
                  {isWon ? "Won" : isActive ? "Active" : bid.status || "Outbid"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BidLedger;
