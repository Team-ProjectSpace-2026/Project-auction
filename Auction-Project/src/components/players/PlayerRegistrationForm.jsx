import { useState, useRef, useMemo } from "react";
import { Check, X } from "lucide-react";
import Cropper from "react-easy-crop";
import InputField from "../common/InputField.jsx";
import Button from "../common/Button.jsx";
import roleBatsman from "../../assets/Batsman_Logo1.png";
import roleBowler from "../../assets/Bowler_logo1.png";
import roleAllrounder from "../../assets/AllRounder_Logo1.png";

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
};

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

// ─── Inline sub-components ────────────────────────────────────────────────────
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

const ROLE_ICONS = {
  Batsman:       roleBatsman,
  Bowler:        roleBowler,
  "All Rounder": roleAllrounder,
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
      <img src={ROLE_ICONS[role]} alt={role} style={{ width: 80, height: 80, objectFit: "contain" }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: selected ? C.blue : C.dark, textAlign: "center" }}>
        {role}
      </span>
      {selected && (
        <span style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          width: 20, height: 20, borderRadius: "50%", background: C.blue, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}><Check size={12} strokeWidth={3} /></span>
      )}
    </button>
  );
}

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
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {type === "success" ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
        {message}
      </span>
    </div>
  );
}

// ─── Default form state ──────────────────────────────────────────────────────
// ─── Default form state ──────────────────────────────────────────────────────
const DEFAULT_FORM = {
  playerName:     "",
  age:            "",
  mobile:         "",
  email:          "",
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

// ─── Main Component ──────────────────────────────────────────────────────────
const PlayerRegistrationForm = ({
  initialData,
  onSubmit,
  submitLabel = "Submit Registration",
  showBasePrice = false,
  basePriceValue = 0,
  onBasePriceChange,
  isPaid = false,
  payoutUpiId = "",
  registrationFee = 0,
  qrCodeDataUrl = "",
  loading = false,
  error: externalError = null,
  banner: externalBanner = null,
  resetOnSubmit = true,
}) => {
  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM, ...initialData }));
  const [photoPreview, setPhotoPreview] = useState(initialData?.photoPreview || null);
  const [dragOver, setDragOver]         = useState(false);
  const [crop, setCrop]                 = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                 = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [internalBanner, setInternalBanner] = useState(null);
  const fileRef = useRef(null);
  const screenshotRef = useRef(null);

  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [utrLast4, setUtrLast4] = useState("");

  const banner = externalBanner || internalBanner;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function createPhotoPreviewUrl(file) {
    if (!file) return null;
    if (!["image/jpeg", "image/png"].includes(file.type)) return null;
    return URL.createObjectURL(file);
  }

  function handlePhoto(file) {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setInternalBanner({ type: "error", message: "Only JPG / PNG files are allowed." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setInternalBanner({ type: "error", message: "File size must be under 2 MB." });
      return;
    }
    setForm((f) => ({ ...f, photo: file }));
    setPhotoPreview(createPhotoPreviewUrl(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setInternalBanner(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handlePhoto(e.dataTransfer.files[0]);
  }

  function onCropComplete(croppedArea, croppedAreaPx) {
    setCroppedAreaPixels(croppedAreaPx);
  }

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
    setInternalBanner(null);

    if (!form.playerName.trim()) return setInternalBanner({ type: "error", message: "Player name is required." });
    if (!form.age || +form.age < 10 || +form.age > 60) return setInternalBanner({ type: "error", message: "Enter a valid age (10-60)." });
    if (!form.mobile || form.mobile.length < 7) return setInternalBanner({ type: "error", message: "Enter a valid mobile number." });
    if (!showBasePrice && (!form.email || !form.email.trim())) return setInternalBanner({ type: "error", message: "Email address is required for your registration confirmation." });
    if (!form.primaryRole) return setInternalBanner({ type: "error", message: "Please select a primary role." });
    if (battingEnabled && !form.battingStyle) return setInternalBanner({ type: "error", message: "Please select batting style." });
    if (bowlingEnabled && !form.bowlingStyle) return setInternalBanner({ type: "error", message: "Please select bowling style." });

    if (isPaid && !paymentScreenshot) {
      return setInternalBanner({ type: "error", message: "Please upload payment screenshot proof before submitting." });
    }

    let croppedFile = null;
    if (form.photo && photoPreview && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(photoPreview, croppedAreaPixels);
        croppedFile = new File([croppedBlob], "photo.jpg", { type: "image/jpeg" });
      } catch {
        croppedFile = form.photo;
      }
    } else if (form.photo) {
      croppedFile = form.photo;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && k !== "photo") formData.append(k, v);
    });
    if (croppedFile) formData.append("photo", croppedFile);
    if (paymentScreenshot) formData.append("paymentScreenshot", paymentScreenshot);
    if (utrLast4) formData.append("utrLast4", utrLast4.trim());

    try {
      await onSubmit(formData, form);
      if (resetOnSubmit) {
        setForm({ ...DEFAULT_FORM });
        setPhotoPreview(null);
        setPaymentScreenshot(null);
        setScreenshotPreview(null);
        setUtrLast4("");
      }
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
      setInternalBanner({ type: "error", message: msg });
    }
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {banner && <Banner type={banner.type} message={banner.message} />}
      {externalError && (
        <div style={{
          padding: "14px 18px", background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: 8, color: "#991b1b", fontSize: 14, fontWeight: 500, marginBottom: 20,
        }}>
          {externalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* Section 1 - Personal Info */}
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
            <InputField
              label="Email Address (for Digital Pass & Receipt)"
              id="email"
              type="email"
              required
              value={form.email}
              onChange={set("email")}
              placeholder="e.g. player@gmail.com"
            />
          </div>
        </Card>

        {/* Section 2 - Jersey Details */}
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
              <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.dark }}>
                Jersey Size
              </label>
              <select
                value={form.jerseySize}
                onChange={set("jerseySize")}
                className="input-control"
                style={{
                  width: "100%", padding: "12px 14px",
                  border: `1px solid ${C.border}`, borderRadius: 10,
                  fontSize: 14, background: "#fff", color: C.text,
                }}
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

        {/* Section 3 - Primary Role */}
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

        {/* Section 4 - Batting Style */}
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

        {/* Section 5 - Bowling Style */}
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

        {/* Section 6 - Wicket Keeper */}
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

        {/* Section 7 - All Rounder */}
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

        {/* Admin-only: Base Price */}
        {showBasePrice && (
          <Card style={{ marginBottom: 24 }}>
            <SectionHeading number={8} title="Auction Details" />
            <div style={{ maxWidth: 300 }}>
              <InputField
                label="Base Price"
                id="basePrice"
                type="number"
                value={basePriceValue}
                onChange={(e) => onBasePriceChange?.(e.target.value)}
                min={0}
                placeholder="e.g. 50000"
              />
            </div>
          </Card>
        )}

        {/* Upload Photo Section */}
        <Card style={{ marginBottom: 24 }}>
          <SectionHeading number={showBasePrice ? 9 : 8} title="Upload Player Photo" />

          {!photoPreview ? (
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
              <div style={{ fontSize: 40, marginBottom: 10 }}>&#128248;</div>
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
                JPG / PNG &nbsp;&middot;&nbsp; 3:4 ratio &nbsp;&middot;&nbsp; Max 2 MB
              </div>
            </div>
          ) : (
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

              <div style={{ display: "flex", alignItems: "center", gap: 12, width: 300 }}>
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

        {/* Paid Tournament: Payment Details & Proof Input */}
        {isPaid && (() => {
          const fee = Number(registrationFee);

          return (
            <Card style={{ marginBottom: 32, border: "2px solid #2563eb", background: "#ffffff", boxShadow: "0 8px 24px rgba(37,99,235,0.08)" }}>
              <SectionHeading number={showBasePrice ? 10 : 9} title="Entry Fee & Payment Verification" />

              {/* Payment Info Card */}
              {payoutUpiId ? (
                <div style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "24px",
                }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
                    
                    {/* Left Info & Actions */}
                    <div style={{ flex: "1 1 300px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "10px" }}>
                        📲 100% DIRECT UPI TO ORGANIZER
                      </div>
                      <h4 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>
                        Entry Fee: ₹{fee}
                      </h4>
                      <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                        Pay directly using <strong>Google Pay, PhonePe, Paytm, or BHIM</strong> to the organizer's UPI ID or QR code below.
                      </p>

                      {/* UPI ID Copy Line */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "12px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>UPI ID:</span>
                        <code style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{payoutUpiId}</code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(payoutUpiId);
                            alert(`UPI ID "${payoutUpiId}" copied to clipboard!`);
                          }}
                          style={{
                            marginLeft: "auto",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            color: "#2563eb"
                          }}
                        >
                          Copy UPI ID
                        </button>
                      </div>
                    </div>

                    {/* Right Desktop/Mobile QR Code */}
                    {qrCodeDataUrl && (
                      <div style={{
                        textAlign: "center",
                        background: "#ffffff",
                        padding: "14px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        flexShrink: 0
                      }}>
                        <img
                          src={qrCodeDataUrl}
                          alt="UPI QR Code"
                          style={{ width: 140, height: 140, borderRadius: "8px", display: "block", margin: "0 auto 6px" }}
                        />
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>
                          Scan to Pay ₹{fee}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Payment Screenshot Upload Box */}
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px dashed #cbd5e1" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>
                      Upload Payment Screenshot <span>*</span>
                    </label>
                    <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#64748b" }}>
                      Please upload a screenshot of your successful UPI payment as proof.
                    </p>

                    {!screenshotPreview ? (
                      <div
                        onClick={() => screenshotRef.current?.click()}
                        style={{
                          border: "2px dashed #3b82f6",
                          borderRadius: "12px",
                          padding: "24px 16px",
                          textAlign: "center",
                          cursor: "pointer",
                          background: "#eff6ff",
                          transition: "background .15s",
                        }}
                      >
                        <div style={{ fontSize: "28px", marginBottom: "4px" }}>📸</div>
                        <p style={{ margin: "0 0 4px", fontWeight: "600", color: "#1d4ed8", fontSize: "14px" }}>
                          Click to upload Payment Screenshot
                        </p>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          JPG / PNG &nbsp;&middot;&nbsp; Max 2MB
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#ffffff", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <img
                          src={screenshotPreview}
                          alt="Payment Screenshot"
                          style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                        />
                        <div>
                          <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "13px", color: "#166534" }}>
                            ✓ Screenshot attached
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentScreenshot(null);
                              setScreenshotPreview(null);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            Remove / Change Screenshot
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      ref={screenshotRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (!["image/jpeg", "image/png"].includes(file.type)) {
                            alert("Only JPG / PNG files are allowed");
                            return;
                          }
                          if (file.size > 2 * 1024 * 1024) {
                            alert("File size must be under 2MB");
                            return;
                          }
                          setPaymentScreenshot(file);
                          setScreenshotPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>

                  {/* Optional UTR Number Input */}
                  <div style={{ marginTop: "16px" }}>
                    <InputField
                      label="UPI Reference / UTR Number (Optional)"
                      id="utrLast4"
                      value={utrLast4}
                      onChange={(e) => setUtrLast4(e.target.value)}
                      placeholder="e.g. 423456789012"
                    />
                  </div>
                </div>
              ) : (
                <div style={{
                  background: "#fffbebf5",
                  border: "1px solid #fde68a",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                  color: "#92400e",
                  fontSize: "14px",
                }}>
                  <strong>⚠️ Payment Not Configured:</strong> Registration fee is ₹{fee}, but the tournament organizer has not set up a UPI ID yet.
                </div>
              )}
            </Card>
          );
        })()}

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 14 }}>
          <Button variant="primary" type="submit" disabled={loading} style={{ minWidth: 180 }}>
            {loading ? "Submitting\u2026" : isPaid ? "Submit Registration & Proof" : submitLabel}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default PlayerRegistrationForm;
