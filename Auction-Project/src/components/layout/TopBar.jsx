import { useLocation, Link } from 'react-router-dom';
import batsmanLogo from '../../assets/cricauctionlogo1.png';

const TopBar = ({ user }) => {
  const location = useLocation();

  const showBackLink = location.pathname !== '/dashboard' && location.pathname !== '/';

  return (
    <header className="topbar">
      <div className="topbar-left">
        {showBackLink && (
          <Link to="/dashboard" className="back-link">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        )}
        
        {/* Logo link to landing page - always visible except on landing page itself */}
        {location.pathname !== '/' && (
          <Link to="/" className="topbar-brand" aria-label="Go to Landing Page">
            <img src={batsmanLogo} alt="CricAuction logo" className="topbar-logo" />
            <span className="brand-text">Cric<span className="accent">Auction</span></span>
          </Link>
        )}
      </div>

      <div className="topbar-right">
        <div className="user-profile-menu">
          <div className="user-avatar">
            {user?.photo ? (
              <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          
          <div className="user-info">
            <div className="user-name">
              {user?.name || 'User'}
            </div>
            <div className="user-role">
              {user?.role || 'Organizer'}
            </div>
          </div>
          
          <svg className="dropdown-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
