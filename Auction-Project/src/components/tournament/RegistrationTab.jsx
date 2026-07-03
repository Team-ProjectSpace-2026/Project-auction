import { useState } from "react";

const RegistrationTab = ({ tournament }) => {
  const [copied, setCopied] = useState(false);

  if (!tournament) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary-light)" }}>
        Loading tournament data...
      </div>
    );
  }

  const tournamentId = tournament?.id || tournament?._id || "";
  const registrationUrl = tournamentId
    ? `${window.location.origin}/register/${tournamentId}`
    : "";

  const handleCopyLink = async () => {
    if (!registrationUrl) return;
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = registrationUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    window.open(registrationUrl, "_blank");
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
      }}
    >
      {/* Left Panel */}
      <div
        style={{
          background: "var(--card-bg-light)",
          border: "1px solid var(--border-light)",
          borderRadius: "16px",
          padding: "30px",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "var(--text-primary-light)",
          }}
        >
          Registration Link
        </h2>

        {/* Status Box */}
        <div
          style={{
            background: "var(--status-active-bg)",
            border: "1px solid var(--status-active-text)",
            borderRadius: "12px",
            padding: "22px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "var(--status-active-text)",
              marginBottom: "6px",
            }}
          >
            Registration Status
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: "var(--status-active-text)",
            }}
          >
            Open
          </div>
        </div>

        <p
          style={{
            color: "var(--text-secondary-light)",
            fontSize: "15px",
            marginBottom: "20px",
          }}
        >
          Share this link with players to allow them to register for this
          tournament.
        </p>

        <label
          style={{
            display: "block",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          Registration URL
        </label>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          <input
            type="text"
            readOnly
            value={registrationUrl}
            style={{
              flex: 1,
              height: "50px",
              padding: "0 16px",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              fontSize: "14px",
              background: "var(--input-bg)",
              color: "var(--input-text)",
              transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
            }}
          />

          <button
            onClick={handleCopyLink}
            style={{
              width: "130px",
              height: "50px",
              border: "1px solid var(--accent-light)",
              borderRadius: "10px",
              background: copied ? "var(--status-active-bg)" : "var(--card-bg-light)",
              color: copied ? "var(--status-active-text)" : "var(--accent-light)",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <button
          onClick={handleOpenLink}
          style={{
            padding: "12px 28px",
            border: "1px solid var(--accent-light)",
            borderRadius: "10px",
            background: "var(--card-bg-light)",
            color: "var(--accent-light)",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "28px",
            transition: "background-color 0.2s ease, color 0.2s ease",
          }}
        >
          Open Link
        </button>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--border-light)",
            marginBottom: "28px",
          }}
        />

        <h3
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "var(--text-primary-light)",
          }}
        >
          Registration Settings
        </h3>

        <div>
          <SettingRow
            label="Registration Start Date"
            value="01 May 2027, 10:00 AM"
          />

          <SettingRow
            label="Registration End Date"
            value="15 Jun 2027, 11:59 PM"
          />

          <SettingRow
            label="Allow Player Registration"
            value="Yes"
            green
          />

          <SettingRow
            label="Require Player Profile"
            value="Yes"
            green
          />

          <SettingRow
            label="Maximum Players"
            value="18 Players Per Team"
          />

          <SettingRow
            label="Players Can Edit Profile"
            value="Yes"
            green
            last
          />
        </div>
      </div>

      {/* Right Panel */}
      <div
        style={{
          background: "var(--card-bg-light)",
          border: "1px solid var(--border-light)",
          borderRadius: "16px",
          padding: "28px",
          height: "fit-content",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <h3
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "var(--text-primary-light)",
          }}
        >
          Note
        </h3>

        <div
          style={{
            background: "var(--warning-bg)",
            border: "1px solid var(--warning-border)",
            borderRadius: "12px",
            padding: "22px",
            color: "var(--warning-text)",
            lineHeight: "1.9",
          }}
        >
          Players can register until
          <br />
          <strong>15 Jun 2027, 11:59 PM</strong>
          <br />
          After that, the registration link
          <br />
          will be closed.
        </div>
      </div>
    </div>
  );
};

const SettingRow = ({ label, value, green, last }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid var(--border-light)",
      }}
    >
      <span style={{ color: "var(--text-secondary-light)" }}>{label}</span>

      <strong
        style={{
          color: green ? "var(--status-active-text)" : "var(--text-primary-light)",
        }}
      >
        {value}
      </strong>
    </div>
  );
};

export default RegistrationTab;
