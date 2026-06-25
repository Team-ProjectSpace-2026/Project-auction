// src/components/layout/Sidebar.jsx

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: "🏠" },
  { key: "tournaments", label: "Tournaments", icon: "🏆" },
  { key: "settings", label: "Settings", icon: "⚙️" },
  { key: "logout", label: "Logout", icon: "🚪" },
];

import { useNavigate } from "react-router-dom";

const Sidebar = ({ activePage = "dashboard", onNavigate }) => {
  const navigate = useNavigate();
  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        background: "#0f1535",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
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
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
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
                    // Perform logout cleanup: clear any stored auth tokens or session data
                    try {
                      localStorage.removeItem("authToken");
                      sessionStorage.removeItem("authToken");
                    } catch {
                      // ignore errors during cleanup
                    }
                    navigate("/login");
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
                background: isActive ? "#2563eb" : "transparent",
                color: isActive ? "#fff" : isLogout ? "#f87171" : "#9db0d4",
                fontSize: "14px",
                fontWeight: isActive ? 700 : 500,
                textAlign: "left",
                transition: "background 0.15s",
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
    </aside>
  );
};

export default Sidebar;
