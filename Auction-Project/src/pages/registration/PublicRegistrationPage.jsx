import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cropper from "react-easy-crop";
import InputField from "../../components/common/InputField.jsx";
import Button from "../../components/common/Button.jsx";
import * as playerService from "../../services/playerService.js";


// ─── Design tokens ──────────────────────────────────────────────────────────
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
function RadioOption({ name, value, checked, onChange, label, disabled }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 16px",
      border: `1.5px solid ${checked ? C.blue : C.border}`,
      borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
      background: checked ? "#eff6ff" : "#fff",
      flex: "1 1 0",
      minWidth: 130,
      transition: "border-color .15s, background .15s",
      opacity: disabled ? 0.45 : 1,
      pointerEvents: disabled ? "none" : "auto",
    }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
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

// ─── Constants ───────────────────────────────────────────────────────────────
const PRIMARY_ROLES = ["Batsman", "Bowler", "All Rounder"];

const BOWLING_STYLES = [
  "Right Arm Fast",
  "Right Arm Spin",
  "Left Arm Fast",
  "Left Arm Spin",
  "Not Applicable",
];

const JERSEY_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isFieldEnabled(primaryRole, field) {
  if (!primaryRole) return false;
  if (primaryRole === "Batsman") {
    return field === "battingStyle" || field === "isKeeper";
  }
  if (primaryRole === "Bowler") {
    return field === "battingStyle" || field === "bowlingStyle" || field === "isKeeper";
  }
  if (primaryRole === "All Rounder") {
    return field === "battingStyle" || field === "bowlingStyle" || field === "isKeeper" || field === "isAllRounder";
  }
  return false;
}

// ─── Cropped image helper ─────────────────────────────────────────────────────
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const DEFAULT_FORM = {
  playerName:     "",
  age:            "",
  mobile:         "",
  jerseyNumber:   "",
  jerseySize:     "",
  jerseyName:     "",
  primaryRole:    "",
  battingStyle:   "",
  bowlingStyle:   "",
  isKeeper:       "",
  isAllRounder:   "",
  photo:          null,
};

export default function PublicRegistrationPage() {
  const { tournamentId } = useParams();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [banner, setBanner]             = useState(null);
  const [crop, setCrop]                 = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                 = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileRef = useRef(null);

  // ── Helpers ──
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function createPhotoPreviewUrl(file) {
    if (!file) return null;
    if (!["image/jpeg", "image/png"].includes(file.type)) return null;
    return URL.createObjectURL(file);
  }

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
    setPhotoPreview(createPhotoPreviewUrl(file));
    setBanner(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handlePhoto(e.dataTransfer.files[0]);
  }

  function onCropComplete(croppedArea, croppedAreaPx) {
    setCroppedAreaPixels(croppedAreaPx);
  }

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [photoPreview]);

  function handleRoleSelect(role) {
    setForm((f) => ({
      ...f,
      primaryRole: role,
      battingStyle: isFieldEnabled(role, "battingStyle") ? f.battingStyle : "",
      bowlingStyle: isFieldEnabled(role, "bowlingStyle") ? f.bowlingStyle : "",
      isKeeper:     isFieldEnabled(role, "isKeeper") ? f.isKeeper : "",
      isAllRounder: isFieldEnabled(role, "isAllRounder") ? f.isAllRounder : "",
    }));
  }

  const battingEnabled = useMemo(() => isFieldEnabled(form.primaryRole, "battingStyle"), [form.primaryRole]);
  const bowlingEnabled = useMemo(() => isFieldEnabled(form.primaryRole, "bowlingStyle"), [form.primaryRole]);
  const keeperEnabled  = useMemo(() => isFieldEnabled(form.primaryRole, "isKeeper"), [form.primaryRole]);
  const allRounderEnabled = useMemo(() => isFieldEnabled(form.primaryRole, "isAllRounder"), [form.primaryRole]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setBanner(null);

    if (!form.playerName.trim()) return setBanner({ type: "error", message: "Player name is required." });
    if (!form.age || +form.age < 10 || +form.age > 60) return setBanner({ type: "error", message: "Enter a valid age (10–60)." });
    if (!form.mobile || form.mobile.length < 7) return setBanner({ type: "error", message: "Enter a valid mobile number." });
    if (!form.primaryRole) return setBanner({ type: "error", message: "Please select a primary role." });
    if (battingEnabled && !form.battingStyle) return setBanner({ type: "error", message: "Please select batting style." });
    if (bowlingEnabled && !form.bowlingStyle) return setBanner({ type: "error", message: "Please select bowling style." });

    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && k !== "photo") payload.append(k, v);
    });

    // Crop the photo if one was uploaded
    if (form.photo && photoPreview && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(photoPreview, croppedAreaPixels);
        const croppedFile = new File([croppedBlob], "photo.jpg", { type: "image/jpeg" });
        payload.append("photo", croppedFile);
      } catch {
        payload.append("photo", form.photo);
      }
    } else if (form.photo) {
      payload.append("photo", form.photo);
    }

    try {
      setLoading(true);
      await playerService.registerPlayer(tournamentId, payload);
      setBanner({ type: "success", message: "Registration successful! You have been registered for the tournament." });
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
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(37,99,235,.15)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
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
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "36px 16px 60px" }}>

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
              <InputField
                label="Mobile Number"
                id="mobile"
                type="tel"
                required
                value={form.mobile}
                onChange={set("mobile")}
                placeholder="Enter mobile number"
              />
            </div>
          </Card>

          {/* Section 2 – Jersey Details */}
          <Card style={{ marginBottom: 24 }}>
            <SectionHeading number={2} title="Jersey Details" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
              <InputField
                label="Jersey Number"
                id="jerseyNumber"
                type="number"
                value={form.jerseyNumber}
                onChange={set("jerseyNumber")}
                placeholder="e.g. 10"
              />
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 600, color: "var(--text-primary-light)" }}>
                  Jersey Size
                </label>
                <select
                  value={form.jerseySize}
                  onChange={set("jerseySize")}
                  className="input-control"
                >
                  <option value="">Select size</option>
                  {JERSEY_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <InputField
                label="Name on Jersey"
                id="jerseyName"
                value={form.jerseyName}
                onChange={set("jerseyName")}
                placeholder="e.g. VIRAT"
              />
            </div>
          </Card>

          {/* Section 3 – Primary Role */}
          <Card style={{ marginBottom: 24 }}>
            <SectionHeading number={3} title="Primary Role" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {PRIMARY_ROLES.map((role) => (
                <RoleCard
                  key={role}
                  role={role}
                  selected={form.primaryRole === role}
                  onSelect={handleRoleSelect}
                />
              ))}
            </div>
          </Card>

          {/* Section 4 – Batting Style */}
          <Card style={{
            marginBottom: 24,
            opacity: battingEnabled ? 1 : 0.45,
            pointerEvents: battingEnabled ? "auto" : "none",
            transition: "opacity .2s",
          }}>
            <SectionHeading number={4} title="Batting Style" />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {["Right Hand", "Left Hand"].map((v) => (
                <RadioOption
                  key={v}
                  name="battingStyle"
                  value={v}
                  checked={form.battingStyle === v}
                  onChange={set("battingStyle")}
                  label={v}
                  disabled={!battingEnabled}
                />
              ))}
            </div>
          </Card>

          {/* Section 5 – Bowling Style */}
          <Card style={{
            marginBottom: 24,
            opacity: bowlingEnabled ? 1 : 0.45,
            pointerEvents: bowlingEnabled ? "auto" : "none",
            transition: "opacity .2s",
          }}>
            <SectionHeading number={5} title="Bowling Style" />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {BOWLING_STYLES.map((v) => (
                <RadioOption
                  key={v}
                  name="bowlingStyle"
                  value={v}
                  checked={form.bowlingStyle === v}
                  onChange={set("bowlingStyle")}
                  label={v}
                  disabled={!bowlingEnabled}
                />
              ))}
            </div>
          </Card>

          {/* Section 6 – Wicket Keeper */}
          <Card style={{
            marginBottom: 24,
            opacity: keeperEnabled ? 1 : 0.45,
            pointerEvents: keeperEnabled ? "auto" : "none",
            transition: "opacity .2s",
          }}>
            <SectionHeading number={6} title="Are you a Wicket Keeper?" />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {["Yes", "No"].map((v) => (
                <RadioOption
                  key={v}
                  name="isKeeper"
                  value={v}
                  checked={form.isKeeper === v}
                  onChange={set("isKeeper")}
                  label={v}
                  disabled={!keeperEnabled}
                />
              ))}
            </div>
          </Card>

          {/* Section 7 – All Rounder */}
          <Card style={{
            marginBottom: 24,
            opacity: allRounderEnabled ? 1 : 0.45,
            pointerEvents: allRounderEnabled ? "auto" : "none",
            transition: "opacity .2s",
          }}>
            <SectionHeading number={7} title="Are you an All Rounder?" />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {["Yes", "No"].map((v) => (
                <RadioOption
                  key={v}
                  name="isAllRounder"
                  value={v}
                  checked={form.isAllRounder === v}
                  onChange={set("isAllRounder")}
                  label={v}
                  disabled={!allRounderEnabled}
                />
              ))}
            </div>
          </Card>

          {/* Section 8 – Upload Photo (3:4 ratio) */}
          <Card style={{ marginBottom: 32 }}>
            <SectionHeading number={8} title="Upload Player Photo" />

            {!photoPreview ? (
              /* ── Upload zone (shown before photo is selected) ── */
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
                aria-label="Upload player photo in 3:4 ratio"
                style={{
                  border: `2px dashed ${dragOver ? C.blue : C.border}`,
                  borderRadius: 12,
                  padding: "40px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? "#eff6ff" : "#fafbfc",
                  transition: "border-color .15s, background .15s",
                }}
              >
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
                  JPG / PNG &nbsp;·&nbsp; 3:4 ratio &nbsp;·&nbsp; Max 2 MB
                </div>
              </div>
            ) : (
              /* ── Cropper (shown after photo is selected) ── */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{
                  position: "relative",
                  width: 300,
                  height: 400,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: `2px solid ${C.border}`,
                }}>
                  <Cropper
                    image={photoPreview}
                    aspect={3 / 4}
                    crop={crop}
                    zoom={zoom}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="rect"
                    showGrid={false}
                  />
                </div>

                {/* Zoom slider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: 300 }}>
                  <span style={{ fontSize: 13, color: C.muted, flexShrink: 0 }}>🔍</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    style={{ flex: 1, accentColor: C.blue }}
                  />
                  <span style={{ fontSize: 12, color: C.muted, width: 36, textAlign: "right" }}>
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <p style={{ margin: 0, color: C.muted, fontSize: 13, textAlign: "center" }}>
                  Drag the image to reposition. Use the slider to zoom.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setForm((f) => ({ ...f, photo: null }));
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                  }}
                  style={{
                    background: "none",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontSize: 13,
                    color: C.muted,
                    cursor: "pointer",
                  }}
                >
                  Choose a different photo
                </button>
              </div>
            )}

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
