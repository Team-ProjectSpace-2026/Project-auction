import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import InputField from "../../components/common/InputField.jsx";
import Button from "../../components/common/Button.jsx";
import * as playerService from "../../services/playerService.js";


// ─── Design tokens (match TournamentRow.jsx team style guide) ───────────────
const C = {
  blue:       "#2563eb",
  blueDark:   "#1d4ed8",
  dark:       "#1a1d2e",
  border:     "#e2e8f0",
  bg:         "#f8fafc",
  cardBg:     "#ffffff",
  text:       "#374151",
  muted:      "#6b7280",
  green:      "#10b981",
  orange:     "#f97316",
  red:        "#ef4444",
  heroTop:    "#0f172a",
  heroBott:   "#1e3a5f",
};

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ number, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: C.blue, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>{number}</div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.dark }}>{title}</h3>
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: C.cardBg,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "24px 28px",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Radio Option (inline pill) ───────────────────────────────────────────────
function RadioOption({ name, value, checked, onChange, label }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 16px",
      border: `1.5px solid ${checked ? C.blue : C.border}`,
      borderRadius: 8, cursor: "pointer",
      background: checked ? "#eff6ff" : "#fff",
      flex: "1 1 0",
      minWidth: 130,
      transition: "border-color .15s, background .15s",
    }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: C.blue, width: 16, height: 16 }}
      />
      <span style={{ fontSize: 14, fontWeight: 500, color: C.dark }}>{label}</span>
    </label>
  );
}

// ─── Role Card (grid card radio) ──────────────────────────────────────────────
const ROLE_ICONS = {
  Batsman:       "🏏",
  Bowler:        "⚾",
  "All Rounder": "🌟",
  "Wicket Keeper": "🧤",
};

function RoleCard({ role, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, padding: "20px 12px",
        border: `2px solid ${selected ? C.blue : C.border}`,
        borderRadius: 12, cursor: "pointer",
        background: selected ? "#eff6ff" : "#fff",
        boxShadow: selected ? `0 0 0 3px rgba(37,99,235,.15)` : "none",
        transition: "all .15s",
        flex: "1 1 0",
        minWidth: 100,
        position: "relative",
      }}
    >
      <span style={{ fontSize: 30 }}>{ROLE_ICONS[role]}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: selected ? C.blue : C.dark, textAlign: "center" }}>
        {role}
      </span>
      {selected && (
        <span style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          width: 20, height: 20, borderRadius: "50%", background: C.blue, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: "bold"
        }}>✓</span>
      )}
    </button>
  );
}

// ─── Banner / Alert ───────────────────────────────────────────────────────────
function Banner({ type, message }) {
  const styles = {
    success: { bg: "#f0fdf4", border: "#86efac", color: "#166534" },
    error:   { bg: "#fef2f2", border: "#fca5a5", color: "#991b1b" },
  };
  const s = styles[type];
  return (
    <div style={{
      padding: "14px 18px",
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 8,
      color: s.color,
      fontSize: 14,
      fontWeight: 500,
      marginBottom: 20,
    }}>
      {type === "success" ? "✅ " : "❌ "}{message}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const DEFAULT_FORM = {
  playerName:   "",
  age:          "",
  countryCode:  "+91",
  mobile:       "",
  primaryRole:  "",
  battingStyle: "",
  bowlingStyle: "",
  isKeeper:     "",
  isAllRounder: "",
  photo:        null,
};

export default function PublicRegistrationPage() {
  const { tournamentId } = useParams();
  // ── Form state ──
  const [form, setForm] = useState(DEFAULT_FORM);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [banner, setBanner]             = useState(null); // { type, message }
  const fileRef = useRef(null);

  // ── Helpers ──
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handlePhoto(file) {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setBanner({ type: "error", message: "Only JPG / PNG files are allowed." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setBanner({ type: "error", message: "File size must be under 2 MB." });
      return;
    }
    setForm((f) => ({ ...f, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
    setBanner(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handlePhoto(e.dataTransfer.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setBanner(null);

    // Basic validation
    if (!form.playerName.trim()) return setBanner({ type: "error", message: "Player name is required." });
    if (!form.age || +form.age < 10 || +form.age > 60) return setBanner({ type: "error", message: "Enter a valid age (10–60)." });
    if (!form.mobile || form.mobile.length < 7) return setBanner({ type: "error", message: "Enter a valid mobile number." });
    if (!form.primaryRole) return setBanner({ type: "error", message: "Please select a primary role." });
    if (!form.battingStyle) return setBanner({ type: "error", message: "Please select batting style." });
    if (!form.bowlingStyle) return setBanner({ type: "error", message: "Please select bowling style." });

    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null) payload.append(k, v); });

    try {
      setLoading(true);
      await playerService.registerPlayer(tournamentId, payload);
      setBanner({ type: "success", message: "Registration successful! You have been registered for the tournament." });
      // Reset
      setForm(DEFAULT_FORM);
      setPhotoPreview(null);
    } catch (err) {
      const msg = err?.response?.data?.errors?.[0]?.msg
        || err?.response?.data?.message
        || err?.message
        || "Registration failed. Please try again.";
      setBanner({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
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
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(37,99,235,.15)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />

        {/* Nav strip */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 32px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: C.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>🏏</div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: ".5px" }}>CRIC AUCTION</span>
          </div>
          <span style={{ color: "rgba(255,255,255,.55)", fontSize: 13 }}>Powered by CricAuction v4.0</span>
        </div>

        {/* Hero content */}
        <div style={{ padding: "48px 32px 52px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(37,99,235,.25)", border: "1px solid rgba(37,99,235,.4)",
            borderRadius: 20, padding: "5px 16px", marginBottom: 18,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, display: "inline-block" }} />
            <span style={{ color: "rgba(255,255,255,.85)", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>REGISTRATION OPEN</span>
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
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 16px 60px" }}>
        {banner && <Banner type={banner.type} message={banner.message} />}

        <form onSubmit={handleSubmit} noValidate>

          {/* Section 1 – Personal Info */}
          <Card style={{ marginBottom: 24 }}>
            <SectionHeading number={1} title="Personal Information" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
              <InputField
                label="Player Name"
                id="playerName"
                required
                value={form.playerName}
                onChange={set("playerName")}
                placeholder="Enter full name"
              />
              <InputField
                label="Age"
                id="age"
                type="number"
                required
                min={10}
                max={60}
                value={form.age}
                onChange={set("age")}
                placeholder="e.g. 24"
              />
              {/* Mobile with country code */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>
                  Mobile Number<span style={{ color: C.red, marginLeft: 2 }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={form.countryCode}
                    onChange={set("countryCode")}
                    style={{
                      padding: "10px 10px", border: `1.5px solid ${C.border}`,
                      borderRadius: 8, fontSize: 14, color: C.dark, background: "#fff",
                      flexShrink: 0, width: 90,
                    }}
                  >
                    {["+91", "+1", "+44", "+61", "+971", "+65"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={set("mobile")}
                    placeholder="Enter mobile number"
                    style={{
                      flex: 1, padding: "10px 14px",
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 8, fontSize: 14, color: C.dark,
                      outline: "none", background: "#fff",
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2 – Primary Role */}
          <Card style={{ marginBottom: 24 }}>
            <SectionHeading number={2} title="Primary Role" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {["Batsman", "Bowler", "All Rounder", "Wicket Keeper"].map((role) => (
                <RoleCard
                  key={role}
                  role={role}
                  selected={form.primaryRole === role}
                  onSelect={(r) => setForm((f) => ({ ...f, primaryRole: r }))}
                />
              ))}
            </div>
          </Card>

          {/* Section 3 – Batting Style */}
          <Card style={{ marginBottom: 24 }}>
            <SectionHeading number={3} title="Batting Style" />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {["Right Hand", "Left Hand"].map((v) => (
                <RadioOption
                  key={v}
                  name="battingStyle"
                  value={v}
                  checked={form.battingStyle === v}
                  onChange={set("battingStyle")}
                  label={v}
                />
              ))}
            </div>
          </Card>

          {/* Section 4 – Bowling Style */}
          <Card style={{ marginBottom: 24 }}>
            <SectionHeading number={4} title="Bowling Style" />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                "Right Arm Fast",
                "Right Arm Medium",
                "Right Arm Spin",
                "Left Arm Fast",
                "Left Arm Medium",
                "Left Arm Spin",
                "Not Applicable",
              ].map((v) => (
                <RadioOption
                  key={v}
                  name="bowlingStyle"
                  value={v}
                  checked={form.bowlingStyle === v}
                  onChange={set("bowlingStyle")}
                  label={v}
                />
              ))}
            </div>
          </Card>

          {/* Section 5 – Wicket Keeper */}
          <Card style={{ marginBottom: 24 }}>
            <SectionHeading number={5} title="Are you a Wicket Keeper?" />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {["Yes", "No"].map((v) => (
                <RadioOption
                  key={v}
                  name="isKeeper"
                  value={v}
                  checked={form.isKeeper === v}
                  onChange={set("isKeeper")}
                  label={v}
                />
              ))}
            </div>
          </Card>

          {/* Section 6 – All Rounder */}
          <Card style={{ marginBottom: 24 }}>
            <SectionHeading number={6} title="Are you an All Rounder?" />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {["Yes", "No"].map((v) => (
                <RadioOption
                  key={v}
                  name="isAllRounder"
                  value={v}
                  checked={form.isAllRounder === v}
                  onChange={set("isAllRounder")}
                  label={v}
                />
              ))}
            </div>
          </Card>

          {/* Section 7 – Upload Photo */}
          <Card style={{ marginBottom: 32 }}>
            <SectionHeading number={7} title="Upload Passport Size Photo" />
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileRef.current?.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Upload passport size photo"
              style={{
                border: `2px dashed ${dragOver ? C.blue : C.border}`,
                borderRadius: 12,
                padding: "36px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "#eff6ff" : "#fafbfc",
                transition: "border-color .15s, background .15s",
              }}
            >
              {photoPreview ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: 110, height: 110, borderRadius: 8, objectFit: "cover", border: `2px solid ${C.border}` }}
                  />
                  <span style={{ fontSize: 13, color: C.muted }}>Click or drag to replace photo</span>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📸</div>
                  <p style={{ margin: "0 0 6px", fontWeight: 600, color: C.dark, fontSize: 15 }}>
                    Drag & drop your photo here
                  </p>
                  <p style={{ margin: "0 0 16px", color: C.muted, fontSize: 13 }}>
                    or click to browse files
                  </p>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "#f0f1f5", border: `1px solid ${C.border}`,
                    borderRadius: 6, padding: "6px 14px", fontSize: 12, color: C.muted,
                  }}>
                    📄 JPG / PNG &nbsp;·&nbsp; Max 2 MB &nbsp;·&nbsp; Passport size
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: "none" }}
              onChange={(e) => handlePhoto(e.target.files[0])}
            />
          </Card>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 14 }}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setForm(DEFAULT_FORM);
                setPhotoPreview(null);
                setBanner(null);
              }}
            >
              Reset Form
            </Button>
            <Button variant="primary" type="submit" disabled={loading} style={{ minWidth: 180 }}>
              {loading ? "Submitting…" : "Submit Registration"}
            </Button>
          </div>

        </form>
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: C.heroTop,
        padding: "18px 32px",
        textAlign: "center",
        color: "rgba(255,255,255,.45)",
        fontSize: 13,
      }}>
        © {new Date().getFullYear()} CricAuction · All rights reserved &nbsp;|&nbsp; Secure Registration Portal
      </div>
    </div>
  );
}