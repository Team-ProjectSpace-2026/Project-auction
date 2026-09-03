import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, Trash2, Check, X, Download } from "lucide-react";
import pdfMake from "pdfmake/build/pdfmake.js";
import vfsModule from "pdfmake/build/vfs_fonts.js";
import * as playerService from "../../services/playerService";
import { getTournament } from "../../services/tournamentService";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import CricketLoader from "../common/CricketLoader";
import PlayerForm from "../players/PlayerForm";

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
  const [tournament, setTournament] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const fetchPlayers = async () => {
    if (!tournamentId) return;
    try {
      const res = await playerService.getPlayers(tournamentId);
      setPlayers(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (!tournamentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const start = Date.now();

    Promise.all([
      playerService.getPlayers(tournamentId),
      getTournament(tournamentId).catch(() => ({ data: null })),
    ])
      .then(async ([playersRes, tournamentRes]) => {
        const elapsed = Date.now() - start;
        const minDelay = 1000;
        if (elapsed < minDelay) {
          await new Promise((r) => setTimeout(r, minDelay - elapsed));
        }
        if (!cancelled) {
          setPlayers(playersRes.data);
          if (tournamentRes?.data) setTournament(tournamentRes.data);
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

  const handleVerifyPayment = async (playerId, status) => {
    try {
      await playerService.verifyPlayerPayment(playerId, status);
      setPlayers((prev) =>
        prev.map((p) => (p._id === playerId ? { ...p, paymentStatus: status } : p))
      );
    } catch (err) {
      console.error("Failed to verify player payment:", err);
      alert(err.response?.data?.message || "Failed to update payment status");
    }
  };

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

  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedScreenshot) {
        setSelectedScreenshot(null);
      }
    };
    if (selectedScreenshot) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedScreenshot]);

  const getPaymentStatusBadge = (player) => {
    const status = player.paymentStatus || "free";
    const utr = player.paymentDetails?.utrLast4;
    const screenshot = player.paymentDetails?.paymentScreenshot;
    const isCash = player.paymentDetails?.paymentCode === "CASH" || player.paymentDetails?.utrNumber === "CASH_PAYMENT";

    if (status === "verified" || status === "completed") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#dcfce7", color: "#15803d", width: "fit-content" }}>
            ✓ VERIFIED
          </span>
          {isCash && (
            <span style={{ fontSize: "10px", color: "#047857", fontWeight: "700", paddingLeft: "2px" }}>
              💵 Cash
            </span>
          )}
        </div>
      );
    }
    if (status === "pending_verification") {
      const fullUtr = player.paymentDetails?.utrNumber || (utr ? `...${utr}` : "");
      const payCode = player.paymentDetails?.paymentCode || "";
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#fef3c7", color: "#b45309" }}>
            ⏳ PENDING
          </span>
          {payCode && (
            <span style={{ fontSize: "10px", color: "#475569", fontWeight: "700" }}>
              Code: {payCode}
            </span>
          )}
          {fullUtr && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "#1e293b", fontWeight: "700", fontFamily: "monospace" }}>
                UTR: {fullUtr}
              </span>
              {player.paymentDetails?.utrNumber && (
                <button
                  type="button"
                  title="Copy 12-Digit UTR"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard?.writeText(player.paymentDetails.utrNumber);
                    alert(`Copied UTR: ${player.paymentDetails.utrNumber}`);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "11px" }}
                >
                  📋
                </button>
              )}
            </div>
          )}
          {screenshot && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedScreenshot(playerPhotoUrl(screenshot));
              }}
              style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: "6px", padding: "2px 6px", fontSize: "10px", color: "#2563eb", fontWeight: "600", cursor: "pointer" }}
            >
              📸 View Receipt
            </button>
          )}
        </div>
      );
    }
    if (status === "rejected") {
      return (
        <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#fef2f2", color: "#b91c1c" }}>
          ✕ REJECTED
        </span>
      );
    }
    return (
      <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "600", background: "#f3f4f6", color: "#6b7280" }}>
        Free
      </span>
    );
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
          Manage all registered players and verify entry fee payments.
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
            onClick={() => setShowAddModal(true)}
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
                <th>Batting</th>
                <th>Bowling</th>
                <th>Payment</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary-light)" }}>
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
                    <td>
                      {getPaymentStatusBadge(player)}
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
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {player.paymentStatus === "pending_verification" && (
                          <>
                            <button
                              title="Approve / Verify Payment"
                              onClick={() => handleVerifyPayment(player._id, "verified")}
                              style={{ border: "none", background: "#dcfce7", color: "#15803d", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "3px" }}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              title="Reject Payment"
                              onClick={() => handleVerifyPayment(player._id, "rejected")}
                              style={{ border: "none", background: "#fef2f2", color: "#dc2626", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "3px" }}
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/player-details/${player._id}`, { state: { tournamentId: propTournamentId } })}
                          style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }}
                          title="View Player Details"
                        >
                          <Eye size={16} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDelete(player._id)}
                          style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }}
                          title="Delete Player"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt Image Preview Modal */}
      {selectedScreenshot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Payment Receipt Proof"
          onClick={() => setSelectedScreenshot(null)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.75)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px"
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: "20px", borderRadius: "16px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: "700" }}>Payment Receipt Proof</h3>
            <img src={selectedScreenshot} alt="Payment Screenshot Proof" style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "8px", objectFit: "contain" }} />
            <div style={{ marginTop: "16px" }}>
              <button
                autoFocus
                onClick={() => setSelectedScreenshot(null)}
                style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Person / Cash Add Player Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add Player"
          onClick={() => setShowAddModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--card-bg-light, #ffffff)",
              borderRadius: "20px",
              maxWidth: "850px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
          >
            {tournament?.isPaid && tournament?.registrationFee > 0 && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  marginBottom: "20px",
                  color: "#166534",
                  fontSize: "13px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "22px" }}>💵</span>
                <div>
                  <strong>In-Person Cash Payment:</strong> Registration fee is ₹{tournament.registrationFee}.
                  Since this player is registered directly by the organizer with cash, no QR code or payment screenshot proof is needed — payment will be automatically recorded as <strong>Paid in Cash (Verified)</strong>.
                </div>
              </div>
            )}
            <PlayerForm
              tournamentId={tournamentId}
              defaultBasePrice={tournament?.playerBasePrice}
              onSaved={() => {
                setShowAddModal(false);
                fetchPlayers();
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersTab;
