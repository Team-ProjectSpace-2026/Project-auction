const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatCurrency = (val) => {
  if (!val && val !== 0) return "—";
  return "₹" + Number(val).toLocaleString("en-IN");
};

const getDynamicStatus = (date) => {
  if (!date) return "Upcoming";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const auctionDate = new Date(date);
  auctionDate.setHours(0, 0, 0, 0);
  if (auctionDate < today) return "Completed";
  if (auctionDate.getTime() === today.getTime()) return "Active";
  return "Upcoming";
};

const OverviewTab = ({ tournament, teamsCount, playersCount }) => {
  const t = tournament || {};
  const dynamicStatus = getDynamicStatus(t.date);

  const infoRows = [
    ["Tournament Name", t.name || "—"],
    ["Number of Teams", t.teams ? `${t.teams} Teams` : "—"],
    ["Budget Per Team", formatCurrency(t.budgetPerTeam)],
    ["Maximum Players", t.maxPlayersPerTeam ? `${t.maxPlayersPerTeam} Players` : "—"],
    ["Player Base Price", formatCurrency(t.playerBasePrice)],
    ["Venue", t.venue || "—"],
    ["Auction Date", formatDate(t.date)],
    ["Status", dynamicStatus],
  ];

  const createdOn = t.createdAt ? formatDate(t.createdAt) : "—";
  const auctionStatus = t.auctionStatus
    ? t.auctionStatus.charAt(0).toUpperCase() + t.auctionStatus.slice(1)
    : dynamicStatus;

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
          background: "var(--card-bg-light)",
          border: "1px solid var(--border-light)",
          borderRadius: "16px",
          padding: "24px",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
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

        {infoRows.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
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
            background: "var(--card-bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "20px",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
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
            background: "var(--card-bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "20px",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>
            Summary
          </h3>

          <p>Total Teams : {teamsCount || t.teams || 0}</p>
          <p>Total Registered Players : {playersCount || 0}</p>
          <p>Players Sold : 0</p>
          <p>Auction Status : {auctionStatus}</p>
          <p>Created On : {createdOn}</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
