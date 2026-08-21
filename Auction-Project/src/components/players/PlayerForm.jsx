import { useState, useEffect } from "react";
import * as playerService from "../../services/playerService";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import PlayerRegistrationForm from "./PlayerRegistrationForm.jsx";

const PlayerForm = ({ playerId, tournamentId, onSaved, onCancel }) => {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (playerId) {
      let cancelled = false;
      playerService
        .getPlayers(tournamentId)
        .then((res) => {
          if (cancelled) return;
          const p = res.data.find((pl) => pl._id === playerId);
          if (p) {
            setInitialData({
              playerName:   p.name || "",
              age:          p.age || "",
              mobile:       p.mobile || "",
              jerseyNumber: p.jerseyNumber ?? "",
              jerseySize:   p.jerseySize || "",
              jerseyName:   p.jerseyName || "",
              primaryRole:  p.role || "",
              battingStyle: p.battingStyle || "",
              bowlingStyle: p.bowlingStyle || "",
              isKeeper:     p.keeper ? "Yes" : (p.role ? "No" : ""),
              isAllRounder: "",
              photo:        null,
              photoPreview: p.photo ? playerPhotoUrl(p.photo) : null,
            });
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err.response?.data?.message || err.message || "Failed to load player");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => { cancelled = true; };
    }
  }, [playerId, tournamentId]);

  const handleSubmit = async (formData, rawForm) => {
    setError(null);
    setLoading(true);
    try {
      if (rawForm) {
        if (!formData.has("name") && rawForm.playerName) formData.append("name", rawForm.playerName);
        if (!formData.has("role") && rawForm.primaryRole) formData.append("role", rawForm.primaryRole);
      }
      if (playerId) {
        await playerService.updatePlayer(playerId, formData);
      } else {
        if (!formData.has("tournamentId")) {
          formData.append("tournamentId", tournamentId);
        }
        await playerService.createPlayer(formData);
      }
      if (onSaved) onSaved();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      if (validationErrors && Array.isArray(validationErrors)) {
        const msgs = validationErrors.map((e) => `${e.path}: ${e.msg}`).join(", ");
        setError(msgs);
      } else {
        setError(err.response?.data?.message || err.message || "Failed to save player");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (playerId && loading && !initialData) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading player...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "var(--text-primary-light)", fontSize: "24px", fontWeight: "700" }}>
          {playerId ? "Edit Player" : "Add Player"}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              border: "1px solid var(--border-light)",
              background: "var(--card-bg-light)",
              color: "var(--text-secondary-light)",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <PlayerRegistrationForm
        key={playerId || "new"}
        initialData={playerId ? initialData : undefined}
        onSubmit={handleSubmit}
        submitLabel={playerId ? "Update Player" : "Add Player"}
        loading={loading}
        error={error}
        resetOnSubmit={!playerId}
      />
    </div>
  );
};

export default PlayerForm;
