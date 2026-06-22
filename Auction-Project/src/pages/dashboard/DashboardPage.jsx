// src/pages/dashboard/DashboardPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import ProgressFooter from '../../components/layout/ProgressFooter';
import MetricCard from '../../components/dashboard/MetricCard';
import TournamentRow from '../../components/dashboard/TournamentRow';

// ─── Mock data (replace with API calls once backend is ready) ───────────────
const MOCK_USER = {
  name: 'Rahul Organizer',
  role: 'Organizer',
};

const MOCK_METRICS = {
  total: 0,
  active: 0,
  upcoming: 0,
  completed: 0,
};

// Flip to `true` and fill MOCK_TOURNAMENTS to test the table view
const HAS_TOURNAMENTS = false;

const MOCK_TOURNAMENTS = [
  {
    id: '1',
    name: 'Summer League 2027',
    logo: '🏆',
    status: 'Active',
    auctionDate: 'Jul 15, 2027',
    teamsCount: 8,
  },
  {
    id: '2',
    name: 'Winter Cup 2026',
    logo: '🥇',
    status: 'Completed',
    auctionDate: 'Dec 20, 2026',
    teamsCount: 6,
  },
  {
    id: '3',
    name: 'Premier T20 2027',
    logo: '⭐',
    status: 'Upcoming',
    auctionDate: 'Sep 5, 2027',
    teamsCount: 10,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const metricCards = [
  { key: 'total',     label: 'Total Tournaments',     icon: '🏆', iconBg: '#ede9fe' },
  { key: 'active',    label: 'Active Tournaments',    icon: '▶️',  iconBg: '#dcfce7' },
  { key: 'upcoming',  label: 'Upcoming Tournaments',  icon: '📅', iconBg: '#e8f0fe' },
  { key: 'completed', label: 'Completed Tournaments', icon: '✅', iconBg: '#fff7ed' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main area */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <TopBar user={MOCK_USER} />

        {/* Scrollable content */}
        <main style={{ flex: 1, padding: '96px 32px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Welcome */}
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1d2e', margin: 0 }}>
              Welcome, {MOCK_USER.name} 👋
            </h1>
            <p style={{ color: '#8a94a6', fontSize: '14px', margin: '4px 0 0' }}>
              Let's create and manage amazing cricket tournaments.
            </p>
          </div>

          {/* Metric ribbon */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {metricCards.map(card => (
              <MetricCard
                key={card.key}
                icon={card.icon}
                iconBg={card.iconBg}
                label={card.label}
                value={MOCK_METRICS[card.key]}
              />
            ))}
          </div>

          {/* Tournaments section */}
          {HAS_TOURNAMENTS ? (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid #e8eaf0', overflow: 'hidden',
            }}>
              {/* Table header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '18px 20px',
                borderBottom: '1px solid #f0f1f5',
              }}>
                <span style={{ fontWeight: 700, color: '#1a1d2e', fontSize: '15px' }}>
                  Recent Tournaments
                </span>
                <button style={{
                  background: 'none', border: 'none', color: '#2563eb',
                  fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                }}>
                  View All →
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fb' }}>
                    {['Tournament Name', 'Status', 'Auction Date', 'Teams', 'Action'].map((col, i) => (
                      <th key={col} style={{
                        padding: '12px 16px', textAlign: i === 3 ? 'center' : 'left',
                        fontSize: '12px', fontWeight: 700, color: '#8a94a6',
                        letterSpacing: '0.5px', textTransform: 'uppercase',
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TOURNAMENTS.map(t => (
                    <TournamentRow
                      key={t.id}
                      tournament={t}
                      onView={tournament => navigate(`/tournament/${tournament.id}`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty state */
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid #e8eaf0', flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: '320px',
            }}>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                {/* Trophy + clipboard illustration */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                  <div style={{ fontSize: '80px', opacity: 0.18, lineHeight: 1 }}>📋</div>
                  <div style={{
                    position: 'absolute', bottom: '2px', right: '-8px',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#2563eb', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '16px', color: '#fff',
                    fontWeight: 900, boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
                  }}>+</div>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1d2e', margin: '0 0 8px' }}>
                  No Tournaments Yet!
                </h2>
                <p style={{ color: '#8a94a6', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
                  You haven't created any tournaments yet.<br />
                  Create your first tournament to get started.
                </p>
                <button
                  onClick={() => navigate('/create-tournament')}
                  style={{
                    background: '#2563eb', color: '#fff', border: 'none',
                    borderRadius: '10px', padding: '13px 28px',
                    fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,99,235,0.45)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)';
                  }}
                >
                  + Create New Tournament
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Progress footer — fixed at bottom */}
        <div style={{ marginTop: '24px' }}>
          <ProgressFooter />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;