import { useState, useRef, useEffect } from "react";
import { useAuction } from "../../context/AuctionContext";

const TEAM_COLORS = [
  "#2563eb", "#16a34a", "#7c3aed", "#d97706",
  "#dc2626", "#0891b2", "#e11d48", "#4f46e5",
];

const BidControls = () => {
  const {
    currentBid,
    currentPlayer,
    teams,
    placeBid,
    markSold,
    markUnsold,
    auctionStatus,
    tournament,
    teamEligibility,
  } = useAuction();
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
  const playerBasePrice = currentPlayer?.basePrice || 0;
  const tournamentBasePrice = tournament?.playerBasePrice || 0;
  const effectiveBasePrice = playerBasePrice > 0 ? playerBasePrice : tournamentBasePrice;
  const increment = effectiveBasePrice > 0 ? effectiveBasePrice : 1000;
  const raiseAmount = currentAmount > 0 ? currentAmount + increment : increment;

  const selectedTeamEligibility = selectedTeamId ? teamEligibility?.[selectedTeamId] : null;
  const canSelectedTeamBid = selectedTeamEligibility ? selectedTeamEligibility.canBid : true;
  const maxBidForSelectedTeam = selectedTeamEligibility ? selectedTeamEligibility.maxBid : null;
  const disqualificationReason = selectedTeamEligibility && !selectedTeamEligibility.canBid
    ? (selectedTeamEligibility.reason || "Team cannot bid")
    : null;

  const selectedTeam = selectedTeamId ? teams?.find((t) => t._id === selectedTeamId) : null;
  const targetSquad = tournament?.maxPlayersPerTeam || 15;
  const currentSquadCount = selectedTeam ? (selectedTeam.squad?.length || selectedTeam.players?.length || 0) : 0;
  const slotsNeededAfterThis = Math.max(0, targetSquad - currentSquadCount - 1);
  const reserveNeeded = slotsNeededAfterThis * (effectiveBasePrice > 0 ? effectiveBasePrice : 100);

  const customNum = parseInt(customAmount, 10);
  const isCustomExceedingCap = Boolean(
    customNum && maxBidForSelectedTeam !== null && customNum > maxBidForSelectedTeam
  );
  const isCustomBelowBase = Boolean(
    customNum && effectiveBasePrice > 0 && customNum < effectiveBasePrice
  );

  const handleCustomBid = () => {
    if (isCooldown) return;
    const amount = parseInt(customAmount, 10);
    if (!amount || !selectedTeamId || !currentPlayer) return;
    if (maxBidForSelectedTeam !== null && amount > maxBidForSelectedTeam) return;
    if (effectiveBasePrice > 0 && amount < effectiveBasePrice) return;
    triggerCooldown(600);
    placeBid(amount, selectedTeamId, currentPlayer._id);
    setCustomAmount("");
  };

  const handleRaiseBid = () => {
    if (isCooldown) return;
    if (!selectedTeamId || !currentPlayer) return;
    if (!canSelectedTeamBid) return;
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
          border: isCustomExceedingCap ? "1.5px dashed #ef4444" : "1.5px dashed var(--accent-light)",
          borderRadius: "10px",
          background: isCustomExceedingCap ? "#fef2f2" : "color-mix(in srgb, var(--accent-light) 8%, transparent)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: isCustomExceedingCap ? "#dc2626" : "var(--accent-light)", textAlign: "center" }}>
            {isCustomExceedingCap ? "Exceeds Max Cap!" : "Custom Bid"}
          </div>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder={maxBidForSelectedTeam != null ? `Max: ₹${maxBidForSelectedTeam.toLocaleString("en-IN")}` : "Amount"}
            disabled={!isBidding || isCooldown || !canSelectedTeamBid}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: `1px solid ${isCustomExceedingCap ? "#fca5a5" : "var(--border-light)"}`,
              borderRadius: "6px",
              fontSize: "12px",
              background: "var(--card-bg-light)",
              color: "var(--text-primary-light)",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleCustomBid}
            disabled={!isBidding || !customAmount || !selectedTeamId || isCooldown || isCustomExceedingCap || isCustomBelowBase || !canSelectedTeamBid}
            title={isCustomExceedingCap ? `Cannot exceed max legal bid of ₹${maxBidForSelectedTeam?.toLocaleString("en-IN")}` : disqualificationReason || ""}
            style={{
              padding: "6px",
              background: (isCooldown || isCustomExceedingCap || !canSelectedTeamBid) ? "#94a3b8" : "var(--accent-light)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: (!isBidding || !customAmount || !selectedTeamId || isCooldown || isCustomExceedingCap || isCustomBelowBase || !canSelectedTeamBid) ? "not-allowed" : "pointer",
              opacity: (!isBidding || !customAmount || !selectedTeamId || isCooldown || isCustomExceedingCap || isCustomBelowBase || !canSelectedTeamBid) ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {isCooldown ? "Wait..." : isCustomExceedingCap ? "Exceeds Cap" : "Place Bid"}
          </button>
        </div>

        <button
          onClick={handleRaiseBid}
          disabled={!isBidding || !selectedTeamId || isCooldown || !canSelectedTeamBid}
          title={disqualificationReason || (maxBidForSelectedTeam != null ? `Max legal bid: ₹${maxBidForSelectedTeam.toLocaleString("en-IN")}` : "")}
          style={{
            background: (!canSelectedTeamBid && selectedTeamId)
              ? "linear-gradient(135deg, #475569, #334155)"
              : (isCooldown ? "#64748b" : "linear-gradient(135deg, #2563eb, #1d4ed8)"),
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            cursor: (!isBidding || !selectedTeamId || isCooldown || !canSelectedTeamBid) ? "not-allowed" : "pointer",
            opacity: (!isBidding || !selectedTeamId || isCooldown) ? 0.6 : 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            transition: "all 0.2s ease",
            boxShadow: canSelectedTeamBid && selectedTeamId ? "0 4px 12px rgba(37,99,235,0.2)" : "none",
          }}
        >
          <div style={{ fontSize: "20px" }}>{!canSelectedTeamBid && selectedTeamId ? "🔒" : (isCooldown ? "⏳" : "🔨")}</div>
          <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "0.5px" }}>
            {!selectedTeamId
              ? "SELECT TEAM"
              : (!canSelectedTeamBid
                ? "LIMIT REACHED"
                : (isCooldown ? "WAIT..." : `RAISE TO ₹${raiseAmount.toLocaleString("en-IN")}`))}
          </div>
          <div style={{ fontSize: "9px", fontWeight: "500", opacity: 0.9, textAlign: "center", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {!canSelectedTeamBid && selectedTeamId
              ? (maxBidForSelectedTeam != null ? `Cap: ₹${maxBidForSelectedTeam.toLocaleString("en-IN")}` : "Purse limit")
              : (isCooldown ? "Cooldown active" : (maxBidForSelectedTeam != null ? `Cap: ₹${maxBidForSelectedTeam.toLocaleString("en-IN")}` : "Increase the bid"))}
          </div>
        </button>
      </div>

      {/* Idea 1: IPL Broadcast "Purse Tracker" Pill */}
      {selectedTeam && (
        <div style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px 12px",
          background: !canSelectedTeamBid
            ? "color-mix(in srgb, #f59e0b 8%, var(--card-bg-light))"
            : "color-mix(in srgb, var(--accent-light, #2563eb) 6%, var(--card-bg-light))",
          border: !canSelectedTeamBid ? "1.5px solid #f59e0b" : "1px solid var(--border-light)",
          borderRadius: "12px",
          padding: "9px 14px",
          marginBottom: "14px",
          fontSize: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: !canSelectedTeamBid
              ? "linear-gradient(135deg, #d97706, #b45309)"
              : "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: "6px",
            fontWeight: "800",
            fontSize: "10px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}>
            <span>{!canSelectedTeamBid ? "🛡️ PURSE CAP" : "⚡ PURSE INFO"}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary-light)", fontWeight: "600" }}>
            <span>{selectedTeam.name}</span>
            <span style={{ color: "var(--text-secondary-light)", fontWeight: "400" }}>•</span>
            <span>
              Max Legal Bid: <strong style={{ color: !canSelectedTeamBid ? "#d97706" : "#2563eb", fontWeight: "800" }}>
                ₹{maxBidForSelectedTeam != null ? maxBidForSelectedTeam.toLocaleString("en-IN") : "—"}
              </strong>
            </span>
          </div>

          {slotsNeededAfterThis > 0 && (
            <div style={{ color: "var(--text-secondary-light)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}>
              <span>🔒 ₹{reserveNeeded.toLocaleString("en-IN")} held for {slotsNeededAfterThis} remaining slot{slotsNeededAfterThis > 1 ? 's' : ''}</span>
            </div>
          )}

          {!canSelectedTeamBid && disqualificationReason && (
            <div style={{ width: "100%", fontSize: "11px", color: "#b45309", fontWeight: "500", borderTop: "1px dashed #fcd34d", paddingTop: "5px", marginTop: "2px" }}>
              ℹ️ {disqualificationReason}
            </div>
          )}
        </div>
      )}

      {/* Team Selection */}
      {(isBidding || (teams && teams.length > 0)) && (
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

              const teamElig = teamEligibility?.[team._id];
              const teamCanBid = teamElig ? teamElig.canBid : true;
              const teamMaxBid = teamElig?.maxBid;
              const teamReason = teamElig?.reason;

              return (
                <div
                  key={team._id}
                  onClick={() => setSelectedTeamId(team._id)}
                  title={!teamCanBid ? teamReason || "Cannot bid on this player" : `Max legal bid: ₹${teamMaxBid != null ? teamMaxBid.toLocaleString("en-IN") : liveRemainingBudget.toLocaleString("en-IN")}`}
                  style={{
                    border: isSelected
                      ? (!teamCanBid ? "2.5px solid #ef4444" : "2.5px solid var(--accent-light)")
                      : (!teamCanBid ? "1.5px dashed #fca5a5" : "1.5px solid var(--border-light)"),
                    borderRadius: "12px",
                    padding: "14px 10px 10px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: isSelected
                      ? (!teamCanBid ? "#fef2f2" : "color-mix(in srgb, var(--accent-light) 8%, transparent)")
                      : (!teamCanBid ? "#fff8f8" : "var(--card-bg-light)"),
                    minWidth: "115px",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                    opacity: !teamCanBid ? 0.8 : 1,
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
                  {teamElig && (
                    <div style={{
                      fontSize: "9px",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      background: !teamCanBid ? "#fee2e2" : "#ecfdf5",
                      color: !teamCanBid ? "#b91c1c" : "#047857",
                      whiteSpace: "nowrap",
                    }}>
                      {!teamCanBid ? "⛔ Locked" : `Cap: ₹${teamMaxBid?.toLocaleString("en-IN")}`}
                    </div>
                  )}
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
