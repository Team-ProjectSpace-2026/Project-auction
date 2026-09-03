import { useState, useRef, useEffect } from "react";
import { useAuction } from "../../context/AuctionContext";

const TEAM_COLORS = [
  "#2563eb", "#16a34a", "#7c3aed", "#d97706",
  "#dc2626", "#0891b2", "#e11d48", "#4f46e5",
];

const BidControls = () => {
  const { currentBid, currentPlayer, teams, placeBid, markSold, markUnsold, auctionStatus, tournament } = useAuction();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const triggerCooldown = (ms = 600) => {
    setIsCooldown(true);
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => {
      setIsCooldown(false);
    }, ms);
  };

  const currentAmount = currentBid?.amount || 0;

  const handleCustomBid = () => {
    if (isCooldown) return;
    const amount = parseInt(customAmount, 10);
    if (!amount || !selectedTeamId || !currentPlayer) return;
    triggerCooldown(600);
    placeBid(amount, selectedTeamId, currentPlayer._id);
    setCustomAmount("");
  };

  const handleRaiseBid = () => {
    if (isCooldown) return;
    if (!selectedTeamId || !currentPlayer) return;
    const playerBasePrice = currentPlayer.basePrice || 0;
    const tournamentBasePrice = tournament?.playerBasePrice || 0;
    const effectiveBasePrice = playerBasePrice > 0 ? playerBasePrice : tournamentBasePrice;
    const increment = effectiveBasePrice > 0 ? effectiveBasePrice : 1000;
    const raiseAmount = currentAmount > 0 ? currentAmount + increment : increment;
    triggerCooldown(600);
    placeBid(raiseAmount, selectedTeamId, currentPlayer._id);
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
            disabled={!isBidding || isCooldown}
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
            disabled={!isBidding || !customAmount || !selectedTeamId || isCooldown}
            style={{
              padding: "6px",
              background: isCooldown ? "#64748b" : "var(--accent-light)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: !isBidding || !customAmount || !selectedTeamId || isCooldown ? "not-allowed" : "pointer",
              opacity: !isBidding || !customAmount || !selectedTeamId || isCooldown ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {isCooldown ? "Wait..." : "Place Bid"}
          </button>
        </div>

        <button
          onClick={handleRaiseBid}
          disabled={!isBidding || !selectedTeamId || isCooldown}
          style={{
            background: isCooldown ? "#64748b" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            cursor: !isBidding || !selectedTeamId || isCooldown ? "not-allowed" : "pointer",
            opacity: !isBidding || !selectedTeamId || isCooldown ? 0.6 : 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ fontSize: "20px" }}>{isCooldown ? "⏳" : "🔨"}</div>
          <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.5px" }}>
            {isCooldown ? "WAIT..." : "RAISE BID"}
          </div>
          <div style={{ fontSize: "9px", fontWeight: "500", opacity: 0.8 }}>
            {isCooldown ? "Cooldown active" : "Increase the bid"}
          </div>
        </button>
      </div>

      {/* Team Selection */}
      {isBidding && (
        <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
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

              const currentBidTeamId = currentBid && currentBid.teamId
                ? (typeof currentBid.teamId === 'object' ? currentBid.teamId._id : currentBid.teamId)
                : null;
              const isCurrentBidder = currentBidTeamId && String(currentBidTeamId) === String(team._id);
              const activeBidAmount = isCurrentBidder ? (currentBid.amount || 0) : 0;
              const liveRemainingBudget = Math.max(0, (team.remainingBudget || 0) - activeBidAmount);

              return (
                <div
                  key={team._id}
                  onClick={() => setSelectedTeamId(team._id)}
                  style={{
                    border: isSelected ? "2.5px solid var(--accent-light)" : "1.5px solid var(--border-light)",
                    borderRadius: "12px",
                    padding: "14px 10px 10px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: isSelected ? "color-mix(in srgb, var(--accent-light) 8%, transparent)" : "var(--card-bg-light)",
                    minWidth: "105px",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    background: team.primaryColor || color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "12px", fontWeight: "800",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}>
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: isSelected ? "var(--accent-light)" : "var(--text-primary-light)", lineHeight: "1.3" }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: "10px", color: isCurrentBidder ? "#d97706" : "var(--text-secondary-light)", fontWeight: isCurrentBidder ? "700" : "500" }}>
                    {team.remainingBudget != null ? `₹${liveRemainingBudget.toLocaleString("en-IN")}` : ""}
                    {isCurrentBidder && activeBidAmount > 0 && ` (-₹${activeBidAmount.toLocaleString("en-IN")})`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BidControls;
