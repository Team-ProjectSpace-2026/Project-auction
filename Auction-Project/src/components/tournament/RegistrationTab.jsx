import { useState, useEffect } from "react";
import * as tournamentService from "../../services/tournamentService.js";

const RegistrationTab = ({ tournament }) => {
  const [copied, setCopied] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tournament?.registrationEndDate) {
      const d = new Date(tournament.registrationEndDate);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDeadline(local);
    }
  }, [tournament]);

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

  const isClosed = tournament.registrationEndDate && now > new Date(tournament.registrationEndDate);

  const localMin = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const auctionDateLocal = tournament.date
    ? new Date(new Date(tournament.date).getTime() - new Date(tournament.date).getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";

  const handleCopyLink = async () => {
    if (!registrationUrl) return;
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  const handleSaveDeadline = async () => {
    setSaveMsg(null);

    if (deadline && new Date(deadline) < now) {
      setSaveMsg({ type: "error", text: "Deadline must be today or a future date." });
      setTimeout(() => setSaveMsg(null), 4000);
      return;
    }

    if (deadline && tournament.date && new Date(deadline) >= new Date(tournament.date)) {
      setSaveMsg({ type: "error", text: "Registration deadline must be before the auction date." });
      setTimeout(() => setSaveMsg(null), 4000);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        registrationEndDate: deadline ? new Date(deadline).toISOString() : null,
      };
      await tournamentService.updateRegistrationDeadline(tournamentId, payload);
      setSaveMsg({ type: "success", text: "Deadline saved successfully!" });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch {
      setSaveMsg({ type: "error", text: "Failed to save deadline." });
      setTimeout(() => setSaveMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const formatDeadline = (dateStr) => {
    if (!dateStr) return "Not set";
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
      }}
    >
      {/* Left Panel — Link Sharing */}
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
            background: isClosed ? "var(--status-inactive-bg, #fef2f2)" : "var(--status-active-bg)",
            border: `1px solid ${isClosed ? "var(--status-inactive-text, #ef4444)" : "var(--status-active-text)"}`,
            borderRadius: "12px",
            padding: "22px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: isClosed ? "var(--status-inactive-text, #ef4444)" : "var(--status-active-text)",
              marginBottom: "6px",
            }}
          >
            Registration Status
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: isClosed ? "var(--status-inactive-text, #ef4444)" : "var(--status-active-text)",
            }}
          >
            {isClosed ? "Closed" : "Open"}
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
            transition: "background-color 0.2s ease, color 0.2s ease",
          }}
        >
          Open Link
        </button>
      </div>

      {/* Right Panel — Deadline Settings */}
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
            marginBottom: "8px",
            color: "var(--text-primary-light)",
          }}
        >
          Registration Deadline
        </h3>

        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary-light)",
            marginBottom: "20px",
            lineHeight: "1.5",
          }}
        >
          Set when registration closes. Players won't be able to register after this date.
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px",
              fontSize: "14px",
              color: "var(--text-secondary-light)",
            }}
          >
            End Date &amp; Time
          </label>
          <input
            type="datetime-local"
            value={deadline}
            min={localMin}
            max={auctionDateLocal}
            onChange={(e) => setDeadline(e.target.value)}
            style={{
              width: "100%",
              height: "46px",
              padding: "0 14px",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              fontSize: "14px",
              background: "var(--input-bg)",
              color: "var(--input-text)",
              transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleSaveDeadline}
            disabled={saving}
            style={{
              flex: 1,
              padding: "11px 20px",
              border: "none",
              borderRadius: "10px",
              background: "var(--accent-light)",
              color: "#fff",
              fontWeight: "700",
              fontSize: "14px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {saving ? "Saving..." : "Save Deadline"}
          </button>

          {deadline && (
            <button
              onClick={() => { setDeadline(""); setSaveMsg(null); }}
              style={{
                padding: "11px 18px",
                border: "1px solid var(--border-light)",
                borderRadius: "10px",
                background: "var(--card-bg-light)",
                color: "var(--text-secondary-light)",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background-color 0.2s ease, color 0.2s ease",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {saveMsg && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "500",
              background: saveMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${saveMsg.type === "success" ? "#86efac" : "#fca5a5"}`,
              color: saveMsg.type === "success" ? "#166534" : "#991b1b",
            }}
          >
            {saveMsg.text}
          </div>
        )}

        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--border-light)",
            margin: "20px 0",
          }}
        />

        <div
          style={{
            background: "var(--warning-bg)",
            border: "1px solid var(--warning-border)",
            borderRadius: "12px",
            padding: "18px",
            color: "var(--warning-text)",
            lineHeight: "1.8",
            fontSize: "14px",
          }}
        >
          {tournament.registrationEndDate ? (
            <>
              Players can register until
              <br />
              <strong>{formatDeadline(tournament.registrationEndDate)}</strong>
              <br />
              After that, registration will
              <br />
              automatically close.
            </>
          ) : (
            <>
              No deadline set yet.
              <br />
              Registration is currently
              <br />
              <strong>open indefinitely</strong>.
              <br />
              Pick a date above to auto-close
              <br />
              registration.
            </>
          )}
          {auctionDateLocal && (
            <>
              <br />
              <span style={{ fontSize: "12px", opacity: 0.75 }}>
                Auction date: {formatDeadline(tournament.date)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationTab;
