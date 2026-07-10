// src/pages/dashboard/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboard } from '../../services/dashboardService';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import ProgressFooter from '../../components/layout/ProgressFooter';
import MetricCard from '../../components/dashboard/MetricCard';
import TournamentRow from '../../components/dashboard/TournamentRow';
import { Trophy, Play, Calendar, CheckCircle, ClipboardList } from 'lucide-react';

const metricCards = [
  { key: 'total',     label: 'Total Tournaments',     icon: Trophy,      iconBg: '#ede9fe' },
  { key: 'active',    label: 'Active Tournaments',    icon: Play,        iconBg: '#dcfce7' },
  { key: 'upcoming',  label: 'Upcoming Tournaments',  icon: Calendar,    iconBg: '#e8f0fe' },
  { key: 'completed', label: 'Completed Tournaments', icon: CheckCircle, iconBg: '#fff7ed' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [metrics, setMetrics] = useState({ total: 0, active: 0, upcoming: 0, completed: 0 });
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await getDashboard();
        setMetrics(data.metrics);
        setTournaments(data.tournaments);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary-light)', fontFamily: "'Inter', 'Segoe UI', sans-serif", transition: 'background-color 0.2s ease' }}>
      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main area */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <TopBar user={user} />

        {/* Scrollable content */}
        <main style={{ flex: 1, padding: '96px 32px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
              <div style={{
                width: '40px', height: '40px', border: '3px solid var(--border-light)',
                borderTopColor: '#2563eb', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* Welcome */}
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary-light)', margin: 0 }}>
                  Welcome, {user?.name || 'User'}
                </h1>
                <p style={{ color: 'var(--text-secondary-light)', fontSize: '14px', margin: '4px 0 0', transition: 'color 0.2s ease' }}>
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
                    value={metrics[card.key]}
                  />
                ))}
              </div>

              {/* Tournaments section */}
              {tournaments.length > 0 ? (
                <div style={{
                  background: 'var(--card-bg-light)', borderRadius: '16px',
                  border: '1px solid var(--border-light)', overflow: 'hidden',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}>
                  {/* Table header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '18px 20px',
                    borderBottom: '1px solid var(--border-light)',
                    transition: 'border-color 0.2s ease',
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary-light)', fontSize: '15px', transition: 'color 0.2s ease' }}>
                      Recent Tournaments
                    </span>
                    <button
                      onClick={() => navigate('/tournaments')}
                      style={{
                        background: 'none', border: 'none', color: 'var(--accent-light)',
                        fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                      }}
                    >
                      View All →
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--table-header-bg)', transition: 'background-color 0.2s ease' }}>
                        {['Tournament Name', 'Status', 'Auction Date', 'Teams', 'Action'].map((col, i) => (
                          <th key={col} style={{
                            padding: '12px 16px', textAlign: i === 3 ? 'center' : 'left',
                            fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary-light)',
                            letterSpacing: '0.5px', textTransform: 'uppercase',
                          }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tournaments.map(t => (
                        <TournamentRow
                          key={t.id}
                          tournament={t}
                          onView={tournament => navigate(`/tournament-details/${tournament.id}`, { state: { tournament } })}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Empty state */
                <div style={{
                  background: 'var(--card-bg-light)', borderRadius: '16px',
                  border: '1px solid var(--border-light)', flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minHeight: '320px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}>
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    {/* Trophy + clipboard illustration */}
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                      <ClipboardList size={80} strokeWidth={1} style={{ opacity: 0.18, color: 'var(--text-primary-light)' }} />
                      <div style={{
                        position: 'absolute', bottom: '2px', right: '-8px',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#2563eb', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '16px', color: '#fff',
                        fontWeight: 900, boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
                      }}>+</div>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary-light)', margin: '0 0 8px', transition: 'color 0.2s ease' }}>
                      No Tournaments Yet!
                    </h2>
                    <p style={{ color: 'var(--text-secondary-light)', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6, transition: 'color 0.2s ease' }}>
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
            </>
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