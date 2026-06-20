// src/components/dashboard/TournamentRow.jsx

const statusColors = {
  Active:    { bg: '#e6f9f0', color: '#1a9e5c' },
  Upcoming:  { bg: '#e8f0fe', color: '#2563eb' },
  Completed: { bg: '#f3f4f6', color: '#6b7280' },
  Draft:     { bg: '#fef9ec', color: '#d97706' },
};

const TournamentRow = ({ tournament, onView }) => {
  const { name, logo, status, auctionDate, teamsCount } = tournament;
  const pill = statusColors[status] || statusColors.Draft;

  return (
    <tr style={{ borderBottom: '1px solid #f0f1f5' }}>
      <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: '#e8f0fe', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '18px', flexShrink: 0,
        }}>
          {logo || '🏏'}
        </div>
        <span style={{ fontWeight: 600, color: '#1a1d2e', fontSize: '14px' }}>{name}</span>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <span style={{
          background: pill.bg, color: pill.color,
          borderRadius: '20px', padding: '4px 12px',
          fontSize: '12px', fontWeight: 600,
        }}>
          {status}
        </span>
      </td>
      <td style={{ padding: '14px 16px', color: '#5c6478', fontSize: '14px' }}>{auctionDate}</td>
      <td style={{ padding: '14px 16px', color: '#5c6478', fontSize: '14px', textAlign: 'center' }}>{teamsCount}</td>
      <td style={{ padding: '14px 16px' }}>
        <button
          onClick={() => onView && onView(tournament)}
          style={{
            background: '#2563eb', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '7px 16px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          View Details
        </button>
      </td>
    </tr>
  );
};

export default TournamentRow;