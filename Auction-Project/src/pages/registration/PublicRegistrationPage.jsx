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

  // Helper to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const finalizePlayerRegistration = async (payload, rawForm) => {
    try {
      const res = await playerService.registerPlayer(tournamentId, payload);
      const createdPlayer = res?.data?.player;
      const list = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${Math.random() * 2 + 3}s`
      }));
      setConfettiList(list);
      setRegisteredPlayer({
        name: createdPlayer?.name || rawForm?.playerName || "Registered Player",
        role: createdPlayer?.role || rawForm?.primaryRole || "All-Rounder",
        registrationNumber: createdPlayer?.registrationNumber,
        jerseyNumber: createdPlayer?.registrationNumber || createdPlayer?.jerseyNumber || rawForm?.jerseyNumber || 1,
        jerseyName: createdPlayer?.jerseyName || rawForm?.jerseyName || rawForm?.playerName || "",
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
    }
  };

  async function handleSubmit(formData, rawForm) {
    setLoading(true);
    setBanner(null);

    // Free registration flow
    if (!tournamentData?.isPaid || !tournamentData?.registrationFee || tournamentData?.registrationFee <= 0) {
      try {
        await finalizePlayerRegistration(formData, rawForm);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Paid registration flow via Razorpay
    try {
      // 1. Create order
      const orderRes = await import("../../services/paymentService.js").then(m => m.createPaymentOrder(tournamentId));
      if (!orderRes.success) {
        setBanner({ type: "error", message: orderRes.message || "Failed to create payment order." });
        setLoading(false);
        return;
      }

      // 2. Load script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setBanner({ type: "error", message: "Razorpay SDK failed to load. Please check your internet connection." });
        setLoading(false);
        return;
      }

      // 3. Trigger Razorpay modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amountPaise,
        currency: orderRes.currency || "INR",
        name: "CricAuction",
        description: `Entry Fee for ${tournamentData.name || "Tournament"}`,
        order_id: orderRes.orderId,
        handler: async function (response) {
          try {
            // Append payment response to formData
            formData.append("razorpayOrderId", response.razorpay_order_id);
            formData.append("razorpayPaymentId", response.razorpay_payment_id);
            formData.append("razorpaySignature", response.razorpay_signature);
            formData.append("amountPaid", orderRes.amount);

            await finalizePlayerRegistration(formData, rawForm);
          } catch (err) {
            console.error("Payment handler error:", err);
            setBanner({ type: "error", message: "Payment verification or registration failed." });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setBanner({ type: "error", message: "Payment was cancelled." });
          }
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI / QR Code (GPay, PhonePe, Paytm)",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              },
              other: {
                name: "Other Options",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" }
                ]
              }
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        prefill: {
          name: rawForm.playerName || "",
          contact: rawForm.mobile || "",
        },
        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment error:", err);
      setBanner({ type: "error", message: err.response?.data?.message || err.message || "Failed to initiate payment." });
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

        {/* Paid Tournament Fee Banner */}
        {tournamentData?.isPaid && tournamentData?.registrationFee > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1px solid #bfdbfe",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px"
          }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#2563eb", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
                💳 PAID REGISTRATION
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "700", color: "#1e3a8a" }}>
                {tournamentData.name} Registration Fee
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#3b82f6" }}>
                Secure payment powered by Razorpay (UPI, GPay, PhonePe, Cards)
              </p>
            </div>

            <div style={{ textAlign: "right", background: "#ffffff", padding: "12px 20px", borderRadius: "12px", border: "1px solid #93c5fd" }}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Total Payable</div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#1e3a8a" }}>
                ₹{(Number(tournamentData.registrationFee) * 1.025).toFixed(2)}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                (₹{tournamentData.registrationFee} fee + ₹{(Number(tournamentData.registrationFee) * 0.025).toFixed(2)} conv. fee)
              </div>
            </div>
          </div>
        )}

        <PlayerRegistrationForm
          onSubmit={handleSubmit}
          submitLabel={
            tournamentData?.isPaid && tournamentData?.registrationFee > 0
              ? `Pay ₹${(Number(tournamentData.registrationFee) * 1.025).toFixed(2)} & Register`
              : "Submit Registration"
          }
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
                  #{registeredPlayer.registrationNumber ?? registeredPlayer.jerseyNumber ?? 1}
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
