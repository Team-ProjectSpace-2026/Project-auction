import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiUsers, FiExternalLink, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { getPublicRecentTournaments } from '../../services/tournamentService';
import Button from '../common/Button';
import './RecentAuctions.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Fallback mock data (shown when API is unavailable) ── */
const mockAuctions = [
  {
    id: 1,
    name: 'Summer Premier League 2026',
    logo: '',
    status: 'completed',
    statusLabel: 'Completed',
    date: '2026-07-15',
    teams: 8,
    players: 120,
    totalSpent: '₹45.2 Cr',
    topBid: '₹12.5 Cr',
  },
  {
    id: 2,
    name: 'Winter T20 Championship',
    logo: '',
    status: 'active',
    statusLabel: 'Live Now',
    date: '2026-12-20',
    teams: 10,
    players: 150,
    totalSpent: '₹67.8 Cr',
    topBid: '₹15.3 Cr',
  },
  {
    id: 3,
    name: 'Spring Cricket Festival',
    logo: '',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    date: '2027-03-10',
    teams: 6,
    players: 90,
    totalSpent: '₹28.5 Cr',
    topBid: '₹9.8 Cr',
  },
  {
    id: 4,
    name: 'Monsoon Masters League',
    logo: '',
    status: 'completed',
    statusLabel: 'Completed',
    date: '2026-08-25',
    teams: 8,
    players: 110,
    totalSpent: '₹38.9 Cr',
    topBid: '₹11.2 Cr',
  },
  {
    id: 5,
    name: 'Autumn Cup 2026',
    logo: '',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    date: '2026-10-05',
    teams: 8,
    players: 100,
    totalSpent: '₹32.1 Cr',
    topBid: '₹10.5 Cr',
  },
];

const statusStyles = {
  live: { bg: 'var(--status-live-bg)', text: 'var(--status-live-text)', pulse: true },
  active: { bg: 'var(--status-live-bg)', text: 'var(--status-live-text)', pulse: true },
  upcoming: { bg: 'var(--status-upcoming-bg)', text: 'var(--status-upcoming-text)', pulse: false },
  completed: { bg: 'var(--status-completed-bg)', text: 'var(--status-completed-text)', pulse: false },
};

const statusEmojis = {
  active: '🔴',
  live: '🔴',
  completed: '🏆',
  upcoming: '⏳',
};

const formatDate = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const RecentAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromDB, setIsFromDB] = useState(false);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  /* ── Fetch real data ── */
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await getPublicRecentTournaments();
        const rawData = res?.data;
        const list = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData?.tournaments)
          ? rawData.tournaments
          : [];

        if (!cancelled && list.length > 0) {
          setAuctions(list);
          setIsFromDB(true);
        } else if (!cancelled) {
          setAuctions(mockAuctions);
        }
      } catch {
        if (!cancelled) {
          setAuctions(mockAuctions);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  /* ── GSAP horizontal scroll-pin (desktop only) ── */
  useEffect(() => {
    const safeAuctions = Array.isArray(auctions) ? auctions : [];
    if (isLoading || safeAuctions.length === 0) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Only enable horizontal pin on desktop (> 768px)
    const mm = gsap.matchMedia();

    mm.add('(min-width: 769px)', () => {
      // Wait one frame for layout to settle
      requestAnimationFrame(() => {
        const totalScrollWidth = track.scrollWidth - section.offsetWidth + 100;

        if (totalScrollWidth <= 0) return;

        const tween = gsap.to(track, {
          x: -totalScrollWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: 'top 80px',
            end: () => `+=${totalScrollWidth}`,
            invalidateOnRefresh: true,
          },
        });

        scrollTriggerRef.current = tween.scrollTrigger;
      });
    });

    return () => {
      mm.revert();
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [isLoading, auctions]);

  /* ── Skeleton loader ── */
  if (isLoading) {
    return (
      <section id="recent-auctions" className="recent-auctions" aria-label="Loading recent auctions">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Recent Auctions</h2>
            <p className="section-subtitle">Explore the latest cricket league auctions and their results</p>
          </div>
          <div className="skeleton-track">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-lines">
                  <div className="skeleton-line skeleton-line--title" />
                  <div className="skeleton-line skeleton-line--meta" />
                  <div className="skeleton-line skeleton-line--stats" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="recent-auctions"
      className="recent-auctions recent-auctions--horizontal"
      aria-labelledby="recent-auctions-title"
    >
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 id="recent-auctions-title" className="section-title">Recent Auctions</h2>
          <p className="section-subtitle">
            {isFromDB
              ? 'Live data from our platform — explore real cricket league auctions'
              : 'Explore the latest cricket league auctions and their results'}
          </p>
          {isFromDB && (
            <span className="live-data-badge">
              <span className="live-dot" />
              Live from Database
            </span>
          )}
        </motion.div>

        {/* Horizontal Scroll Track */}
        <div className="horizontal-scroll-wrapper">
          <div ref={trackRef} className="auction-cards-track" role="list" aria-label="Recent auctions">
            {(Array.isArray(auctions) ? auctions : mockAuctions).map((auction, index) => (
              <motion.div
                key={auction.id}
                className="auction-card-wrapper"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                role="listitem"
              >
                <AuctionCard auction={auction} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll Hint (desktop only) */}
        <div className="scroll-hint" aria-hidden="true">
          <FiTrendingUp size={16} />
          <span>Scroll to explore more auctions</span>
        </div>

        {/* View All Button */}
        <motion.div
          className="view-all"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          <Button
            variant="outline"
            className="view-all-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View All Auctions
            <FiExternalLink className="btn-icon" size={16} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const AuctionCard = ({ auction }) => {
  const status = statusStyles[auction.status] || statusStyles.upcoming;
  const emoji = statusEmojis[auction.status] || '🏏';

  return (
    <article className="auction-card">
      <div className="card-image">
        {auction.logo ? (
          <img src={auction.logo} alt={`${auction.name} logo`} className="card-logo-img" />
        ) : (
          <div className="card-logo" aria-hidden="true">{emoji}</div>
        )}
        <motion.div
          className={`status-badge ${auction.status}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
        >
          <span className="status-dot" style={{ background: status.text }} />
          {auction.statusLabel}
        </motion.div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{auction.name}</h3>

        <div className="card-meta">
          <div className="meta-item">
            <FiCalendar className="meta-icon" size={14} />
            <span>{formatDate(auction.date)}</span>
          </div>
          <div className="meta-item">
            <FiUsers className="meta-icon" size={14} />
            <span>{auction.teams} Teams</span>
          </div>
        </div>

        <div className="card-stats">
          <div className="stat">
            <span className="stat-value">{auction.totalSpent}</span>
            <span className="stat-label">Total Spent</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">{auction.topBid}</span>
            <span className="stat-label">Highest Bid</span>
          </div>
        </div>

        <Button
          variant="primary"
          className="card-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details
          <FiExternalLink className="btn-icon" size={14} />
        </Button>
      </div>
    </article>
  );
};

export default RecentAuctions;