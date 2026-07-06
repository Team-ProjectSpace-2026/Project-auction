import { useState } from "react";
import { useAuction } from "../../context/AuctionContext";

const quickBids = [1000, 2000, 5000, 10000, 20000, 50000];

const BidControls = () => {
  const { currentBid, currentPlayer, teams, placeBid, markSold, markUnsold, auctionStatus } = useAuction();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const currentAmount = currentBid?.amount || 0;

  const handleQuickBid = (amount) => {
    if (!selectedTeamId || !currentPlayer) return;
    const totalBid = currentAmount + amount;
    placeBid(totalBid, selectedTeamId, currentPlayer._id);
  };

  const handleCustomBid = () => {
    const amount = parseInt(customAmount, 10);
    if (!amount || !selectedTeamId || !currentPlayer) return;
    placeBid(amount, selectedTeamId, currentPlayer._id);
    setCustomAmount("");
  };

  const handleMarkSold = () => {
    if (!currentPlayer) return;
    markSold(currentPlayer._id);
  };

  const handleMarkUnsold = () => {
    if (!currentPlayer) return;
    markUnsold(currentPlayer._id);
  };

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
      {/* Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
        <button
          onClick={handleMarkSold}
          disabled={!isBidding || !currentBid}
          className="auction-action-card"
          style={{
            background: "#fef9e7",
            border: "1.5px solid #f5e6a3",
            borderRadius: "10px",
            padding: "10px 12px",
            cursor: !isBidding || !currentBid ? "not-allowed" : "pointer",
            opacity: !isBidding || !currentBid ? 0.5 : 1,
            textAlign: "left",
            transition: "all 0.2s ease",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <div style={{ fontSize: "16px" }}>&#128296;</div>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#b8860b" }}>SOLD</div>
          <div style={{ fontSize: "9px", color: "#8a7a4a", fontWeight: "500" }}>Player sold to highest bidder</div>
        </button>

        <button
          onClick={handleMarkUnsold}
          disabled={!isBidding}
          className="auction-action-card"
          style={{
            background: "var(--card-bg-light)",
            border: "1.5px solid var(--border-light)",
            borderRadius: "10px",
            padding: "10px 12px",
            cursor: !isBidding ? "not-allowed" : "pointer",
            opacity: !isBidding ? 0.5 : 1,
            textAlign: "left",
            transition: "all 0.2s ease",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <div style={{ fontSize: "16px" }}>&#10060;</div>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#dc2626" }}>UNSOLD</div>
          <div style={{ fontSize: "9px", color: "var(--text-secondary-light)", fontWeight: "500" }}>Player goes unsold</div>
        </button>

        <div style={{
          padding: "8px",
          border: "1.5px dashed var(--accent-light)",
          borderRadius: "10px",
          background: "color-mix(in srgb, var(--accent-light) 8%, transparent)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent-light)", textAlign: "center" }}>Custom Bid</div>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Amount"
            disabled={!isBidding}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid var(--border-light)",
              borderRadius: "6px",
              fontSize: "12px",
              background: "var(--card-bg-light)",
              color: "var(--text-primary-light)",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleCustomBid}
            disabled={!isBidding || !customAmount || !selectedTeamId}
            style={{
              padding: "6px",
              background: "var(--accent-light)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: !isBidding || !customAmount || !selectedTeamId ? "not-allowed" : "pointer",
              opacity: !isBidding || !customAmount || !selectedTeamId ? 0.5 : 1,
            }}
          >
            Place Bid
          </button>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}>
          {quickBids.slice(0, 2).map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickBid(amount)}
              disabled={!isBidding || !selectedTeamId}
              className="auction-action-card"
              style={{
                background: "var(--accent-light)",
                border: "1.5px solid var(--accent-light)",
                borderRadius: "8px",
                padding: "6px 8px",
                cursor: !isBidding || !selectedTeamId ? "not-allowed" : "pointer",
                opacity: !isBidding || !selectedTeamId ? 0.5 : 1,
                color: "#fff",
                fontSize: "11px",
                fontWeight: "700",
                transition: "all 0.2s ease",
              }}
            >
              +₹{amount.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Bid Row */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {quickBids.map((amount) => (
          <button
            key={amount}
            onClick={() => handleQuickBid(amount)}
            disabled={!isBidding || !selectedTeamId}
            className="auction-quick-bid"
            style={{
              padding: "8px 14px",
              border: "1.5px dashed var(--accent-light)",
              borderRadius: "8px",
              background: "color-mix(in srgb, var(--accent-light) 8%, transparent)",
              color: "var(--accent-light)",
              cursor: !isBidding || !selectedTeamId ? "not-allowed" : "pointer",
              opacity: !isBidding || !selectedTeamId ? 0.5 : 1,
              fontSize: "12px",
              fontWeight: "600",
              transition: "all 0.2s ease",
            }}
          >
            +₹{amount.toLocaleString("en-IN")}
          </button>
        ))}
      </div>

      {/* Team Selection */}
      {isBidding && (
        <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", marginBottom: "8px" }}>
            Select Team to Bid For
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {teams.map((team) => (
              <button
                key={team._id}
                onClick={() => setSelectedTeamId(team._id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: selectedTeamId === team._id ? "2px solid var(--accent-light)" : "1px solid var(--border-light)",
                  background: selectedTeamId === team._id ? "color-mix(in srgb, var(--accent-light) 10%, transparent)" : "var(--card-bg-light)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: selectedTeamId === team._id ? "var(--accent-light)" : "var(--text-primary-light)",
                  transition: "all 0.2s ease",
                }}
              >
                {team.short || team.name?.slice(0, 3).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BidControls;
