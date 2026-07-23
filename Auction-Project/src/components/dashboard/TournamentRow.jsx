// src/components/dashboard/TournamentRow.jsx
import { CircleDot } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const statusColors = {
  Active:    { bg: 'var(--status-active-bg)', color: 'var(--status-active-text)' },
  Upcoming:  { bg: 'var(--role-batsman-bg)', color: 'var(--accent-light)' },
  Completed: { bg: 'var(--bg-secondary-light)', color: 'var(--text-secondary-light)' },
  Draft:     { bg: 'var(--role-bowler-bg)', color: 'var(--role-bowler-text)' },
};

const TournamentRow = ({ tournament, onView }) => {
  const { name, logo, status, auctionDate, teamsCount } = tournament;
  const pill = statusColors[status] || statusColors.Draft;

  // Resolve logo URL (supports absolute Cloudinary URLs & local paths)
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return "";
    if (logoPath.startsWith("http")) return logoPath;
    const normalized = logoPath.replace(/\\/g, "/");
    const prefix = normalized.startsWith("/") ? "" : "/";
    return `${API_BASE}${prefix}${normalized}`;
  };

  return (
    <tr style={{ borderBottom: '1px solid var(--table-row-border)', transition: 'border-color 0.2s ease' }}>
      <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: 'var(--info-bg)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '20px', flexShrink: 0,
          overflow: 'hidden',
        }}>
          {logo ? (
            <img src={getLogoUrl(logo)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <CircleDot size={18} strokeWidth={2} style={{ color: 'var(--text-secondary-light)' }} />
          )}
        </div>
        <span style={{ fontWeight: 600, color: 'var(--text-primary-light)', fontSize: '14px', transition: 'color 0.2s ease' }}>{name}</span>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <span style={{
          background: pill.bg, color: pill.color,
          borderRadius: '20px', padding: '4px 12px',
          fontSize: '12px', fontWeight: 600,
          transition: 'background-color 0.2s ease, color 0.2s ease',
        }}>
          {status}
        </span>
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--text-secondary-light)', fontSize: '14px', transition: 'color 0.2s ease' }}>{auctionDate ? new Date(auctionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
      <td style={{ padding: '14px 16px', color: 'var(--text-secondary-light)', fontSize: '14px', textAlign: 'center', transition: 'color 0.2s ease' }}>{teamsCount}</td>
      <td style={{ padding: '14px 16px' }}>
        <button
          onClick={() => onView && onView(tournament)}
          style={{
            background: 'var(--accent-light)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '7px 16px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
        >
          View Details
        </button>
      </td>
    </tr>
  );
};

export default TournamentRow;