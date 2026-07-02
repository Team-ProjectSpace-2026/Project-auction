// src/components/layout/Sidebar.jsx
import { useState } from "react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: "🏠" },
  { key: "tournaments", label: "Tournaments", icon: "🏆" },
  { key: "settings", label: "Settings", icon: "⚙️" },
  { key: "logout", label: "Logout", icon: "🚪" },
];

import { useNavigate } from "react-router-dom";

const Sidebar = ({ activePage = "dashboard", onNavigate }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
    } catch {
      // ignore errors during cleanup
    }
    navigate("/login", { replace: true });
  };

  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        background: "var(--sidebar-bg)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
        transition: "background-color 0.2s ease",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, var(--accent-light), var(--accent-hover-light))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              transition: "all 0.2s ease",
            }}>
            🏏
          </div>
          <span style={{ fontSize: "20px", fontWeight: 800 }}>
            <span style={{ color: "#fff" }}>Cric</span>
            <span style={{ color: "#f59e0b" }}>Auction</span>
          </span>
        </div>
        <div
          style={{
            color: "#6b7db3",
            fontSize: "10px",
            letterSpacing: "1.5px",
            fontWeight: 600,
            paddingLeft: "46px",
            transition: "color 0.2s ease",
          }}
        >
          CRICKET LEAGUE AUCTION
          <br />
          MANAGEMENT
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {navItems.map((item) => {
          const isActive = activePage === item.key;
          const isLogout = item.key === "logout";
          return (
            <button
              key={item.key}
              onClick={() => {
                // If a custom navigation handler is provided, call it first
                if (onNavigate) onNavigate(item.key);
                // Then perform route navigation based on the key
                switch (item.key) {
                  case "dashboard":
                    navigate("/dashboard");
                    break;
                  case "tournaments":
                    // Navigate to the tournaments list page
                    navigate("/tournaments");
                    break;
                  case "settings":
                    // --- CHANGED HERE: Now correctly navigates to the settings page ---
                    navigate("/settings");
                    break;
                  case "logout":
                    setShowLogoutModal(true);
                    break;
                  default:
                    break;
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                marginBottom: "4px",
                background: isActive ? "var(--sidebar-active)" : "transparent",
                color: isActive ? "#fff" : isLogout ? "#f87171" : "var(--sidebar-text)",
                transition: "background-color 0.15s, color 0.15s",
                fontSize: "14px",
                fontWeight: isActive ? 700 : 500,
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

    
      <div
        style={{
          padding: "0 0 0",
          background:
            "linear-gradient(to top, rgba(15,21,53,0) 0%, rgba(15,21,53,1) 60%)",
          position: "relative",
          height: "160px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "160px",
            background: "linear-gradient(to top, #0f1535 30%, transparent)",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            fontSize: "48px",
            paddingBottom: "8px",
            zIndex: 1,
          }}
        >
          🏟️
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "380px",
              background: "var(--card-bg-light)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              transition: "background-color 0.2s ease",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#fef3c7",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 20px",
                fontSize: "28px",
              }}
            >
              🚪
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "var(--text-primary-light)",
                marginBottom: "8px",
                transition: "color 0.2s ease",
              }}
            >
              Confirm Logout
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary-light)",
                marginBottom: "28px",
                transition: "color 0.2s ease",
              }}
            >
              Are you sure you want to logout?
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                  background: "var(--card-bg-light)",
                  color: "var(--text-primary-light)",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                No
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
