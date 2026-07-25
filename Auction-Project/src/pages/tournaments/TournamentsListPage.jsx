import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import CricketLoader from "../../components/common/CricketLoader";
import { getTournaments, deleteTournament } from "../../services/tournamentService";
import { Pencil, Trash2, Trophy, Calendar, Users, MapPin, IndianRupee } from "lucide-react";
import bgStadium from "../../assets/bgstadium2.png";

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

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getStatusStyle = (status) => {
  if (status === "Active") return { background: "#dcfce7", color: "#15803d" };
  if (status === "Upcoming") return { background: "#dbeafe", color: "#2563eb" };
  return { background: "#e5e7eb", color: "#4b5563" };
};

const TournamentsListPage = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("tournaments");
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const start = Date.now();
        const res = await getTournaments();
        // Ensure loader shows for at least 2 seconds
        const elapsed = Date.now() - start;
        const minDelay = 2000;
        if (elapsed < minDelay) {
          await new Promise((r) => setTimeout(r, minDelay - elapsed));
        }
        setTournaments(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load tournaments");
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('[data-menu-id]')) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const filtered = useMemo(() => {
    let list = tournaments;
    if (search) {
      list = list.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== "All Status") {
      list = list.filter((t) => getDynamicStatus(t.date) === statusFilter);
    }
    return list;
  }, [tournaments, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTournament(deleteModal._id);
      setTournaments((prev) => prev.filter((t) => t._id !== deleteModal._id));
      setDeleteModal(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete tournament");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div
        style={{
          marginLeft: "220px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        {/* Fixed background image */}
        <div style={{
          position: "fixed",
          top: 0,
          left: "220px",
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bgStadium})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }} />

        <main style={{ padding: "28px 28px 28px", overflow: "visible", position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--text-primary-light)",
              margin: 0,
            }}
          >
            Tournaments
          </h1>

          <p
            style={{
              color: "var(--text-secondary-light)",
              fontSize: "14px",
              marginTop: "4px",
              marginBottom: "16px",
            }}
          >
            Manage all your cricket tournaments.
          </p>

<div
                style={{
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  borderRadius: "16px",
                  border: "1px solid var(--glass-border)",
                  padding: "18px",
                  transition: "background-color 0.2s ease, border-color 0.2s ease",
                }}
              >
            {/* Search Row */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <input
                placeholder="Search tournament by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "var(--bg-secondary-light)",
                  color: "var(--text-primary-light)",
                  transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
                }}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: "200px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                  padding: "14px",
                  backgroundColor: "var(--bg-secondary-light)",
                  color: "var(--text-primary-light)",
                  transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
                }}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Upcoming</option>
                <option>Completed</option>
              </select>

<button
                     onClick={() => navigate("/create-tournament")}
                     style={{
                       background: "rgba(37, 99, 235, 0.9)",
                       color: "#fff",
                       border: "1px solid transparent",
                       borderRadius: "10px",
                       padding: "14px 24px",
                       fontWeight: "700",
                       cursor: "pointer",
                     }}
                   >
                     + New Tournament
                   </button>
            </div>

            {/* Loading / Error */}
            {loading && <CricketLoader text="Loading tournaments..." />}

            {error && (
              <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
                {error}
              </div>
            )}

            {/* Cards */}
            {!loading && !error && (
              <>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary-light)" }}>
                    No tournaments found.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                      gap: "20px",
                    }}
                  >
                    {filtered.map((tournament) => {
                      return (
<div
                          key={tournament._id}
                          style={{
                            background: "var(--glass-bg)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1px solid var(--glass-border)",
                            borderRadius: "14px",
                            padding: "16px",
                            position: "relative",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.12)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
                          }}
                        >
                        {/* 3-Dot Menu */}
                        <div style={{ position: "absolute", top: "14px", right: "14px" }} data-menu-id={tournament._id}>
                          <div
                            onClick={() => setMenuOpen(menuOpen === tournament._id ? null : tournament._id)}
                            style={{
                              width: "30px",
                              height: "30px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: "var(--text-secondary-light)",
                              borderRadius: "8px",
                              fontSize: "16px",
                              letterSpacing: "2px",
                              transition: "background-color 0.15s ease, color 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "var(--bg-primary-light)";
                              e.currentTarget.style.color = "var(--text-primary-light)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "var(--text-secondary-light)";
                            }}
                          >
                            ⋮
                          </div>

                          {menuOpen === tournament._id && (
                            <div
                              style={{
                                position: "absolute",
                                top: "calc(100% + 4px)",
                                right: 0,
                                background: "var(--card-bg-light)",
                                border: "1px solid var(--border-light)",
                                borderRadius: "12px",
                                boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                                zIndex: 20,
                                minWidth: "170px",
                                overflow: "hidden",
                                padding: "6px",
                              }}
                            >
                              <div
                                onClick={() => {
                                  setMenuOpen(null);
                                  navigate("/edit-tournament", {
                                    state: { tournament },
                                    params: { tournamentId: tournament._id },
                                  });
                                }}
                                style={{
                                  padding: "10px 14px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  color: "var(--text-primary-light)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  borderRadius: "8px",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-primary-light)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              >
                                <Pencil size={15} strokeWidth={2} />
                                Edit
                              </div>
                              <div style={{ height: "1px", background: "var(--border-light)", margin: "4px 8px" }} />
                              <div
                                onClick={() => {
                                  setMenuOpen(null);
                                  setDeleteError(null);
                                  setDeleteModal(tournament);
                                }}
                                style={{
                                  padding: "10px 14px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  color: "#ef4444",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  borderRadius: "8px",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              >
                                <Trash2 size={15} strokeWidth={2} />
                                Delete
                              </div>
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "14px",
                            marginBottom: "16px",
                          }}
                        >
                          <div
                            style={{
                              width: "68px",
                              height: "68px",
                              borderRadius: "12px",
                              background: "var(--bg-secondary-light)",
                              border: "1px solid var(--border-light)",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "32px",
                              overflow: "hidden",
                              transition: "background-color 0.2s ease, border-color 0.2s ease",
                            }}
                          >
                            {tournament.logo ? (
                              <img
                                src={tournament.logo || ""}
                                alt={tournament.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <Trophy size={28} strokeWidth={1.5} style={{ color: "var(--text-secondary-light)" }} />
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "20px",
                                fontWeight: "700",
                                color: "var(--text-primary-light)",
                                marginBottom: "8px",
                                transition: "color 0.2s ease",
                              }}
                            >
                              {tournament.name}
                            </h3>

                            <span
                              style={{
                                ...getStatusStyle(getDynamicStatus(tournament.date)),
                                padding: "4px 12px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              {getDynamicStatus(tournament.date)}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            borderTop: "1px solid var(--border-light)",
                            paddingTop: "14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            transition: "border-color 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-secondary-light)", transition: "color 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Calendar size={14} strokeWidth={2} /> Auction Date
                            </span>
                            <strong style={{ color: "var(--text-primary-light)", transition: "color 0.2s ease" }}>
                              {formatDate(tournament.date)}
                            </strong>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-secondary-light)", transition: "color 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Users size={14} strokeWidth={2} /> Teams
                            </span>
                            <strong style={{ color: "var(--text-primary-light)", transition: "color 0.2s ease" }}>
                              {tournament.teams} Teams
                            </strong>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-secondary-light)", transition: "color 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}>
                              <MapPin size={14} strokeWidth={2} /> Venue
                            </span>
                            <strong style={{ color: "var(--text-primary-light)", transition: "color 0.2s ease", textAlign: "right", maxWidth: "60%" }}>
                              {tournament.venue || "—"}
                            </strong>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-secondary-light)", transition: "color 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}>
                              <IndianRupee size={14} strokeWidth={2} /> Registration
                            </span>
                            <strong style={{ color: tournament.isPaid ? "#2563eb" : "#16a34a", transition: "color 0.2s ease" }}>
                              {tournament.isPaid ? `Paid (₹${tournament.registrationFee})` : "Free"}
                            </strong>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                          <button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/register/${tournament._id}`;
                              const text = `Register as a player for *${tournament.name}*!\n${tournament.isPaid ? `Entry Fee: ₹${tournament.registrationFee}` : 'Free Registration'}\n\nClick link to register: ${shareUrl}`;
                              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            style={{
                              flex: "1",
                              height: "44px",
                              borderRadius: "999px",
                              border: "none",
                              background: "var(--accent-light)",
                              color: "#fff",
                              fontWeight: "700",
                              cursor: "pointer",
                              fontSize: "13px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                              transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.45)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.3)";
                            }}
                            title="Share Registration Link on WhatsApp"
                          >
                            Share
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/tournament-details/${tournament._id}`, {
                                state: { tournament },
                              })
                            }
                            style={{
                              flex: "1.5",
                              height: "44px",
                              padding: "0 24px",
                              borderRadius: "45px",
                              border: "1px solid var(--accent-light)",
                              background: "var(--glass-bg)",
                              color: "var(--accent-light)",
                              fontWeight: "600",
                              fontSize: "13px",
                              textTransform: "uppercase",
                              letterSpacing: "2px",
                              cursor: "pointer",
                              boxShadow: "0px 8px 15px rgba(37, 99, 235, 0.1)",
                              backdropFilter: "blur(16px)",
                              WebkitBackdropFilter: "blur(16px)",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--accent-light)";
                              e.currentTarget.style.color = "#fff";
                              e.currentTarget.style.boxShadow = "0px 15px 20px rgba(37, 99, 235, 0.4)";
                              e.currentTarget.style.transform = "translateY(-7px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--glass-bg)";
                              e.currentTarget.style.color = "var(--accent-light)";
                              e.currentTarget.style.boxShadow = "0px 8px 15px rgba(37, 99, 235, 0.1)";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                            onMouseDown={(e) => {
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseUp={(e) => {
                              e.currentTarget.style.transform = "translateY(-7px)";
                            }}
                          >
                            Details →
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                {filtered.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "24px",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--text-secondary-light)",
                        fontSize: "14px",
                        transition: "color 0.2s ease",
                      }}
                    >
                      Showing 1 to {filtered.length} of {filtered.length} tournaments
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => !deleting && (setDeleteModal(null), setDeleteError(null))}
        >
          <div
            style={{
              background: "var(--card-bg-light)",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "420px",
              width: "90%",
              boxShadow: "0 8px 30px rgba(15,23,42,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: "20px",
                fontWeight: "700",
                color: "var(--text-primary-light)",
              }}
            >
              Delete Tournament?
            </h3>

            <p
              style={{
                margin: "0 0 24px",
                fontSize: "14px",
                color: "var(--text-secondary-light)",
                lineHeight: "1.6",
              }}
            >
              Are you sure you want to delete <strong style={{ color: "var(--text-primary-light)" }}>"{deleteModal.name}"</strong>? This action cannot be undone.
            </p>

            {deleteError && (
              <p
                style={{
                  margin: "0 0 24px",
                  fontSize: "14px",
                  color: "#ef4444",
                  background: "rgba(239,68,68,0.1)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  lineHeight: "1.5",
                }}
              >
                {deleteError}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => { setDeleteModal(null); setDeleteError(null); }}
                disabled={deleting}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                  background: "var(--card-bg-light)",
                  color: "var(--text-primary-light)",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  opacity: deleting ? 0.6 : 1,
                  transition: "background-color 0.2s ease",
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsListPage;
