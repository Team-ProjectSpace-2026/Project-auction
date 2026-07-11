import { useState, useCallback } from "react";
import { useAuction } from "../../context/AuctionContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import PlayerRevealModal from "./PlayerRevealModal";
import SoldPlayerModal from "./SoldPlayerModal";
import UnsoldPlayerModal from "./UnsoldPlayerModal";
import BidControls from "../auction/BidControls";
import ActivityFeed from "../auction/ActivityFeed";
import BidLedger from "../auction/BidLedger";

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
    soldInfo,
    unsoldInfo,
    isConnected,
    connectionError,
    error,
    clearSoldInfo,
    clearUnsoldInfo,
    clearError,
  } = useAuction();

  const [showRevealModal, setShowRevealModal] = useState(false);

  const handleRevealNext = useCallback(() => {
    clearSoldInfo();
    clearUnsoldInfo();
    setShowRevealModal(true);
  }, [clearSoldInfo, clearUnsoldInfo]);

  const handleRevealContinue = useCallback(() => {
    setShowRevealModal(false);
  }, []);

  const highestBidderName = highestBidder?.name || "No bids yet";
  const highestBidderShort = highestBidder?.short || highestBidderName.slice(0, 2).toUpperCase();
  const currentPlayerName = currentPlayer?.name || "No Player Selected";
  const currentPlayerRole = currentPlayer?.role || "";
  const currentAmount = currentBid?.amount || 0;
  const basePrice = currentPlayer?.basePrice || 0;

  const getTeamColor = (idx) => TEAM_COLORS[idx % TEAM_COLORS.length];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "4px 0" }}>
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

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px" }}>
          <div style={{
            background: "var(--card-bg-light)",
            borderRadius: "16px",
            border: "1px solid var(--border-light)",
            padding: "48px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ display: "flex", gap: "50px", alignItems: "stretch", flex: 1 }}>
              <div style={{
                width: "288px",
                height: "384px",
                borderRadius: "14px",
                border: currentPlayer?.photo ? "none" : "2px dashed var(--border-light)",
                background: currentPlayer?.photo ? "transparent" : "color-mix(in srgb, var(--card-bg-light) 60%, var(--bg-primary-light))",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                flexShrink: 0,
                overflow: "hidden",
              }}>
                {currentPlayer?.photo ? (
                  <img src={playerPhotoUrl(currentPlayer.photo)} alt={currentPlayer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <span style={{ fontSize: "48px", opacity: 0.4 }}>&#127951;</span>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary-light)", fontWeight: "500" }}>Player Photo</span>
                    <span style={{ fontSize: "20px", opacity: 0.3 }}>&#128247;</span>
                  </>
                )}
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ fontSize: "42px", fontWeight: "800", color: "var(--text-primary-light)", margin: 0, letterSpacing: "-0.5px", lineHeight: "1.1" }}>
                    {currentPlayerName.toUpperCase()}
                  </h1>

                  {/* Role Badge */}
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "10px",
                    marginBottom: "24px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1.5px solid var(--accent-light)",
                    background: "color-mix(in srgb, var(--accent-light) 8%, transparent)",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--accent-light)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    <span style={{ fontSize: "10px" }}>&#10022;</span>
                    {currentPlayerRole || "CRICKETER"}
                  </div>

                  {/* Important Details - Highlighted */}
                  <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {currentPlayer?.battingStyle && (
                      <div style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1.5px solid var(--accent-light)",
                        background: "color-mix(in srgb, var(--accent-light) 8%, transparent)",
                      }}>
                        <div style={{ fontSize: "9px", fontWeight: "600", color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Batting</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary-light)" }}>{currentPlayer.battingStyle}</div>
                      </div>
                    )}
                    {currentPlayer?.bowlingStyle && currentPlayer.bowlingStyle !== "Not Applicable" && (
                      <div style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1.5px solid var(--accent-light)",
                        background: "color-mix(in srgb, var(--accent-light) 8%, transparent)",
                      }}>
                        <div style={{ fontSize: "9px", fontWeight: "600", color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bowling</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary-light)" }}>{currentPlayer.bowlingStyle}</div>
                      </div>
                    )}
                    {currentPlayer?.style && (
                      <div style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1.5px solid var(--accent-light)",
                        background: "color-mix(in srgb, var(--accent-light) 8%, transparent)",
                      }}>
                        <div style={{ fontSize: "9px", fontWeight: "600", color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Style</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary-light)" }}>{currentPlayer.style}</div>
                      </div>
                    )}
                    {currentPlayer?.keeper && (
                      <div style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1.5px solid #7c3aed",
                        background: "rgba(124, 58, 237, 0.08)",
                      }}>
                        <div style={{ fontSize: "9px", fontWeight: "600", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.5px" }}>Role</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#7c3aed" }}>WK</div>
                      </div>
                    )}
                  </div>

                  {/* Other Details - Simple */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    {currentPlayer?.age && (
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", marginBottom: "2px", letterSpacing: "0.5px" }}>Age</div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary-light)" }}>{currentPlayer.age} YRS</div>
                      </div>
                    )}
                    {currentPlayer?.mobile && (
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", marginBottom: "2px", letterSpacing: "0.5px" }}>Mobile</div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary-light)" }}>{currentPlayer.countryCode} {currentPlayer.mobile}</div>
                      </div>
                    )}
                    {basePrice > 0 && (
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", marginBottom: "2px", letterSpacing: "0.5px" }}>Base Price</div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary-light)" }}>{formatCurrency(basePrice)}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  paddingTop: "36px",
                  borderTop: "1px solid var(--border-light)",
                  alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "42px", height: "42px", borderRadius: "50%",
                      background: highestBidder ? "#2563eb" : "#94a3b8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "13px", fontWeight: "800", flexShrink: 0,
                    }}>{highestBidderShort}</div>
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Highest Bidder</div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary-light)", marginTop: "1px" }}>{highestBidderName}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Base Price</div>
                    <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-light)", marginTop: "2px" }}>{formatCurrency(basePrice)}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Bid</div>
                    <div style={{ fontSize: "36px", fontWeight: "800", color: "#16a34a", marginTop: "2px", lineHeight: "1" }}>{formatCurrency(currentAmount)}</div>
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
              {teams.map((team, index) => (
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
                      background: getTeamColor(index), display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "11px", fontWeight: "800", flexShrink: 0,
                    }}>
                      {team.short || team.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary-light)" }}>{team.name}</span>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "14px", fontWeight: "700", color: "#16a34a" }}>
                    {formatCurrency(team.remainingBudget)}
                  </div>
                  <div style={{ textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                    {team.players || 0} / {team.maxPlayers || 18}
                  </div>
                </div>
              ))}
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
            <BidLedger />
          </div>
        </div>
      </div>

      {showRevealModal && (
        <PlayerRevealModal onClose={() => setShowRevealModal(false)} onContinue={handleRevealContinue} />
      )}

      {soldInfo && (
        <SoldPlayerModal
          onClose={clearSoldInfo}
          onNextPlayer={handleRevealNext}
          playerName={soldInfo.playerName}
          teamName={soldInfo.teamName}
          soldPrice={soldInfo.soldPrice}
        />
      )}

      {unsoldInfo && (
        <UnsoldPlayerModal
          onClose={clearUnsoldInfo}
          onNextPlayer={handleRevealNext}
          playerName={unsoldInfo.playerName}
        />
      )}
    </div>
  );
};

export default AuctionRoom;
