import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Hammer, User } from "lucide-react";
import { useAuction } from "../../context/AuctionContext";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import PlayerRevealModal from "./PlayerRevealModal";
import PlayerDetailsModal from "./PlayerDetailsModal";

const enterFullscreen = () => {
  const el = document.documentElement;
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (fn) {
    const result = fn.call(el);
    if (result && typeof result.catch === "function") result.catch(() => {});
  }
};

const LiveAuctionTab = ({ tournamentId: propTournamentId, tournament }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentId = propTournamentId || searchParams.get("tournamentId");
  const {
    auctionStatus,
    joinAndListen,
    players,
    currentPlayer,
    currentBid,
    highestBidder,
    error,
    clearError
  } = useAuction();

  const isPastDate = tournament?.date && new Date(tournament.date) < new Date();
  const isBeforeDate = !isPastDate && tournament?.date && new Date(tournament.date) > new Date();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = () => {
    if (!tournament?.date) return null;
    const diff = new Date(tournament.date) - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  const statusLabel = isPastDate ? "Completed"
    : auctionStatus === "bidding" ? "Live"
    : auctionStatus === "sold" ? "Sold"
    : auctionStatus === "unsold" ? "Unsold"
    : auctionStatus === "completed" ? "Completed"
    : isBeforeDate ? "Scheduled"
    : "Not Started";

  // Load auction state AND connect to socket when tab mounts
  useEffect(() => {
    if (tournamentId) {
      const cleanup = joinAndListen(tournamentId);
      return cleanup;
    }
  }, [tournamentId, joinAndListen]);

  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showPlayerCard, setShowPlayerCard] = useState(false);

  return (
    <div className="auction-screen" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {error && (
        <div style={{
          background: "var(--warning-bg)",
          border: "1px solid var(--warning-border)",
          borderRadius: "10px",
          padding: "10px 16px",
          fontSize: "13px",
          fontWeight: "600",
          color: "var(--warning-text)",
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
              color: "var(--warning-text)",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {isPastDate && (
        <div style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          border: "1px solid #bbf7d0",
          borderRadius: "14px",
          padding: "32px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>&#127942;</div>
          <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: "700", color: "#15803d" }}>
            Auction Completed
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#166534" }}>
            This auction was held on {new Date(tournament.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.
          </p>
        </div>
      )}

      {isBeforeDate && (() => {
        const time = getTimeRemaining();
        if (!time) return null;
        return (
          <div style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--glass-border)",
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
          }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "var(--info-bg)",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Hammer size={40} strokeWidth={1.5} style={{ color: "var(--accent-light)" }} />
            </div>

            <h2
              style={{
                marginTop: "20px",
                fontSize: "26px",
                fontWeight: "700",
                color: "var(--text-primary-light)",
              }}
            >
              Auction Starts In
            </h2>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                marginTop: "24px",
              }}
            >
              {[
                { value: time.days, label: "Days" },
                { value: time.hours, label: "Hours" },
                { value: time.minutes, label: "Mins" },
                { value: time.seconds, label: "Secs" },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "14px",
                      background: "var(--info-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "var(--accent-light)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "var(--text-secondary-light)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <p
              style={{
                marginTop: "20px",
                color: "var(--text-secondary-light)",
                fontSize: "14px",
              }}
            >
              Scheduled for {new Date(tournament.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        );
      })()}

      {!isPastDate && !isBeforeDate && (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.3fr 1fr",
          gap: "24px",
        }}
      >
      {/* Left Section */}
      <div
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--glass-border)",
          borderRadius: "16px",
          padding: "40px",
          minHeight: "620px",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "var(--info-bg)",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Hammer size={32} strokeWidth={1.5} style={{ color: "var(--accent-light)" }} />
          </div>

          <h2
            style={{
              marginTop: "18px",
              marginBottom: "8px",
              fontSize: "28px",
              color: "var(--text-primary-light)",
              transition: "color 0.2s ease",
            }}
          >
            Live Auction
          </h2>

          <p
            style={{
              color: "var(--text-secondary-light)",
              fontSize: "14px",
              transition: "color 0.2s ease",
            }}
          >
            Auction has not started yet.
          </p>

          <div
            style={{
              marginTop: "32px",
              marginBottom: "32px",
              borderTop: "1px solid var(--border-light)",
              transition: "border-color 0.2s ease",
            }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "60px",
          }}
        >
              <>
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: "var(--info-bg)",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Hammer size={56} strokeWidth={1.5} style={{ color: "var(--accent-light)" }} />
                </div>

                <h2
                  style={{
                    marginTop: "24px",
                    fontSize: "34px",
                    fontWeight: "700",
                    color: "var(--text-primary-light)",
                    transition: "color 0.2s ease",
                  }}
                >
                  Ready to Start the Auction?
                </h2>

                <p
                  style={{
                    color: "var(--text-secondary-light)",
                    marginTop: "12px",
                    fontSize: "15px",
                    transition: "color 0.2s ease",
                  }}
                >
                  Once you start the auction, teams will be able to
                  place bids on players.
                </p>

                <button
                  onClick={() => { enterFullscreen(); setShowRevealModal(true); }}
                  disabled={!players || players.length === 0}
                  style={{
                    marginTop: "28px",
                    background: "var(--accent-light)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "14px 36px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: (!players || players.length === 0) ? "not-allowed" : "pointer",
                    opacity: (!players || players.length === 0) ? 0.5 : 1,
                    transition: "background-color 0.2s ease",
                  }}
                >
                  ▶ Start Auction
                  {(!players || players.length === 0) && ' — Loading players...'}
                </button>

                <p
                  style={{
                    marginTop: "20px",
                    color: "var(--text-secondary-light)",
                    fontSize: "13px",
                    transition: "color 0.2s ease",
                  }}
                >
                  ℹ️ You can't pause or reset the auction once it has started.
                </p>
              </>
        </div>
      </div>

      {/* Right Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Current Auction */}
        <div
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--glass-border)",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                color: "var(--text-primary-light)",
                fontSize: "18px",
                fontWeight: "700",
                transition: "color 0.2s ease",
              }}
            >
              Current Auction
            </h3>

            <span
              style={{
                background: "var(--info-bg)",
                color: "var(--accent-light)",
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                transition: "background-color 0.2s ease, color 0.2s ease",
              }}
            >
              {statusLabel}
            </span>
          </div>

          <div
            style={{
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            {currentPlayer ? (
              <>
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: currentPlayer.photo ? "transparent" : "var(--avatar-bg)",
                    margin: "0 auto 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {currentPlayer.photo ? (
                    <img src={playerPhotoUrl(currentPlayer.photo)} alt={currentPlayer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <User size={30} strokeWidth={1.5} style={{ color: "var(--text-secondary-light)" }} />
                  )}
                </div>
                <h4 style={{ color: "var(--text-primary-light)", marginBottom: "4px", transition: "color 0.2s ease" }}>{currentPlayer.name}</h4>
                <p style={{ color: "var(--text-secondary-light)", fontSize: "13px", transition: "color 0.2s ease" }}>{currentPlayer.role}</p>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "var(--avatar-bg)",
                    margin: "0 auto 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <User size={30} strokeWidth={1.5} style={{ color: "var(--text-secondary-light)" }} />
                </div>
                <h4 style={{ color: "var(--text-primary-light)", marginBottom: "6px", transition: "color 0.2s ease" }}>No Player Selected</h4>
                <p style={{ color: "var(--text-secondary-light)", fontSize: "13px", transition: "color 0.2s ease" }}>The auction will begin once you start.</p>
              </>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border-light)",
              paddingTop: "16px",
              transition: "border-color 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ color: "var(--text-secondary-light)", transition: "color 0.2s ease" }}>Base Price</span>
              <span style={{ color: "var(--text-primary-light)", transition: "color 0.2s ease" }}>{currentPlayer?.basePrice ? `₹${currentPlayer.basePrice.toLocaleString("en-IN")}` : "-"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ color: "var(--text-secondary-light)", transition: "color 0.2s ease" }}>Current Bid</span>
              <span style={{ color: "var(--text-primary-light)", transition: "color 0.2s ease" }}>{currentBid?.amount ? `₹${currentBid.amount.toLocaleString("en-IN")}` : "-"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary-light)", transition: "color 0.2s ease" }}>Highest Bidder</span>
              <span style={{ color: "var(--text-primary-light)", transition: "color 0.2s ease" }}>{highestBidder?.name || "-"}</span>
            </div>
          </div>
        </div>

        {/* Auction Activity */}
        <div
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--glass-border)",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              marginBottom: "24px",
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--text-primary-light)",
              transition: "color 0.2s ease",
            }}
          >
            Auction Activity
          </h3>

          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "var(--info-bg)",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Hammer size={30} strokeWidth={1.5} style={{ color: "var(--accent-light)" }} />
            </div>

            <h4
              style={{
                color: "var(--text-primary-light)",
                marginBottom: "8px",
                transition: "color 0.2s ease",
              }}
            >
              No activity yet
            </h4>

            <p
              style={{
                color: "var(--text-secondary-light)",
                fontSize: "13px",
                transition: "color 0.2s ease",
              }}
            >
              Auction activity will appear here once the auction begins.
            </p>
          </div>
        </div>
      </div>
      </div>
      )}

      {showRevealModal && (
        <PlayerRevealModal
          onClose={() => setShowRevealModal(false)}
          onContinue={() => {
            setShowPlayerCard(true);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setShowRevealModal(false);
              });
            });
          }}
        />
      )}

      {showPlayerCard && (
        <PlayerDetailsModal
          onClose={() => setShowPlayerCard(false)}
          onStartBidding={() => {
            setShowPlayerCard(false);
            navigate(`/live-auction?tournamentId=${tournamentId}`);
          }}  
        />
      )}
    </div>
  );
};

export default LiveAuctionTab;
