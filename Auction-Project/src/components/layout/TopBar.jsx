import { useLocation, Link } from 'react-router-dom';

const TopBar = ({ user }) => {
  const location = useLocation();
  
  // Determine if we should show the "Back" link (hide it on the main dashboard)
  const showBackLink = location.pathname !== '/dashboard' && location.pathname !== '/';

  return (
    <header className="topbar">
      {/* Left side: Conditional Back Link */}
      <div className="topbar-left">
        {showBackLink && (
          <Link to="/dashboard" className="back-link">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        )}
      </div>

      {/* Right side: Notifications and Profile */}
      <div className="topbar-right">
        <button className="notif-btn" aria-label="Notifications">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {/* Optional: Add a red notification dot here later */}
          <span className="notif-dot"></span>
        </button>

        <div className="user-profile-menu">
          {/* Avatar */}
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'R'}
          </div>
          
          {/* User Details */}
          <div className="user-info">
            <div className="user-name">
              {user?.name || 'Rahul Organizer'}
            </div>
            <div className="user-role">
              {user?.role || 'Organizer'}
            </div>
          </div>
          
          {/* Dropdown Chevron */}
          <svg className="dropdown-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </div>
      </div>
    </header>
  );
};

export default TopBar;