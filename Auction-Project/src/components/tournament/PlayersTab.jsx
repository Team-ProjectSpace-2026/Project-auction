import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as playerService from "../../services/playerService";

const getRoleStyle = (role) => {
  switch (role) {
    case "Batsman":
      return { background: "#dbeafe", color: "#2563eb" };
    case "Bowler":
      return { background: "#fef3c7", color: "#d97706" };
    case "All Rounder":
      return { background: "#ede9fe", color: "#7c3aed" };
    case "Wicket Keeper":
      return { background: "#dcfce7", color: "#16a34a" };
    default:
      return { background: "#f3f4f6", color: "#6b7280" };
  }
};

const PlayersTab = () => {
  const navigate = useNavigate();
  const { id: tournamentId } = useParams();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  useEffect(() => {
    if (!tournamentId) return;
    let cancelled = false;
    setLoading(true);
    playerService
      .getPlayers(tournamentId)
      .then((res) => {
        if (!cancelled) {
          setPlayers(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tournamentId]);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.mobile && p.mobile.includes(searchTerm));
      const matchesRole =
        roleFilter === "All Roles" || p.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [players, searchTerm, roleFilter]);

  const handleDelete = async (playerId) => {
    if (!window.confirm("Are you sure you want to delete this player?")) return;
    try {
      await playerService.deletePlayer(playerId);
      setPlayers((prev) => prev.filter((p) => p._id !== playerId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete player");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary-light)" }}>
        Loading players...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-primary-light)", marginBottom: "6px" }}>
          Players
        </h2>
        <p style={{ color: "var(--text-secondary-light)", fontSize: "14px" }}>
          Manage all players in this tournament.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <input
          placeholder="Search players by name or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "320px", padding: "14px 16px",
            border: "1px solid var(--border-light)", borderRadius: "12px",
            fontSize: "14px", background: "var(--input-bg)",
            color: "var(--input-text)", outline: "none",
            transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
          }}
        />
        <div style={{ display: "flex", gap: "12px" }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              width: "180px", padding: "14px 16px",
              border: "1px solid var(--border-light)", borderRadius: "12px",
              background: "var(--input-bg)", color: "var(--input-text)",
              cursor: "pointer",
              transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
            }}
          >
            <option>All Roles</option>
            <option>Batsman</option>
            <option>Bowler</option>
            <option>All Rounder</option>
            <option>Wicket Keeper</option>
          </select>
          <button
            style={{
              background: "var(--accent-light)", color: "#fff", border: "none",
              borderRadius: "12px", padding: "12px 20px", fontWeight: "600", cursor: "pointer",
            }}
          >
            + Add Player
          </button>
        </div>
      </div>

      <div style={{
        background: "var(--card-bg-light)", border: "1px solid var(--border-light)",
        borderRadius: "16px", overflow: "hidden",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--table-header-bg)", textAlign: "left" }}>
              <th style={{ padding: "16px" }}>#</th>
              <th>Player Name</th>
              <th>Role</th>
              <th>Player Style</th>
              <th>Keeper</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary-light)" }}>
                  No players found.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player, index) => (
                <tr key={player._id} style={{ borderTop: "1px solid var(--table-row-border)" }}>
                  <td style={{ padding: "16px" }}>{index + 1}</td>
                  <td
                    onClick={() => navigate(`/player-details/${player._id}`)}
                    style={{ fontWeight: "600", color: "var(--accent-light)", cursor: "pointer" }}
                  >
                    {player.name}
                  </td>
                  <td>
                    <span style={{
                      padding: "6px 10px", borderRadius: "8px",
                      fontSize: "12px", fontWeight: "600", ...getRoleStyle(player.role),
                    }}>
                      {player.role}
                    </span>
                  </td>
                  <td>{player.style}</td>
                  <td style={{
                    fontSize: "18px", fontWeight: "700",
                    color: player.keeper ? "#16a34a" : "#ef4444",
                  }}>
                    {player.keeper ? "✓" : "✕"}
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/player-details/${player._id}`)}
                      style={{ border: "none", background: "transparent", cursor: "pointer", marginRight: "12px", fontSize: "16px" }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(player._id)}
                      style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayersTab;
