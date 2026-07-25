import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, Trash2, Check, X, Download } from "lucide-react";
import pdfMake from "pdfmake/build/pdfmake.js";
import vfsModule from "pdfmake/build/vfs_fonts.js";
import * as playerService from "../../services/playerService";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import CricketLoader from "../common/CricketLoader";

const pdfFonts = vfsModule?.pdfMake?.vfs ? vfsModule.pdfMake.vfs : (vfsModule?.default?.pdfMake?.vfs || vfsModule?.default || vfsModule);
if (pdfMake) {
  pdfMake.vfs = pdfFonts;
}


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

const PlayersTab = ({ tournamentId: propTournamentId }) => {
  const navigate = useNavigate();
  const { tournamentId: paramTournamentId } = useParams();
  const tournamentId = propTournamentId || paramTournamentId;
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  useEffect(() => {
    if (!tournamentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const start = Date.now();
    playerService
      .getPlayers(tournamentId)
      .then(async (res) => {
        // Ensure loader shows for at least 2 seconds
        const elapsed = Date.now() - start;
        const minDelay = 2000;
        if (elapsed < minDelay) {
          await new Promise((r) => setTimeout(r, minDelay - elapsed));
        }
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
      const name = p.name || "";
      const matchesSearch =
        !searchTerm ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const downloadPDF = async () => {
    const toBase64 = (url) =>
      fetch(url)
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(
          (blob) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
        )
        .catch(() => null);

    const photos = await Promise.all(
      filteredPlayers.map((p) =>
        p.photo ? toBase64(playerPhotoUrl(p.photo)) : Promise.resolve(null)
      )
    );

    const playerCards = filteredPlayers.map((p, i) => {
      const cardContent = [
        { text: p.name, style: "playerName", margin: [0, 0, 0, 2] },
        { text: `Role: ${p.role}`, style: "playerDetail" },
        { text: `Batting: ${p.battingStyle || "N/A"}`, style: "playerDetail" },
        { text: `Bowling: ${p.bowlingStyle || "N/A"}`, style: "playerDetail" },
        { text: `Keeper: ${p.keeper ? "Yes" : "No"}`, style: "playerDetail" },
      ];

      const cell = photos[i]
        ? [
            {
              columns: [
                { image: photos[i], width: 40, height: 50, fit: [40, 50] },
                { stack: cardContent, width: "*" },
              ],
              columnGap: 8,
            },
          ]
        : [{ stack: cardContent }];

      return cell;
    });

    const rows = [];
    for (let i = 0; i < playerCards.length; i += 2) {
      const left = playerCards[i] || [{}];
      const right = playerCards[i + 1] || [{}];
      rows.push([left, right]);
    }

    const docDefinition = {
      content: [
        { text: "Player List", style: "header", margin: [0, 0, 0, 15] },
        {
          table: {
            widths: ["50%", "50%"],
            body: rows,
          },
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: { fontSize: 20, bold: true, alignment: "center" },
        playerName: { fontSize: 11, bold: true },
        playerDetail: { fontSize: 9, color: "#555" },
      },
      pageMargins: [30, 30, 30, 30],
    };

    pdfMake.createPdf(docDefinition).download("player-list.pdf");
  };

  if (loading) {
    return <CricketLoader text="Loading players..." />;
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
            onClick={downloadPDF}
            style={{
              background: "var(--card-bg-light)", color: "var(--text-primary-light)",
              border: "1px solid var(--border-light)", borderRadius: "12px",
              padding: "12px 20px", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            <Download size={16} /> Download PDF
          </button>
          <button
            onClick={() => window.open(`${window.location.origin}/register/${tournamentId}`, "_blank")}
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
        <div style={{ maxHeight: "60vh", overflowY: "auto", position: "relative" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--table-header-bg)", textAlign: "left", position: "sticky", top: 0, zIndex: 1, boxShadow: "0 1px 0 var(--border-light)" }}>
                <th style={{ padding: "16px" }}>#</th>
                <th>Player Name</th>
                <th>Role</th>
                <th>Batting Style</th>
                <th>Bowling Style</th>
                <th>All Rounder</th>
                <th>Wicket Keeper</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary-light)" }}>
                    No players found.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, index) => (
                  <tr key={player._id} style={{ borderTop: "1px solid var(--table-row-border)" }}>
                    <td style={{ padding: "16px" }}>{index + 1}</td>
                    <td
                      onClick={() => navigate(`/player-details/${player._id}`, { state: { tournamentId: propTournamentId } })}
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
                    <td style={{
                      fontSize: "18px", fontWeight: "700",
                      color: player.battingStyle ? "#16a34a" : "#ef4444",
                    }}>
                      {player.battingStyle ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                    </td>
                    <td style={{
                      fontSize: "18px", fontWeight: "700",
                      color: (player.bowlingStyle && player.bowlingStyle !== "Not Applicable") ? "#16a34a" : "#ef4444",
                    }}>
                      {(player.bowlingStyle && player.bowlingStyle !== "Not Applicable") ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                    </td>
                    <td style={{
                      fontSize: "18px", fontWeight: "700",
                      color: player.role === "All Rounder" ? "#16a34a" : "#ef4444",
                    }}>
                      {player.role === "All Rounder" ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                    </td>
                    <td style={{
                      fontSize: "18px", fontWeight: "700",
                      color: player.keeper ? "#16a34a" : "#ef4444",
                    }}>
                      {player.keeper ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                    </td>
                    <td>
                      {player.isRegistered ? (
                        <span style={{
                          padding: "4px 10px", borderRadius: "999px",
                          fontSize: "11px", fontWeight: "600",
                          background: "#dbeafe", color: "#2563eb",
                        }}>
                          Registered
                        </span>
                      ) : (
                        <span style={{
                          padding: "4px 10px", borderRadius: "999px",
                          fontSize: "11px", fontWeight: "600",
                          background: "#f0fdf4", color: "#16a34a",
                        }}>
                          Added
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/player-details/${player._id}`, { state: { tournamentId: propTournamentId } })}
                        style={{ border: "none", background: "transparent", cursor: "pointer", marginRight: "12px", fontSize: "16px" }}
                      >
                        <Eye size={16} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDelete(player._id)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }}
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlayersTab;
