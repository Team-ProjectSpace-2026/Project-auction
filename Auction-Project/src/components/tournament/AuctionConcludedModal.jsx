import { useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuction } from "../../context/AuctionContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import "./AuctionConcluded.css";

/**
 * AuctionConcludedModal
 *
 * Grand Finale celebration screen shown when all players have been auctioned.
 * Features:
 *   - 60fps golden confetti & fireworks particle canvas
 *   - KPI summary (total sold, unsold, money spent, average price)
 *   - Star Buy highlight (most expensive player)
 *   - Final team squad cards with budget bars
 *   - Action buttons: re-auction unsold, view squads, return to dashboard
 */

const TEAM_COLORS = [
  "#2563eb", "#16a34a", "#7c3aed", "#d97706",
  "#dc2626", "#0891b2", "#e11d48", "#4f46e5",
];

const AuctionConcludedModal = ({ onClose, tournamentId }) => {
  const navigate = useNavigate();
  const { players, teams, tournament } = useAuction();
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // ─── Computed Stats ───
  const stats = useMemo(() => {
    const allPlayers = players || [];
    const soldPlayers = allPlayers.filter((p) => p.isSold);
    const unsoldPlayers = allPlayers.filter((p) => p.isUnsold && !p.isSold);
    const totalSpent = soldPlayers.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
    const avgPrice = soldPlayers.length > 0 ? Math.round(totalSpent / soldPlayers.length) : 0;

    return {
      total: allPlayers.length,
      sold: soldPlayers.length,
      unsold: unsoldPlayers.length,
      totalSpent,
      avgPrice,
      soldPlayers,
      unsoldPlayers,
    };
  }, [players]);

  // ─── Star Buy (Most Expensive) ───
  const starBuy = useMemo(() => {
    if (!stats.soldPlayers || stats.soldPlayers.length === 0) return null;

    const mostExpensive = stats.soldPlayers.reduce((max, p) =>
      (p.soldPrice || 0) > (max.soldPrice || 0) ? p : max
    , stats.soldPlayers[0]);

    // Find the team that bought this player
    const buyingTeam = (teams || []).find(
      (t) => String(t._id) === String(mostExpensive.soldTo)
    );

    return {
      ...mostExpensive,
      buyingTeam,
    };
  }, [stats.soldPlayers, teams]);

  // ─── Team Summary ───
  const teamSummary = useMemo(() => {
    return (teams || []).map((team, index) => {
      const teamPlayers = (players || []).filter(
        (p) => p.isSold && String(p.soldTo) === String(team._id)
      );
      const totalSpent = teamPlayers.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
      const budgetUsed = team.totalBudget
        ? ((totalSpent / team.totalBudget) * 100)
        : ((team.remainingBudget != null && team.totalBudget)
          ? (((team.totalBudget - team.remainingBudget) / team.totalBudget) * 100)
          : 0);

      return {
        ...team,
        playerCount: team.players || teamPlayers.length,
        totalSpent,
        budgetUsedPercent: Math.min(100, Math.round(budgetUsed)),
        colorIndex: index,
      };
    });
  }, [teams, players]);

  // ─── Confetti / Fireworks Particle Canvas ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = [];
    const goldColors = ["#f59e0b", "#d97706", "#fbbf24", "#f5e6a3", "#ffffff", "#2563eb", "#60a5fa"];

    class Particle {
      constructor(x, y, isFirework = false) {
        this.x = x;
        this.y = y;

        if (isFirework) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 3;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.gravity = 0.15;
          this.size = Math.random() * 4 + 2;
          this.fade = Math.random() * 0.02 + 0.012;
        } else {
          // Confetti
          this.vx = Math.random() * 2 - 1;
          this.vy = Math.random() * 2.5 + 1.5;
          this.rotation = Math.random() * 360;
          this.rotationSpeed = Math.random() * 8 - 4;
          this.size = Math.random() * 6 + 3;
          this.width = this.size * (Math.random() * 1.5 + 0.8);
          this.height = this.size * 0.5;
          this.fade = Math.random() * 0.004 + 0.002;
        }

        this.color = goldColors[Math.floor(Math.random() * goldColors.length)];
        this.opacity = 1;
        this.isFirework = isFirework;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.gravity) this.vy += this.gravity;
        if (!this.isFirework) {
          this.vx += Math.sin(this.y * 0.01) * 0.04;
          if (this.rotation !== undefined) this.rotation += this.rotationSpeed;
        }
        this.opacity -= this.fade;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;

        if (!this.isFirework && this.rotation !== undefined) {
          ctx.translate(this.x, this.y);
          ctx.rotate((this.rotation * Math.PI) / 180);
          ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Initial burst of confetti
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle(Math.random() * width, Math.random() * height * 0.3));
    }

    // Initial firework bursts
    const burstCount = 3;
    for (let b = 0; b < burstCount; b++) {
      const bx = width * (0.2 + Math.random() * 0.6);
      const by = height * (0.15 + Math.random() * 0.35);
      for (let i = 0; i < 30; i++) {
        particles.push(new Particle(bx, by, true));
      }
    }

    let frameCount = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      frameCount++;

      // Continuous confetti from top
      if (Math.random() < 0.35) {
        particles.push(new Particle(Math.random() * width, -10));
      }

      // Occasional firework bursts
      if (frameCount % 180 === 0) {
        const bx = width * (0.15 + Math.random() * 0.7);
        const by = height * (0.1 + Math.random() * 0.3);
        for (let i = 0; i < 25; i++) {
          particles.push(new Particle(bx, by, true));
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.opacity <= 0 || p.y > height + 20) {
          particles.splice(i, 1);
        } else {
          p.draw();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ─── Handlers ───
  const handleViewSquads = useCallback(() => {
    onClose();
    if (tournamentId) {
      navigate(`/tournament/${tournamentId}?tab=teams`);
    }
  }, [onClose, navigate, tournamentId]);

  const handleReturnDashboard = useCallback(() => {
    onClose();
    if (tournamentId) {
      navigate(`/tournament/${tournamentId}`);
    }
  }, [onClose, navigate, tournamentId]);

  const getTeamColor = (idx) => TEAM_COLORS[idx % TEAM_COLORS.length];

  const hasUnsold = stats.unsold > 0;

  return createPortal(
    <div className="concluded-overlay">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="concluded-particles" />

      {/* Atmospheric glows */}
      <div className="concluded-glow" />
      <div className="concluded-glow-bottom" />

      {/* Close button */}
      <button className="concluded-close-btn" onClick={onClose} title="Close">
        ×
      </button>

      {/* ─── Hero Section ─── */}
      <div className="concluded-hero">
        <div className="concluded-trophy">
          <span className="concluded-trophy-icon">🏆</span>
        </div>
        <h1 className="concluded-title">Auction Concluded</h1>
        <p className="concluded-subtitle">All Players Have Been Successfully Auctioned</p>
        {tournament?.name && (
          <p className="concluded-tournament-name">{tournament.name}</p>
        )}
      </div>

      {/* ─── KPI Metrics ─── */}
      <div className="concluded-metrics">
        <div className="concluded-metric-card">
          <span className="concluded-metric-icon">🏏</span>
          <span className="concluded-metric-value">{stats.total}</span>
          <span className="concluded-metric-label">Total Players</span>
        </div>
        <div className="concluded-metric-card concluded-metric-card--sold">
          <span className="concluded-metric-icon">✅</span>
          <span className="concluded-metric-value">{stats.sold}</span>
          <span className="concluded-metric-label">Players Sold</span>
        </div>
        <div className="concluded-metric-card concluded-metric-card--unsold">
          <span className="concluded-metric-icon">❌</span>
          <span className="concluded-metric-value">{stats.unsold}</span>
          <span className="concluded-metric-label">Unsold</span>
        </div>
        <div className="concluded-metric-card concluded-metric-card--gold">
          <span className="concluded-metric-icon">💰</span>
          <span className="concluded-metric-value">{formatCurrency(stats.totalSpent)}</span>
          <span className="concluded-metric-label">Total Spent</span>
        </div>
      </div>

      {/* ─── Star Buy (Most Expensive Player) ─── */}
      {starBuy && (
        <div className="concluded-starbuy">
          <div className="concluded-starbuy-card">
            {/* Player photo */}
            {starBuy.photo ? (
              <img
                src={playerPhotoUrl(starBuy.photo)}
                alt={starBuy.name}
                className="concluded-starbuy-photo"
              />
            ) : (
              <div className="concluded-starbuy-photo-placeholder">🏏</div>
            )}

            {/* Info */}
            <div className="concluded-starbuy-info">
              <div className="concluded-starbuy-header">
                <span className="concluded-starbuy-badge">⭐ Star Buy</span>
                <span className="concluded-starbuy-label">Most Expensive Player</span>
              </div>

              <h3 className="concluded-starbuy-name">{starBuy.name || "Player"}</h3>
              {starBuy.role && (
                <span className="concluded-starbuy-role">{starBuy.role}</span>
              )}

              <div className="concluded-starbuy-prices">
                <div className="concluded-starbuy-price-block">
                  <span className="concluded-starbuy-price-label">Sold For</span>
                  <span className="concluded-starbuy-price-val concluded-starbuy-price-val--gold">
                    {formatCurrency(starBuy.soldPrice || 0)}
                  </span>
                </div>
                <div className="concluded-starbuy-price-block">
                  <span className="concluded-starbuy-price-label">Base Price</span>
                  <span className="concluded-starbuy-price-val concluded-starbuy-price-val--muted">
                    {formatCurrency(starBuy.basePrice || 0)}
                  </span>
                </div>
              </div>

              {/* Buying team */}
              {starBuy.buyingTeam && (
                <div className="concluded-starbuy-team">
                  {starBuy.buyingTeam.logo ? (
                    <img
                      src={starBuy.buyingTeam.logo}
                      alt={starBuy.buyingTeam.name}
                      className="concluded-starbuy-team-logo"
                    />
                  ) : (
                    <div
                      className="concluded-starbuy-team-initials"
                      style={{ background: starBuy.buyingTeam.primaryColor || "#2563eb" }}
                    >
                      {starBuy.buyingTeam.short || starBuy.buyingTeam.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="concluded-starbuy-team-name">
                    Purchased by {starBuy.buyingTeam.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Team Squads Summary ─── */}
      {teamSummary.length > 0 && (
        <div className="concluded-teams">
          <h3 className="concluded-teams-title">
            <span>🛡️</span> Final Team Squads
          </h3>
          <div className="concluded-teams-grid">
            {teamSummary.map((team) => (
              <div key={team._id} className="concluded-team-card">
                <div className="concluded-team-header">
                  <div
                    className="concluded-team-logo"
                    style={{ background: team.primaryColor || getTeamColor(team.colorIndex) }}
                  >
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} />
                    ) : (
                      team.short || team.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="concluded-team-name">{team.name}</span>
                </div>

                <div className="concluded-team-stats">
                  <div className="concluded-team-stat-row">
                    <span className="concluded-team-stat-label">Players</span>
                    <span className="concluded-team-stat-val concluded-team-stat-val--blue">
                      {team.playerCount || 0} / {team.maxPlayers || 18}
                    </span>
                  </div>
                  <div className="concluded-team-stat-row">
                    <span className="concluded-team-stat-label">Remaining</span>
                    <span className="concluded-team-stat-val concluded-team-stat-val--green">
                      {formatCurrency(team.remainingBudget || 0)}
                    </span>
                  </div>
                  <div className="concluded-budget-bar-bg">
                    <div
                      className="concluded-budget-bar-fill"
                      style={{ width: `${100 - (team.budgetUsedPercent || 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Action Buttons ─── */}
      <div className="concluded-actions">
        {hasUnsold && (
          <button className="concluded-btn concluded-btn--primary" onClick={onClose}>
            🔄 Re-auction Unsold Players ({stats.unsold})
          </button>
        )}
        <button className="concluded-btn concluded-btn--secondary" onClick={handleViewSquads}>
          📋 View Final Squads
        </button>
        <button className="concluded-btn concluded-btn--ghost" onClick={handleReturnDashboard}>
          🏠 Return to Dashboard
        </button>
      </div>
    </div>,
    document.body
  );
};

export default AuctionConcludedModal;
