const OverviewTab = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
      }}
    >
      {/* Left Card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8eaf0",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <h3
          style={{
            marginBottom: "20px",
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          Tournament Information
        </h3>

        {[
          ["Tournament Name", "Summer League 2027"],
          ["Number of Teams", "12 Teams"],
          ["Budget Per Team", "₹25,00,000"],
          ["Maximum Players", "18 Players"],
          ["Venue", "Mangalore Cricket Stadium"],
          ["Auction Date", "20 Jun 2027"],
          ["Format", "T20 League"],
          ["Status", "Active"],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: "1px solid #eef1f5",
            }}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}

        <button
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #2563eb",
            color: "#2563eb",
            background: "#fff",
            fontWeight: "700",
          }}
        >
          Edit Tournament
        </button>
      </div>

      {/* Right Side */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>
            Quick Actions
          </h3>

          <button
            style={{
              width: "100%",
              marginBottom: "10px",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            Registration Link
          </button>

          <button
            style={{
              width: "100%",
              marginBottom: "10px",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            Manage Teams
          </button>

          <button
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            Manage Players
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>
            Summary
          </h3>

          <p>Total Teams : 12</p>
          <p>Total Registered Players : 78</p>
          <p>Players Sold : 0</p>
          <p>Auction Status : Upcoming</p>
          <p>Created On : 01 Jun 2027</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;