import { useState, useRef, useCallback, useEffect } from "react";
import { FiX, FiUpload } from "react-icons/fi";

const IPL_PRESETS = {
  CSK: { primary: "#FDB913", secondary: "#0081C6" },
  MI: { primary: "#004BA0", secondary: "#D1AB3E" },
  RCB: { primary: "#EC1C24", secondary: "#E6B800" },
  KKR: { primary: "#3A225D", secondary: "#F3E06C" },
  DC: { primary: "#000080", secondary: "#FF0000" },
  RR: { primary: "#EA1B8E", secondary: "#254AA5" },
  SRH: { primary: "#FF822A", secondary: "#000000" },
  PBKS: { primary: "#ED1F24", secondary: "#D2D3D5" },
  LSG: { primary: "#0057A4", secondary: "#E4A115" },
  GT: { primary: "#1B2544", secondary: "#C3A056" },
};

const getIplColors = (name) => {
  const clean = name.trim().toUpperCase();
  for (const [key, val] of Object.entries(IPL_PRESETS)) {
    if (clean.includes(key)) {
      return val;
    }
  }
  const lower = clean.toLowerCase();
  if (lower.includes("chennai") || lower.includes("kings")) {
    if (lower.includes("punjab")) return IPL_PRESETS.PBKS;
    return IPL_PRESETS.CSK;
  }
  if (lower.includes("mumbai") || lower.includes("indians")) return IPL_PRESETS.MI;
  if (lower.includes("bengaluru") || lower.includes("bangalore") || lower.includes("challengers")) return IPL_PRESETS.RCB;
  if (lower.includes("kolkata") || lower.includes("riders")) return IPL_PRESETS.KKR;
  if (lower.includes("delhi") || lower.includes("capitals")) return IPL_PRESETS.DC;
  if (lower.includes("rajasthan") || lower.includes("royals")) return IPL_PRESETS.RR;
  if (lower.includes("hyderabad") || lower.includes("sunrisers")) return IPL_PRESETS.SRH;
  if (lower.includes("lucknow") || lower.includes("giants")) return IPL_PRESETS.LSG;
  if (lower.includes("gujarat") || lower.includes("titans")) return IPL_PRESETS.GT;
  return null;
};

const EditTeamModal = ({ isOpen, onClose, onSubmit, team }) => {
  const [formData, setFormData] = useState({
    teamName: "",
    ownerName: "",
    maxPlayers: "18",
    primaryColor: "#1e3a8a",
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (team && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        teamName: team.name || "",
        ownerName: team.ownerName || "",
        maxPlayers: (team.maxPlayers || 18).toString(),
        primaryColor: team.primaryColor || "#1e3a8a",
      });
      setLogoPreview(team.logo || null);
    }
  }, [team, isOpen]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen || !team) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "teamName") {
        const ipl = getIplColors(value);
        if (ipl) {
          next.primaryColor = ipl.primary;
        }
      }
      return next;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Logo file size cannot exceed 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateShort = (name) => {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((w) => w[0].toUpperCase())
      .join("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { teamName, ownerName, maxPlayers, primaryColor } = formData;

    if (!teamName.trim() || !ownerName.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const parsedMaxPlayers = Number(maxPlayers);
    if (!Number.isFinite(parsedMaxPlayers) || parsedMaxPlayers < 1) {
      alert("Max players must be a number greater than 0.");
      return;
    }

    setIsSubmitting(true);

    const short = generateShort(teamName);

    try {
      await onSubmit(team._id, {
        name: teamName.trim(),
        short,
        ownerName: ownerName.trim(),
        logo: logoPreview || "",
        maxPlayers: parsedMaxPlayers,
        primaryColor,
        budget: team.budget || team.totalBudget || undefined,
        totalBudget: team.totalBudget || team.budget || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div
        className="modal-content"
        style={{ maxWidth: "480px", padding: "28px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--text-primary-light)",
              margin: 0,
            }}
          >
            Edit Team
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary-light)",
              fontSize: "20px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "16px",
                background: "var(--info-bg)",
                border: "2px dashed var(--border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Team Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FiUpload
                  size={28}
                  style={{ color: "var(--text-secondary-light)" }}
                />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-light)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {logoPreview ? "Change Logo" : "Upload Team Logo"}
            </button>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-primary-light)",
                marginBottom: "6px",
              }}
            >
              Team Name <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              name="teamName"
              value={formData.teamName}
              onChange={handleInputChange}
              placeholder="Enter team name"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--input-border)",
                borderRadius: "6px",
                fontSize: "14px",
                color: "var(--input-text)",
                backgroundColor: "var(--input-bg)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-primary-light)",
                marginBottom: "6px",
              }}
            >
              Owner Name <span style={{ color: "#e74c3c" }}>*</span>
            </label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              placeholder="Enter owner name"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--input-border)",
                borderRadius: "6px",
                fontSize: "14px",
                color: "var(--input-text)",
                backgroundColor: "var(--input-bg)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-primary-light)",
                  marginBottom: "6px",
                }}
              >
                Max Players
              </label>
              <input
                type="number"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleInputChange}
                placeholder="18"
                min="1"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--input-border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "var(--input-text)",
                  backgroundColor: "var(--input-bg)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-primary-light)",
                  marginBottom: "6px",
                }}
              >
                Team Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  style={{
                    border: "none",
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    padding: 0,
                    backgroundColor: "transparent",
                  }}
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  placeholder="#1e3a8a"
                  style={{
                    flex: 1,
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid var(--input-border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "var(--input-text)",
                    backgroundColor: "var(--input-bg)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid var(--border-light)",
                background: "var(--card-bg-light)",
                color: "var(--text-primary-light)",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: isSubmitting ? "var(--text-secondary-light)" : "var(--accent-light)",
                color: "#fff",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeamModal;