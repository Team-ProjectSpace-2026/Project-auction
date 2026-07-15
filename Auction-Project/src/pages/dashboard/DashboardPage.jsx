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
import cricketIllustration from '../../assets/cricket-illustration.png';
import bgStadium from '../../assets/bgstadium2.png';

const metricCards = [
  { key: 'total',     label: 'Total Tournaments',     icon: Trophy,      iconBg: '#ede9fe', subtitle: 'All time tournaments' },
  { key: 'active',    label: 'Active Tournaments',    icon: Play,        iconBg: '#dcfce7', subtitle: 'Currently running' },
  { key: 'upcoming',  label: 'Upcoming Tournaments',  icon: Calendar,    iconBg: '#e8f0fe', subtitle: 'Scheduled ahead' },
  { key: 'completed', label: 'Completed Tournaments', icon: CheckCircle, iconBg: '#fff7ed', subtitle: 'Successfully finished' },
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main area */}
      <div style={{
        marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh',
        overflow: 'auto', position: 'relative',
      }}>
        {/* Fixed background image */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: '220px',
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bgStadium})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }} />

        {/* Top bar */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <TopBar user={user} />
        </div>

        {/* Scrollable content */}
        <main style={{ flex: 1, padding: '68px 32px 0', display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative', zIndex: 1, overflow: 'visible', justifyContent: 'flex-start' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary-light)', margin: 0 }}>
                    Welcome back, {user?.name || 'User'}! 👋
                  </h1>
                  <p style={{ color: 'var(--text-secondary-light)', fontSize: '14px', margin: '4px 0 0', transition: 'color 0.2s ease' }}>
                    Let's create and manage amazing cricket tournaments.
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <img 
                    src={cricketIllustration} 
                    alt="Cricket illustration" 
                    style={{ width: '150px', height: 'auto'}}
                  />
                </div>
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
                    subtitle={card.subtitle}
                  />
                ))}
              </div>

              {/* Tournaments section */}
              {tournaments.length > 0 ? (
                <div style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px', overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
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
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ textAlign: 'center', padding: '24px 20px' }}>
                    {/* Trophy + clipboard illustration */}
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                      <ClipboardList size={60} strokeWidth={1} style={{ opacity: 0.18, color: 'var(--text-primary-light)' }} />
                      <div style={{
                        position: 'absolute', bottom: '2px', right: '-8px',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#2563eb', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '16px', color: '#fff',
                        fontWeight: 900, boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
                      }}>+</div>
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary-light)', margin: '0 0 6px', transition: 'color 0.2s ease' }}>
                      No Tournaments Yet!
                    </h2>
                    <p style={{ color: 'var(--text-secondary-light)', fontSize: '13px', margin: '0 0 18px', lineHeight: 1.6, transition: 'color 0.2s ease' }}>
                      You haven't created any tournaments yet.<br />
                      Create your first tournament to get started.
                    </p>
                    <button
                      onClick={() => navigate('/create-tournament')}
                      style={{
                        background: '#2563eb', color: '#fff', border: 'none',
                        borderRadius: '10px', padding: '11px 24px',
                        fontSize: '14px', fontWeight: 700, cursor: 'pointer',
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
        <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <ProgressFooter />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;