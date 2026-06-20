// src/components/layout/TopBar.jsx

const TopBar = ({ user }) => {
  return (
    <header style={{
      height: '64px',
      background: '#fff',
      borderBottom: '1px solid #e8eaf0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 32px',
      gap: '20px',
      position: 'fixed',
      top: 0,
      left: '220px',
      right: 0,
      zIndex: 99,
    }}>
      {/* Notification bell */}
      <button style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '1px solid #e8eaf0', background: '#fff',
        cursor: 'pointer', fontSize: '18px', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        🔔
      </button>

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', color: '#fff', fontWeight: 700,
        }}>
          {user?.name?.charAt(0) || 'R'}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1d2e', lineHeight: 1.2 }}>
            {user?.name || 'Rahul Organizer'}
          </div>
          <div style={{ fontSize: '11px', color: '#8a94a6' }}>
            {user?.role || 'Organizer'}
          </div>
        </div>
        <span style={{ color: '#8a94a6', fontSize: '12px' }}>▾</span>
      </div>
    </header>
  );
};

export default TopBar;