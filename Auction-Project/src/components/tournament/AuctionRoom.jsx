import { useState, useCallback, useMemo } from "react";
import { useAuction } from "../../context/AuctionContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import PlayerRevealModal from "./PlayerRevealModal";
import AuctionResultModal from "./AuctionResultModal";
import AuctionConcludedModal from "./AuctionConcludedModal";
import BidControls from "../auction/BidControls";
import ActivityFeed from "../auction/ActivityFeed";

import cricLogo from "../../assets/cricauctionlogo1.png";

const TEAM_COLORS = [
  "#2563eb", "#16a34a", "#7c3aed", "#d97706",
  "#dc2626", "#0891b2", "#e11d48", "#4f46e5",
];

const AuctionRoom = () => {
  const {
    currentPlayer,
    currentBid,
    highestBidder,
    teams,
    players,
    soldInfo,
    unsoldInfo,
    isConnected,
    connectionError,
    error,
    tournamentId,
    clearSoldInfo,
    clearUnsoldInfo,
    clearError,
    tournament,
    reauctionUnsold,
  } = useAuction();

  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showConcludedModal, setShowConcludedModal] = useState(false);

  // Compute whether all players have been auctioned (sold or unsold)
  const allPlayersCompleted = useMemo(() => {
    if (!players || players.length === 0) return false;
    return players.every((p) => p.isSold || p.isUnsold);
  }, [players]);

  // Count unauctioned players
  const unauctionedCount = useMemo(() => {
    if (!players || players.length === 0) return 0;
    return players.filter((p) => !p.isSold && !p.isUnsold).length;
  }, [players]);

  // Count unsold players available for re-auction
  const unsoldPlayersCount = useMemo(() => {
    if (!players || players.length === 0) return 0;
    return players.filter((p) => !p.isSold && p.isUnsold).length;
  }, [players]);

  // Check if the current player is the last available player
  const isLastPlayer = useMemo(() => {
    if (!players || players.length === 0) return false;
    const remaining = players.filter((p) => !p.isSold && !p.isUnsold);
    if (remaining.length === 0) return true;
    if (remaining.length === 1 && currentPlayer && String(remaining[0]._id) === String(currentPlayer._id)) return true;
    return false;
  }, [players, currentPlayer]);

  const handleReauction = useCallback(() => {
    setShowConcludedModal(false);
    clearSoldInfo();
    clearUnsoldInfo();
    reauctionUnsold();
    setShowRevealModal(true);
  }, [clearSoldInfo, clearUnsoldInfo, reauctionUnsold]);

  const handleRevealNext = useCallback(() => {
    clearSoldInfo();
    clearUnsoldInfo();
    if (isLastPlayer || allPlayersCompleted || unauctionedCount === 0) {
      setShowConcludedModal(true);
    } else {
      setShowRevealModal(true);
    }
  }, [clearSoldInfo, clearUnsoldInfo, isLastPlayer, allPlayersCompleted, unauctionedCount]);

  const handleRevealContinue = useCallback(() => {
    setShowRevealModal(false);
  }, []);

  const highestBidderName = highestBidder?.name || "No bids yet";
  const highestBidderShort = highestBidder?.short || highestBidderName.slice(0, 2).toUpperCase();
  const currentPlayerName = currentPlayer?.name || "No Player Selected";
  const currentPlayerRole = currentPlayer?.role || "";
  const currentAmount = currentBid?.amount || 0;
  const playerBasePrice = currentPlayer?.basePrice || 0;
  const tournamentBasePrice = tournament?.playerBasePrice || 0;
  const basePrice = playerBasePrice > 0 ? playerBasePrice : tournamentBasePrice;

  const getTeamColor = (idx) => TEAM_COLORS[idx % TEAM_COLORS.length];

  return (
    <div className="auction-screen" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "4px 0" }}>
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        .auction-action-card:hover { opacity: 0.9; }
      `}</style>

      {!isConnected && (
        <div style={{
          background: connectionError ? "#fef2f2" : "#fef9e7",
          border: `1px solid ${connectionError ? "#fecaca" : "#f5e6a3"}`,
          borderRadius: "10px",
          padding: "10px 16px",
          fontSize: "13px",
          fontWeight: "600",
          color: connectionError ? "#dc2626" : "#b8860b",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{ fontSize: "16px" }}>{connectionError ? "!" : "~"}</span>
          {connectionError || "Connecting to auction server..."}
        </div>
      )}

      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "10px",
          padding: "10px 16px",
          fontSize: "13px",
          fontWeight: "600",
          color: "#dc2626",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>!</span>
            {error}
          </span>
          <button
            onClick={clearError}
            style={{
              border: "none",
              background: "transparent",
              color: "#dc2626",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Auction Concluded or Reveal Next Player Banner when no active player */}
      {!currentPlayer && (
        <div style={{
          background: (allPlayersCompleted || unauctionedCount === 0)
            ? "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(37,99,235,0.08) 100%)"
            : "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.04) 100%)",
          border: (allPlayersCompleted || unauctionedCount === 0)
            ? "1.5px solid rgba(245,158,11,0.4)"
            : "1.5px solid rgba(37,99,235,0.25)",
          borderRadius: "16px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: (allPlayersCompleted || unauctionedCount === 0)
                ? "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.3))"
                : "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(29,78,216,0.3))",
              border: (allPlayersCompleted || unauctionedCount === 0)
                ? "1.5px solid rgba(245,158,11,0.5)"
                : "1.5px solid rgba(37,99,235,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px",
            }}>
              {(allPlayersCompleted || unauctionedCount === 0) ? "🏆" : "⚡"}
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary-light)", marginBottom: "2px" }}>
                {(allPlayersCompleted || unauctionedCount === 0)
                  ? "Auction Completed!"
                  : unauctionedCount === 1
                  ? "1 Final Player Remaining!"
                  : `${unauctionedCount} Players Waiting for Auction`}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary-light)" }}>
                {(allPlayersCompleted || unauctionedCount === 0)
                  ? `All ${players?.length || 0} players have been auctioned. View the grand finale summary.`
                  : "Click reveal to shuffle and bring the next player to the live auction."}
              </div>
            </div>
          </div>
          {(allPlayersCompleted || unauctionedCount === 0) ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {unsoldPlayersCount > 0 && (
                <button
                  onClick={handleReauction}
                  style={{
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 14px rgba(234,88,12,0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  🔄 Re-auction Unsold ({unsoldPlayersCount})
                </button>
              )}
              <button
                onClick={() => setShowConcludedModal(true)}
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#000",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                🏆 View Grand Finale
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRevealModal(true)}
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                transition: "all 0.2s ease",
              }}
            >
              ⚡ {unauctionedCount === 1 ? "Reveal Final Player" : "Reveal Next Player"}
            </button>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px" }}>
          {/* Player Card */}
          <div style={{
            background: "var(--card-bg-light)",
            borderRadius: "20px",
            border: "1px solid var(--border-light)",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
          }}>
            {/* Blue accent header */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 40%, #60A5FA 70%, #DBEAFE 100%)",
              padding: "20px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}>
                  <img src={cricLogo} alt="CricAuctionHub" style={{ width: "100px", height: "100px", objectFit: "contain" }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>
                    {currentPlayerName.toUpperCase()}
                  </h2>
                  {currentPlayerRole && (
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.75)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      ✦ {currentPlayerRole}
                    </span>
                  )}
                </div>
              </div>
              <div style={{
                background: "var(--card-bg-light)",
                borderRadius: "12px",
                padding: "10px 20px",
                textAlign: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                transition: "background-color 0.2s ease",
              }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px", transition: "color 0.2s ease" }}>Base Price</div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--accent-light)", lineHeight: "1.2", transition: "color 0.2s ease" }}>{formatCurrency(basePrice)}</div>
              </div>
            </div>

            {/* Player Content */}
            <div style={{ display: "flex", gap: "32px", padding: "32px", alignItems: "flex-start" }}>
              {/* Photo */}
              <div style={{
                width: "240px",
                height: "300px",
                borderRadius: "16px",
                overflow: "hidden",
                flexShrink: 0,
                border: currentPlayer?.photo ? "3px solid var(--border-light)" : "2px dashed var(--border-light)",
                background: currentPlayer?.photo ? "transparent" : "color-mix(in srgb, var(--card-bg-light) 60%, var(--bg-primary-light))",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              }}>
                {currentPlayer?.photo ? (
                  <img src={playerPhotoUrl(currentPlayer.photo)} alt={currentPlayer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <span style={{ fontSize: "48px", opacity: 0.3 }}>&#127951;</span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary-light)", fontWeight: "500" }}>No Photo</span>
                  </>
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {currentPlayer?.battingStyle && (
                    <div style={{
                      background: "color-mix(in srgb, var(--accent-light) 6%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--accent-light) 15%, transparent)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                    }}>
                      <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>Batting Style</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary-light)" }}>{currentPlayer.battingStyle}</div>
                    </div>
                  )}
                  {currentPlayer?.bowlingStyle && currentPlayer.bowlingStyle !== "Not Applicable" && (
                    <div style={{
                      background: "color-mix(in srgb, var(--accent-light) 6%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--accent-light) 15%, transparent)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                    }}>
                      <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>Bowling Style</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary-light)" }}>{currentPlayer.bowlingStyle}</div>
                    </div>
                  )}
                  {currentPlayer?.keeper && (
                    <div style={{
                      background: "rgba(124, 58, 237, 0.06)",
                      border: "1px solid rgba(124, 58, 237, 0.15)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                    }}>
                      <div style={{ fontSize: "9px", fontWeight: "700", color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>Role</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#7C3AED" }}>Wicket Keeper</div>
                    </div>
                  )}
                </div>

                {/* Info Row */}
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {currentPlayer?.age && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 14px",
                      background: "color-mix(in srgb, var(--card-bg-light) 60%, var(--bg-primary-light))",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)",
                    }}>
                      <span style={{ fontSize: "14px" }}>&#128100;</span>
                      <div>
                        <div style={{ fontSize: "9px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Age</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary-light)" }}>{currentPlayer.age} YRS</div>
                      </div>
                    </div>
                  )}
                  {currentPlayer?.mobile && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 14px",
                      background: "color-mix(in srgb, var(--card-bg-light) 60%, var(--bg-primary-light))",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)",
                    }}>
                      <span style={{ fontSize: "14px" }}>&#128222;</span>
                      <div>
                        <div style={{ fontSize: "9px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary-light)" }}>{currentPlayer.countryCode} {currentPlayer.mobile}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bid Stats */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                  marginTop: "8px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border-light)",
                }}>
                  <div style={{
                    background: "color-mix(in srgb, #94a3b8 8%, transparent)",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: highestBidder ? "#2563eb" : "#94a3b8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: "10px", fontWeight: "800",
                      }}>{highestBidderShort}</div>
                      <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Highest Bidder</div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary-light)" }}>{highestBidderName}</div>
                  </div>

                  <div style={{
                    background: "color-mix(in srgb, var(--accent-light) 6%, transparent)",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Base Price</div>
                    <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--accent-light)", lineHeight: "1.1" }}>{formatCurrency(basePrice)}</div>
                  </div>

                  <div style={{
                    background: "rgba(22, 163, 74, 0.06)",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "9px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Current Bid</div>
                    <div style={{ fontSize: "28px", fontWeight: "800", color: "#16a34a", lineHeight: "1.1" }}>{formatCurrency(currentAmount)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: "var(--card-bg-light)",
            borderRadius: "16px",
            border: "1px solid var(--border-light)",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
            display: "flex",
            flexDirection: "column",
          }}>
            <h3 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-primary-light)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>&#128176;</span> Team Budgets
            </h3>
            <p style={{ fontSize: "11px", color: "var(--text-secondary-light)", margin: "0 0 16px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Overview</p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.2fr 0.8fr",
              padding: "8px 0",
              borderBottom: "1.5px solid var(--border-light)",
              marginBottom: "4px",
            }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Team</div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Budget</div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Players</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              {teams.map((team, index) => {
                const currentBidTeamId = currentBid && currentBid.teamId
                  ? (typeof currentBid.teamId === 'object' ? currentBid.teamId._id : currentBid.teamId)
                  : null;
                const isCurrentBidder = currentBidTeamId && String(currentBidTeamId) === String(team._id);
                const activeBidAmount = isCurrentBidder ? (currentBid.amount || 0) : 0;
                const liveRemainingBudget = Math.max(0, (team.remainingBudget || 0) - activeBidAmount);

                return (
                  <div key={team._id} style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.2fr 0.8fr",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < teams.length - 1 ? "1px solid color-mix(in srgb, var(--border-light) 50%, transparent)" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        background: team.primaryColor || getTeamColor(index), display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: "11px", fontWeight: "800", flexShrink: 0,
                        overflow: "hidden",
                      }}>
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          team.short || team.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary-light)" }}>{team.name}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: isCurrentBidder ? "#eab308" : "#16a34a", transition: "all 0.2s ease" }}>
                        {formatCurrency(liveRemainingBudget)}
                      </div>
                      {isCurrentBidder && activeBidAmount > 0 && (
                        <div style={{ fontSize: "10px", color: "#eab308", fontWeight: "700", letterSpacing: "0.2px" }}>
                          (-{formatCurrency(activeBidAmount)} live)
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary-light)", transition: "color 0.2s ease" }}>
                      {team.players || 0} / {team.maxPlayers || 18}
                    </div>
                  </div>
                );
              })}
              {teams.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-secondary-light)", fontSize: "13px" }}>
                  No teams loaded
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <BidControls />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <ActivityFeed />
          </div>
        </div>
      </div>

      {showRevealModal && (
        <PlayerRevealModal onClose={() => setShowRevealModal(false)} onContinue={handleRevealContinue} />
      )}

      {soldInfo && (() => {
        const foundTeam = teams.find(
          (t) =>
            String(t._id || t.id) === String(soldInfo.teamId) ||
            (t.name && soldInfo.teamName && t.name.trim().toLowerCase() === soldInfo.teamName.trim().toLowerCase()) ||
            (t.short && soldInfo.teamName && t.short.trim().toLowerCase() === soldInfo.teamName.trim().toLowerCase())
        );
        const winningTeam = foundTeam || {
          _id: soldInfo.teamId,
          name: soldInfo.teamName,
          short: soldInfo.teamShort || (soldInfo.teamName ? soldInfo.teamName.slice(0, 3).toUpperCase() : ""),
          logo: soldInfo.teamLogo,
          primaryColor: soldInfo.primaryColor,
          secondaryColor: soldInfo.secondaryColor,
        };
        return (
          <AuctionResultModal
            status="sold"
            playerName={soldInfo.playerName}
            playerRole={currentPlayer?.role}
            playerPhoto={currentPlayer?.photo}
            soldPrice={soldInfo.soldPrice}
            winningTeam={winningTeam}
            onClose={clearSoldInfo}
            onNextPlayer={handleRevealNext}
            isLastPlayer={isLastPlayer}
          />
        );
      })()}

      {unsoldInfo && (
        <AuctionResultModal
          status="unsold"
          playerName={unsoldInfo.playerName}
          playerRole={currentPlayer?.role}
          playerPhoto={currentPlayer?.photo}
          basePrice={basePrice}
          onClose={clearUnsoldInfo}
          onNextPlayer={handleRevealNext}
          isLastPlayer={isLastPlayer}
        />
      )}
      {showConcludedModal && (
        <AuctionConcludedModal
          onClose={() => setShowConcludedModal(false)}
          onReauction={handleReauction}
          tournamentId={tournamentId}
        />
      )}
    </div>
  );
};

export default AuctionRoom;
