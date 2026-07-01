import { useState, useRef, useCallback } from "react";
import { FiX, FiUpload } from "react-icons/fi";

const AddTeamModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    teamName: "",
    ownerName: "",
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleClose = useCallback(() => {
    setFormData({ teamName: "", ownerName: "" });
    setLogoPreview(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const { teamName, ownerName } = formData;

    if (!teamName.trim() || !ownerName.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const short = generateShort(teamName);

    onSubmit({
      name: teamName.trim(),
      short,
      ownerName: ownerName.trim(),
      logo: logoPreview || "",
      budget: 0,
      totalBudget: 0,
      remainingBudget: 0,
      maxPlayers: 18,
    });

    setFormData({ teamName: "", ownerName: "" });
    setLogoPreview(null);
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
        {/* Header */}
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
            Add New Team
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Logo Upload */}
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

          {/* Team Name */}
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

          {/* Owner Name */}
          <div style={{ marginBottom: "24px" }}>
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

          {/* Buttons */}
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
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: "var(--accent-light)",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Add Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;
