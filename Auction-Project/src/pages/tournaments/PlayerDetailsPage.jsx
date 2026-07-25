import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import CricketLoader from "../../components/common/CricketLoader";
import { getPlayer } from "../../services/playerService";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import bgStadium from "../../assets/bgstadium2.png";

const getRoleStyle = (role) => {
  switch (role) {
    case "Batsman":
      return { background: "#dbeafe", color: "#2563eb" };
    case "Bowler":
      return { background: "#fef3c7", color: "#d97706" };
    case "All Rounder":
      return { background: "#ede9fe", color: "#7c3aed" };
    case "Wicket Keeper":
      return { background: "#dcfce7", color: "#16a34a" };
    default:
      return { background: "#f3f4f6", color: "#6b7280" };
  }
};

const formatCurrency = (amount) => {
  if (amount == null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const PlayerDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerId } = useParams();
  const tournamentId = location.state?.tournamentId;

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) return;

    const controller = new AbortController();

    const fetchPlayer = async () => {
      try {
        setLoading(true);
        setError(null);
        const start = Date.now();
        const { data } = await getPlayer(playerId, { signal: controller.signal });
        const elapsed = Date.now() - start;
        const minDelay = 1500;
        if (elapsed < minDelay) {
          await new Promise((r) => setTimeout(r, minDelay - elapsed));
        }
        setPlayer(data);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        setError(err.response?.data?.message || "Failed to load player details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
    return () => controller.abort();
  }, [playerId]);

  const handleBack = () => {
    if (tournamentId) {
      navigate(`/tournament-details/${tournamentId}`, { state: { activeTab: "players" } });
    } else {
      navigate(-1);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
        <Sidebar activePage="tournaments" />
        <div style={{ marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "auto", position: "relative" }}>
          <div style={{ position: "fixed", top: 0, left: "220px", right: 0, bottom: 0, backgroundImage: `url(${bgStadium})`, backgroundSize: "cover", backgroundPosition: "center bottom", backgroundRepeat: "no-repeat", zIndex: 0 }} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
            <CricketLoader text="Loading player details..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
        <Sidebar activePage="tournaments" />
        <div style={{ marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "auto", position: "relative" }}>
          <div style={{ position: "fixed", top: 0, left: "220px", right: 0, bottom: 0, backgroundImage: `url(${bgStadium})`, backgroundSize: "cover", backgroundPosition: "center bottom", backgroundRepeat: "no-repeat", zIndex: 0 }} />
          <div style={{ flex: 1, padding: "28px 32px", position: "relative", zIndex: 1 }}>
            <p style={{ color: "#e74c3c" }}>{error || "Player not found."}</p>
            <button onClick={handleBack} style={{ border: "none", background: "transparent", color: "var(--accent-light)", fontWeight: 600, cursor: "pointer", fontSize: "14px", marginTop: "12px" }}>
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <Sidebar activePage="tournaments" />

      <div style={{ marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "auto", position: "relative" }}>
        <div style={{ position: "fixed", top: 0, left: "220px", right: 0, bottom: 0, backgroundImage: `url(${bgStadium})`, backgroundSize: "cover", backgroundPosition: "center bottom", backgroundRepeat: "no-repeat", zIndex: 0 }} />

        <main style={{ padding: "28px 32px 32px", overflow: "visible", position: "relative", zIndex: 1 }}>
          {/* Back Button */}
          <button
            onClick={handleBack}
            style={{
              border: "1px solid var(--accent-light)",
              background: "var(--glass-bg)",
              color: "var(--accent-light)",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "24px",
              fontSize: "13px",
              padding: "8px 20px",
              borderRadius: "45px",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0px 4px 10px rgba(37, 99, 235, 0.08)",
              transition: "all 0.3s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-light)";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.boxShadow = "0px 8px 16px rgba(37, 99, 235, 0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--glass-bg)";
              e.currentTarget.style.color = "var(--accent-light)";
              e.currentTarget.style.boxShadow = "0px 4px 10px rgba(37, 99, 235, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Players
          </button>

          {/* Player Header */}
          <div
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--glass-border)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              {/* Player Photo / Initials */}
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: player.photo ? "transparent" : `${getRoleStyle(player.role).background}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: "700",
                  color: getRoleStyle(player.role).color,
                  overflow: "hidden",
                  border: `3px solid ${getRoleStyle(player.role).color}20`,
                }}
              >
                {player.photo ? (
                  <img src={playerPhotoUrl(player.photo)} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  getInitials(player.name)
                )}
              </div>

              <div>
                <h1 style={{ fontSize: "40px", fontWeight: "800", color: "var(--text-primary-light)", marginBottom: "12px" }}>
                  {player.name}
                </h1>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ padding: "6px 12px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", ...getRoleStyle(player.role) }}>
                    {player.role}
                  </span>
                  {player.soldTo && (
                    <span style={{ color: "var(--text-secondary-light)", fontSize: "14px" }}>
                      Sold to {player.soldTo.name || "Team"}
                    </span>
                  )}
                  {!player.isSold && (
                    <span style={{ color: "var(--text-secondary-light)", fontSize: "14px" }}>
                      Available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Player Information */}
            <div
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--glass-border)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h2 style={{ marginBottom: "20px", color: "var(--text-primary-light)" }}>Player Information</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "16px" }}>
                {player.age && (
                  <>
                    <span>Age</span>
                    <strong>{player.age}</strong>
                  </>
                )}
                {player.battingStyle && (
                  <>
                    <span>Batting Style</span>
                    <strong>{player.battingStyle}</strong>
                  </>
                )}
                {player.bowlingStyle && player.bowlingStyle !== "Not Applicable" && (
                  <>
                    <span>Bowling Style</span>
                    <strong>{player.bowlingStyle}</strong>
                  </>
                )}
                <span>Role</span>
                <strong>{player.role}</strong>
                <span>Keeper</span>
                <strong>{player.keeper ? "Yes" : "No"}</strong>
                {player.jerseyNumber != null && (
                  <>
                    <span>Jersey Number</span>
                    <strong>#{player.jerseyNumber}</strong>
                  </>
                )}
                {player.jerseySize && (
                  <>
                    <span>Jersey Size</span>
                    <strong>{player.jerseySize}</strong>
                  </>
                )}
                {player.jerseyName && (
                  <>
                    <span>Jersey Name</span>
                    <strong>{player.jerseyName}</strong>
                  </>
                )}
              </div>
            </div>

            {/* Auction Information */}
            <div
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--glass-border)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h2 style={{ marginBottom: "20px", color: "var(--text-primary-light)" }}>Auction Information</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "16px" }}>
                <span>Base Price</span>
                <strong>{formatCurrency(player.basePrice)}</strong>
                <span>Status</span>
                <strong style={{ color: player.isSold ? "var(--status-active-text)" : "var(--text-secondary-light)" }}>
                  {player.isSold ? "Sold" : "Available"}
                </strong>
                {player.isSold && (
                  <>
                    <span>Sold Price</span>
                    <strong>{formatCurrency(player.soldPrice)}</strong>
                    <span>Current Team</span>
                    <strong>{player.soldTo?.name || "—"}</strong>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
};

export default PlayerDetailsPage;
