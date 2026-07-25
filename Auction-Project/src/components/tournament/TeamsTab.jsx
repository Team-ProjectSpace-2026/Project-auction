import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddTeamModal from "../teams/AddTeamModal";
import EditTeamModal from "../teams/EditTeamModal";
import TeamCard from "../teams/TeamCard";
import CricketLoader from "../common/CricketLoader";
import { getTeams, createTeam, updateTeam, deleteTeam } from "../../services/teamService";

const TeamsTab = ({ tournamentId }) => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const start = Date.now();
      const { data } = await getTeams(tournamentId);
      // Ensure loader shows for at least 2 seconds
      const elapsed = Date.now() - start;
      const minDelay = 2000;
      if (elapsed < minDelay) {
        await new Promise((r) => setTimeout(r, minDelay - elapsed));
      }
      setTeams(data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError("Failed to load teams. Please try again.");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeams();
  }, [fetchTeams]);

  const handleAddTeam = async (newTeam) => {
    try {
      const { data } = await createTeam(newTeam);
      setTeams((prev) => [...prev, data]);
      setShowAddModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create team. Please try again.";
      const details = err.response?.data?.errors;
      const detailMsg = details ? details.map(e => e.msg).join("\n") : "";
      alert(detailMsg ? `${msg}\n\n${detailMsg}` : msg);
      throw err;
    }
  };

  const handleEditTeam = async (teamId, updatedData) => {
    try {
      const { data } = await updateTeam(teamId, updatedData);
      setTeams((prev) =>
        prev.map((t) => (t._id === teamId ? data : t))
      );
      setEditTeam(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update team. Please try again.";
      const details = err.response?.data?.errors;
      const detailMsg = details ? details.map(e => e.msg).join("\n") : "";
      alert(detailMsg ? `${msg}\n\n${detailMsg}` : msg);
      throw err;
    }
  };

  const handleDeleteTeam = async (team) => {
    setTeamToDelete(team);
  };

  const confirmDelete = async () => {
    if (!teamToDelete) return;
    try {
      await deleteTeam(teamToDelete._id);
      setTeams((prev) => prev.filter((t) => t._id !== teamToDelete._id));
    } catch (err) {
      console.error("Failed to delete team:", err);
      alert("Failed to delete team. Please try again.");
    } finally {
      setTeamToDelete(null);
    }
  };

  const handleViewTeam = (team) => {
    navigate(`/team-details/${team._id}`, { state: { tournamentId } });
  };

  return (
    <div>
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
            fontSize: "32px",
            fontWeight: "700",
            margin: 0,
          }}
        >
          Teams
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "var(--accent-light)",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          + Add Team
        </button>
      </div>

      {loading && <CricketLoader text="Loading teams..." />}

      {error && (
        <div style={{ textAlign: "center", padding: "40px", color: "#e74c3c" }}>
          {error}
          <button
            onClick={fetchTeams}
            style={{
              marginLeft: "12px",
              padding: "6px 16px",
              borderRadius: "6px",
              border: "1px solid var(--accent-light)",
              background: "transparent",
              color: "var(--accent-light)",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && teams.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary-light)" }}>
          No teams yet. Click "+ Add Team" to create one.
        </div>
      )}

      {!loading && !error && teams.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "22px",
          }}
        >
          {teams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              onView={handleViewTeam}
              onEdit={setEditTeam}
              onDelete={handleDeleteTeam}
            />
          ))}
        </div>
      )}

      <AddTeamModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTeam}
        tournamentId={tournamentId}
      />

      <EditTeamModal
        isOpen={!!editTeam}
        onClose={() => setEditTeam(null)}
        onSubmit={handleEditTeam}
        team={editTeam}
      />

      {teamToDelete && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setTeamToDelete(null); }}
        >
          <div style={{
            width: "380px", background: "var(--card-bg-light)", borderRadius: "16px",
            padding: "32px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%", background: "#fef3c7",
              display: "flex", justifyContent: "center", alignItems: "center",
              margin: "0 auto 20px", fontSize: "28px", color: "#d97706",
            }}>
              🗑️
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary-light)", marginBottom: "8px" }}>
              Delete Team
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary-light)", marginBottom: "28px" }}>
              Are you sure you want to delete "{teamToDelete.name}"? This will release all purchased players back to the pool.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setTeamToDelete(null)}
                style={{
                  flex: 1, padding: "12px", borderRadius: "10px",
                  border: "1px solid var(--border-light)", background: "var(--card-bg-light)",
                  color: "var(--text-primary-light)", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1, padding: "12px", borderRadius: "10px", border: "none",
                  background: "#ef4444", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsTab;