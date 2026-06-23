const RegistrationTab = () => {
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
          background: "#fff",
          border: "1px solid #e8eaf0",
          borderRadius: "16px",
          padding: "30px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "#1a1d2e",
          }}
        >
          Registration Link
        </h2>

        {/* Status Box */}
        <div
          style={{
            background: "#ecfdf3",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
            padding: "22px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#15803d",
              marginBottom: "6px",
            }}
          >
            Registration Status
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: "700",
              color: "#16a34a",
            }}
          >
            Open
          </div>
        </div>

        <p
          style={{
            color: "#6b7280",
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
            value="https://cricauction.com/register/summer-league-2027"
            style={{
              flex: 1,
              height: "50px",
              padding: "0 16px",
              border: "1px solid #dbe1ea",
              borderRadius: "10px",
              fontSize: "14px",
            }}
          />

          <button
            style={{
              width: "130px",
              height: "50px",
              border: "1px solid #2563eb",
              borderRadius: "10px",
              background: "#fff",
              color: "#2563eb",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Copy Link
          </button>
        </div>

        <button
          style={{
            padding: "12px 28px",
            border: "1px solid #2563eb",
            borderRadius: "10px",
            background: "#fff",
            color: "#2563eb",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "28px",
          }}
        >
          Open Link
        </button>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e8eaf0",
            marginBottom: "28px",
          }}
        />

        <h3
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "#1a1d2e",
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
          background: "#fff",
          border: "1px solid #e8eaf0",
          borderRadius: "16px",
          padding: "28px",
          height: "fit-content",
        }}
      >
        <h3
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "#1a1d2e",
          }}
        >
          Note
        </h3>

        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "12px",
            padding: "22px",
            color: "#9a3412",
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
        borderBottom: last ? "none" : "1px solid #f1f5f9",
      }}
    >
      <span style={{ color: "#64748b" }}>{label}</span>

      <strong
        style={{
          color: green ? "#16a34a" : "#1a1d2e",
        }}
      >
        {value}
      </strong>
    </div>
  );
};

export default RegistrationTab;