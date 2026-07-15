import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import CricketLoader from "../../components/common/CricketLoader";
import { getTeam } from "../../services/teamService";

const getRoleStyle = (role) => {
  switch (role) {
    case "Batsman":
      return { background: "#dbeafe", color: "#2563eb" };
    case "Bowler":
      return { background: "#fef3c7", color: "#d97706" };
    case "All Rounder":
      return { background: "#ede9fe", color: "#7c3aed" };
    default:
      return { background: "#dcfce7", color: "#16a34a" };
  }
};

const formatCurrency = (amount) => {
  if (amount == null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const TeamDetailsPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);
        const start = Date.now();
        const { data } = await getTeam(teamId, { signal: controller.signal });
        // Ensure loader shows for at least 2 seconds
        const elapsed = Date.now() - start;
        const minDelay = 2000;
        if (elapsed < minDelay) {
          await new Promise((r) => setTimeout(r, minDelay - elapsed));
        }
        setTeam(data);
        setPlayers(data.players || []);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Failed to fetch team:", err);
        setError("Failed to load team details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
    return () => controller.abort();
  }, [teamId]);

  const exportSquad = () => {
    if (players.length === 0) {
      alert("No players to export.");
      return;
    }

    const escapeCSV = (val) => {
      const str = String(val ?? "");
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const csvContent = [
      ["Player Name", "Jersey #", "Jersey Size", "Jersey Name", "Role", "Purchase Price"],
      ...players.map((p) => [
        escapeCSV(p.name),
        escapeCSV(p.jerseyNumber ?? ""),
        escapeCSV(p.jerseySize || ""),
        escapeCSV(p.jerseyName || ""),
        escapeCSV(p.role),
        escapeCSV(formatCurrency(p.soldPrice)),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(team?.name || "Team").replace(/\s+/g, "_")}_Squad.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary-light)" }}>
        <Sidebar activePage="tournaments" />
        <div style={{ marginLeft: "220px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CricketLoader text="Loading team details..." />
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary-light)" }}>
        <Sidebar activePage="tournaments" />
        <div style={{ marginLeft: "220px", flex: 1, padding: "28px 32px" }}>
          <p style={{ color: "#e74c3c" }}>{error || "Team not found."}</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--accent-light)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
              marginTop: "12px",
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary-light)", transition: "background-color 0.2s ease" }}>
      <Sidebar activePage="tournaments" />

      <div style={{ marginLeft: "220px", flex: 1 }}>
        <main style={{ padding: "28px 32px 32px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--accent-light)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back
          </button>

          {/* Header */}
          <div
            style={{
              background: "var(--card-bg-light)",
              border: "1px solid var(--border-light)",
              borderRadius: "20px",
              padding: "22px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              marginBottom: "24px",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "18px",
                  background: "var(--info-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "var(--accent-light)",
                  overflow: "hidden",
                }}
              >
                {team.logo ? (
                  <img src={team.logo} alt={team.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  team.short
                )}
              </div>

              <div>
                <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-primary-light)", marginBottom: "14px" }}>
                  {team.name}
                </h1>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "var(--text-secondary-light)", fontSize: "16px" }}>
                  <span>Owner: {team.ownerName}</span>
                  <span>Players Purchased: {players.length} / {team.maxPlayers}</span>
                  <span>Remaining Budget: {formatCurrency(team.remainingBudget)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={exportSquad}
              disabled={players.length === 0}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                border: "1px solid var(--accent-light)",
                background: players.length === 0 ? "var(--text-secondary-light)" : "var(--card-bg-light)",
                color: players.length === 0 ? "#fff" : "var(--accent-light)",
                fontWeight: "700",
                cursor: players.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Export Squad
            </button>
          </div>

          {/* Squad List */}
          <div
            style={{
              background: "var(--card-bg-light)",
              border: "1px solid var(--border-light)",
              borderRadius: "20px",
              padding: "24px",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary-light)", marginBottom: "20px" }}>
              Squad List
            </h2>

            {players.length === 0 ? (
              <p style={{ color: "var(--text-secondary-light)", textAlign: "center", padding: "20px" }}>
                No players purchased yet.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--table-header-bg)" }}>
                    <th style={{ padding: "16px", textAlign: "left" }}>#</th>
                    <th style={{ padding: "16px", textAlign: "left" }}>Player Name</th>
                    <th style={{ padding: "16px", textAlign: "left" }}>Jersey #</th>
                    <th style={{ padding: "16px", textAlign: "left" }}>Jersey Size</th>
                    <th style={{ padding: "16px", textAlign: "left" }}>Role</th>
                    <th style={{ padding: "16px", textAlign: "left" }}>Purchase Price</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={player._id || index} style={{ borderTop: "1px solid var(--table-row-border)" }}>
                      <td style={{ padding: "16px" }}>{index + 1}</td>
                      <td style={{ padding: "16px", fontWeight: "600" }}>{player.name}</td>
                      <td style={{ padding: "16px", fontWeight: "600", color: "var(--accent-light)" }}>
                        {player.jerseyNumber ?? "—"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        {player.jerseySize || "—"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "13px",
                            fontWeight: "600",
                            ...getRoleStyle(player.role),
                          }}
                        >
                          {player.role}
                        </span>
                      </td>
                      <td style={{ padding: "16px", fontWeight: "700" }}>
                        {formatCurrency(player.soldPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamDetailsPage;