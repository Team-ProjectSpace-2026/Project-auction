import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SkeletonRect, SkeletonText } from "../../components/common/SkeletonLoader";
import "../../components/common/SkeletonLoader.css";
import * as playerService from "../../services/playerService.js";
import PlayerRegistrationForm from "../../components/players/PlayerRegistrationForm.jsx";
import { CheckCircle2 } from "lucide-react";
import "./SuccessCelebration.css";

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  blue:       "#2563eb",
  dark:       "#1a1d2e",
  border:     "#e2e8f0",
  bg:         "#f8fafc",
  muted:      "#6b7280",
  green:      "#10b981",
  red:        "#ef4444",
  heroTop:    "#0f172a",
  heroBott:   "#1e3a5f",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDeadline = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PublicRegistrationPage() {
  const { tournamentId } = useParams();
  const [loading, setLoading]           = useState(false);
  const [banner, setBanner]             = useState(null);
  const [tournamentData, setTournamentData] = useState(null);
  const [tournamentLoading, setTournamentLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await playerService.getPublicTournament(tournamentId);
        setTournamentData(res.data);
      } catch {
        setTournamentData(null);
      } finally {
        setTournamentLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentId]);

  const [registeredPlayer, setRegisteredPlayer] = useState(null);
  const [confettiList, setConfettiList] = useState([]);

  const isClosed = tournamentData?.registrationEndDate && now > new Date(tournamentData.registrationEndDate);

  async function handleSubmit(formData, rawForm) {
    setLoading(true);
    setBanner(null);
    try {
      await playerService.registerPlayer(tournamentId, formData);
      const list = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${Math.random() * 2 + 3}s`
      }));
      setConfettiList(list);
      setRegisteredPlayer({
        name: rawForm?.playerName || "Registered Player",
        role: rawForm?.primaryRole || "All-Rounder",
        jerseyNumber: rawForm?.jerseyNumber || "—",
        jerseyName: rawForm?.jerseyName || rawForm?.playerName || "",
      });
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      let msg;
      if (serverErrors && serverErrors.length > 0) {
        msg = serverErrors.map((e) => e.msg).join(", ");
      } else {
        msg = err?.response?.data?.message
          || err?.message
          || "Registration failed. Please try again.";
      }
      setBanner({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  }

  // ── Loading state ──
  if (tournamentLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.heroTop} 0%, ${C.heroBott} 100%)`,
          padding: "60px 24px 50px",
          textAlign: "center",
        }}>
          <SkeletonRect width="80px" height="80px" borderRadius="50%" style={{ margin: "0 auto 20px", background: "rgba(255,255,255,0.15)" }} />
          <SkeletonRect width="250px" height="32px" style={{ margin: "0 auto 12px", background: "rgba(255,255,255,0.2)" }} />
          <SkeletonRect width="180px" height="16px" style={{ margin: "0 auto", background: "rgba(255,255,255,0.15)" }} />
        </div>
        <div style={{ maxWidth: 640, margin: "-30px auto 40px", padding: "0 20px" }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            padding: "32px 28px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <SkeletonRect width="28px" height="28px" borderRadius="50%" />
              <SkeletonRect width="150px" height="18px" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><SkeletonText width="80px" size="sm" /><SkeletonRect height="44px" style={{ marginTop: 6 }} /></div>
              <div><SkeletonText width="60px" size="sm" /><SkeletonRect height="44px" style={{ marginTop: 6 }} /></div>
            </div>
            <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <SkeletonRect width="28px" height="28px" borderRadius="50%" />
              <SkeletonRect width="120px" height="18px" />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <SkeletonRect key={i} width="100px" height="100px" borderRadius="12px" />
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <SkeletonRect height="50px" borderRadius="10px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Closed state ──
  if (isClosed) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.heroTop} 0%, ${C.heroBott} 100%)`,
          padding: "0",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(37,99,235,.15)" }} />
          <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
          <div style={{ padding: "48px 32px 52px", textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(239,68,68,.25)", border: "1px solid rgba(239,68,68,.4)",
              borderRadius: 20, padding: "5px 16px", marginBottom: 18,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, display: "inline-block" }} />
              <span style={{ color: "rgba(255,255,255,.85)", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>REGISTRATION CLOSED</span>
            </div>
            <h1 style={{
              margin: "0 0 10px", color: "#fff", fontSize: "clamp(22px, 4vw, 34px)",
              fontWeight: 800, letterSpacing: 1.5,
            }}>TOURNAMENT REGISTRATION</h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,.6)", fontSize: 15 }}>
              {tournamentData?.name || "This tournament"}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 16px", textAlign: "center" }}>
          <div style={{
            background: "#fff",
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "48px 36px",
            boxShadow: "0 2px 8px rgba(0,0,0,.06)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>&#128274;</div>
            <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 700, color: C.dark }}>
              Registration Has Ended
            </h2>
            <p style={{ margin: "0 0 8px", color: C.muted, fontSize: 15, lineHeight: 1.6 }}>
              The registration deadline for this tournament has passed.
            </p>
            {tournamentData?.registrationEndDate && (
              <p style={{ margin: 0, color: C.red, fontSize: 14, fontWeight: 600 }}>
                Deadline was: {formatDeadline(tournamentData.registrationEndDate)}
              </p>
            )}
          </div>
        </div>

        <div style={{
          background: C.heroTop,
          padding: "18px 32px",
          textAlign: "center",
          color: "rgba(255,255,255,.45)",
          fontSize: 13,
        }}>
          &copy; {new Date().getFullYear()} CricAuction &middot; All rights reserved &nbsp;|&nbsp; Secure Registration Portal
        </div>
      </div>
    );
  }

  // ── Layout ──
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.heroTop} 0%, ${C.heroBott} 100%)`,
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(37,99,235,.15)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
        <div style={{ padding: "48px 32px 52px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(37,99,235,.25)", border: "1px solid rgba(37,99,235,.4)",
            borderRadius: 20, padding: "5px 16px", marginBottom: 18,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, display: "inline-block" }} />
            <span style={{ color: "rgba(255,255,255,.85)", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
              {tournamentData?.registrationEndDate
                ? `REGISTRATION OPEN \u00B7 ENDS ${formatDeadline(tournamentData.registrationEndDate)}`
                : "REGISTRATION OPEN"}
            </span>
          </div>
          <h1 style={{
            margin: "0 0 10px", color: "#fff", fontSize: "clamp(22px, 4vw, 34px)",
            fontWeight: 800, letterSpacing: 1.5,
          }}>TOURNAMENT REGISTRATION</h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,.6)", fontSize: 15 }}>
            Complete the form below to register as a player for this tournament
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "36px 16px 60px" }}>
        <PlayerRegistrationForm
          onSubmit={handleSubmit}
          submitLabel="Submit Registration"
          loading={loading}
          banner={banner}
          resetOnSubmit={true}
        />
      </div>

      {/* ── Success Celebration Overlay Modal ── */}
      {registeredPlayer && (
        <div className="celebration-overlay" onClick={() => { setRegisteredPlayer(null); setConfettiList([]); }}>
          
          {/* Confetti elements background */}
          <div className="confetti-layer">
            {confettiList.map((c) => (
              <div
                key={c.id}
                className="confetti-piece"
                style={{
                  left: c.left,
                  animationDelay: c.delay,
                  animationDuration: c.duration,
                }}
              />
            ))}
          </div>

          <div className="celebration-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="celebration-badge">
              <CheckCircle2 size={14} /> DRAFT PROFILE SECURED
            </div>
            
            <h2 className="celebration-title">Draft Registered!</h2>
            <p className="celebration-subtitle">
              Congratulations! Your player profile has been successfully submitted and entered into the draft pool for {tournamentData?.name || "the tournament"}.
            </p>

            {/* Custom Draft Card visual */}
            <div className="player-draft-card">
              <div className="card-jersey-visual">
                <div className="jersey-number-display">
                  {registeredPlayer.jerseyNumber ? `#${registeredPlayer.jerseyNumber}` : "—"}
                </div>
              </div>
              <h3 className="card-player-name">
                {registeredPlayer.name}
              </h3>
              <div className="card-player-role-badge">
                {registeredPlayer.role}
              </div>
            </div>

            <button
              className="celebration-close-btn"
              onClick={() => {
                setRegisteredPlayer(null);
                setConfettiList([]);
              }}
            >
              Done & Return
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        background: C.heroTop,
        padding: "18px 32px",
        textAlign: "center",
        color: "rgba(255,255,255,.45)",
        fontSize: 13,
      }}>
        &copy; {new Date().getFullYear()} CricAuction &middot; All rights reserved &nbsp;|&nbsp; Secure Registration Portal
      </div>
    </div>
  );
}
