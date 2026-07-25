import { useRef } from "react";
import Button from "./Button";

const Avatar = ({ imageSrc, onPhotoChange }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onPhotoChange(file);
  };

  return (
    <div className="avatar-section">
      <h3 className="section-title">Profile Photo</h3>
      <div className="avatar-wrapper">
        <div className="avatar-circle">
          {imageSrc ? (
            <img src={imageSrc} alt="Profile" className="avatar-img" />
          ) : (
            <span className="avatar-placeholder">👤</span>
          )}
        </div>

        <button
          type="button"
          className="camera-badge"
          onClick={handleClick}
          aria-label="Upload Photo"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
      </div>

      <p className="upload-hint">JPG, PNG or GIF. Max size of 2MB.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      <div className="avatar-actions">
        <Button variant="outline" onClick={handleClick}>
          Change Photo
        </Button>
      </div>
    </div>
  );
};

export default Avatar;
