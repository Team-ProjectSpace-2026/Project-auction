import { useState, useEffect, useRef } from "react";
import * as playerService from "../../services/playerService";
import InputField from "../common/InputField.jsx";
import Button from "../common/Button.jsx";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const PlayerForm = ({ playerId, tournamentId, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    role: "Batsman",
    style: "",
    keeper: false,
    basePrice: 0,
    age: "",
    mobile: "",
    countryCode: "+91",
    battingStyle: "Right Hand",
    bowlingStyle: "Not Applicable",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const previewUrlRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (playerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      playerService
        .getPlayers(tournamentId)
        .then((res) => {
          const p = res.data.find((pl) => pl._id === playerId);
          if (p) {
            setForm({
              name: p.name || "",
              role: p.role || "Batsman",
              style: p.style || "",
              keeper: p.keeper || false,
              basePrice: p.basePrice || 0,
              age: p.age || "",
              mobile: p.mobile || "",
              countryCode: p.countryCode || "+91",
              battingStyle: p.battingStyle || "Right Hand",
              bowlingStyle: p.bowlingStyle || "Not Applicable",
            });
            if (p.photo) {
              setPhotoPreview(`${API_BASE}/uploads/photos/${encodeURIComponent(p.photo)}`);
            }
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || err.message || "Failed to load player");
        })
        .finally(() => setLoading(false));
    }
  }, [playerId, tournamentId]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG/PNG files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be under 2MB");
      return;
    }
    setPhoto(file);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const newUrl = URL.createObjectURL(file);
    previewUrlRef.current = newUrl;
    setPhotoPreview(newUrl);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });
      if (photo) formData.append("photo", photo);

      if (playerId) {
        await playerService.updatePlayer(playerId, formData);
      } else {
        formData.append("tournamentId", tournamentId);
        await playerService.createPlayer(formData);
      }
      if (onSaved) onSaved();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      if (validationErrors && Array.isArray(validationErrors)) {
        const msgs = validationErrors.map((e) => `${e.path}: ${e.msg}`).join(", ");
        setError(msgs);
      } else {
        setError(err.response?.data?.message || err.message || "Failed to save player");
      }
    } finally {
      setLoading(false);
    }
  };

  const sectionStyle = {
    background: "var(--card-bg-light)",
    border: "1px solid var(--border-light)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    transition: "background-color 0.2s ease, border-color 0.2s ease",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: "24px", color: "var(--text-primary-light)", fontSize: "24px", fontWeight: "700" }}>
        {playerId ? "Edit Player" : "Add Player"}
      </h3>

      {error && (
        <div style={{
          padding: "14px 18px", background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: "10px", color: "#991b1b", marginBottom: "20px", fontSize: "14px",
        }}>
          {error}
        </div>
      )}

      {/* Personal Information */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "18px", color: "var(--text-primary-light)", fontSize: "16px", fontWeight: "600" }}>
          Personal Information
        </h4>
        <div style={gridStyle}>
          <InputField
            label="Player Name *"
            id="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />
          <InputField
            label="Age"
            id="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            placeholder="e.g. 24"
            min={10}
            max={60}
          />
          <InputField
            label="Mobile"
            id="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="Enter mobile number"
          />
          <InputField
            label="Base Price"
            id="basePrice"
            type="number"
            value={form.basePrice}
            onChange={handleChange}
            min={0}
          />
        </div>
      </div>

      {/* Role & Style */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "18px", color: "var(--text-primary-light)", fontSize: "16px", fontWeight: "600" }}>
          Role & Style
        </h4>
        <div style={gridStyle}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "var(--text-primary-light)" }}>
              Role *
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input-control"
              style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border-light)", borderRadius: "10px", fontSize: "14px", background: "var(--input-bg)", color: "var(--input-text)" }}
            >
              <option>Batsman</option>
              <option>Bowler</option>
              <option>All Rounder</option>
              <option>Wicket Keeper</option>
            </select>
          </div>
          <InputField
            label="Playing Style *"
            id="style"
            value={form.style}
            onChange={handleChange}
            placeholder="e.g. Right Hand Bat"
            required
          />
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "var(--text-primary-light)" }}>
              Batting Style
            </label>
            <select
              name="battingStyle"
              value={form.battingStyle}
              onChange={handleChange}
              className="input-control"
              style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border-light)", borderRadius: "10px", fontSize: "14px", background: "var(--input-bg)", color: "var(--input-text)" }}
            >
              <option>Right Hand</option>
              <option>Left Hand</option>
            </select>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "var(--text-primary-light)" }}>
              Bowling Style
            </label>
            <select
              name="bowlingStyle"
              value={form.bowlingStyle}
              onChange={handleChange}
              className="input-control"
              style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border-light)", borderRadius: "10px", fontSize: "14px", background: "var(--input-bg)", color: "var(--input-text)" }}
            >
              <option>Right Arm Fast</option>
              <option>Right Arm Medium</option>
              <option>Right Arm Spin</option>
              <option>Left Arm Fast</option>
              <option>Left Arm Medium</option>
              <option>Left Arm Spin</option>
              <option>Not Applicable</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="keeper"
              checked={form.keeper}
              onChange={handleChange}
              style={{ width: "18px", height: "18px", accentColor: "var(--accent-light)" }}
            />
            <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary-light)" }}>Is Wicket Keeper</span>
          </label>
        </div>
      </div>

      {/* Photo Upload */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "18px", color: "var(--text-primary-light)", fontSize: "16px", fontWeight: "600" }}>
          Player Photo
        </h4>
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handlePhotoChange}
            style={{ fontSize: "14px" }}
          />
          <p style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-secondary-light)" }}>
            JPG or PNG, max 2MB
          </p>
          {photoPreview && (
            <img
              // lgtm[js/dom/xss] React auto-escapes JSX attribute values; blob: and API URLs only
              src={photoPreview.startsWith("blob:") || photoPreview.startsWith(`${API_BASE}`) ? photoPreview : undefined}
              alt="Preview"
              style={{
                marginTop: "12px", width: "100px", height: "133px",
                objectFit: "cover", borderRadius: "10px",
                border: "1px solid var(--border-light)",
              }}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "14px", justifyContent: "flex-end" }}>
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={loading} style={{ minWidth: "160px" }}>
          {loading ? "Saving..." : playerId ? "Update Player" : "Add Player"}
        </Button>
      </div>
    </form>
  );
};

export default PlayerForm;
