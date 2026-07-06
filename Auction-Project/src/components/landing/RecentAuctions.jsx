import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiChevronLeft, FiChevronRight, FiExternalLink, FiCalendar } from 'react-icons/fi';
import Button from '../../components/common/Button';
import './RecentAuctions.css';

const mockAuctions = [
  {
    id: 1,
    name: 'Summer Premier League 2026',
    logo: '🏆',
    status: 'completed',
    statusLabel: 'Completed',
    date: 'Jul 15, 2026',
    teams: 8,
    players: 120,
    totalSpent: '₹45.2 Cr',
    topBid: '₹12.5 Cr',
    image: '/images/auction-1.jpg',
  },
  {
    id: 2,
    name: 'Winter T20 Championship',
    logo: '❄️',
    status: 'live',
    statusLabel: 'Live Now',
    date: 'Dec 20, 2026',
    teams: 10,
    players: 150,
    totalSpent: '₹67.8 Cr',
    topBid: '₹15.3 Cr',
    image: '/images/auction-2.jpg',
  },
  {
    id: 3,
    name: 'Spring Cricket Festival',
    logo: '🌸',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    date: 'Mar 10, 2027',
    teams: 6,
    players: 90,
    totalSpent: '₹28.5 Cr',
    topBid: '₹9.8 Cr',
    image: '/images/auction-3.jpg',
  },
  {
    id: 4,
    name: 'Monsoon Masters League',
    logo: '🌧️',
    status: 'completed',
    statusLabel: 'Completed',
    date: 'Aug 25, 2026',
    teams: 8,
    players: 110,
    totalSpent: '₹38.9 Cr',
    topBid: '₹11.2 Cr',
    image: '/images/auction-4.jpg',
  },
  {
    id: 5,
    name: 'Autumn Cup 2026',
    logo: '🍂',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    date: 'Oct 5, 2026',
    teams: 8,
    players: 100,
    totalSpent: '₹32.1 Cr',
    topBid: '₹10.5 Cr',
    image: '/images/auction-5.jpg',
  },
];

const statusStyles = {
  live: { bg: 'var(--status-live-bg)', text: 'var(--status-live-text)', pulse: true },
  upcoming: { bg: 'var(--status-upcoming-bg)', text: 'var(--status-upcoming-text)', pulse: false },
  completed: { bg: 'var(--status-completed-bg)', text: 'var(--status-completed-text)', pulse: false },
};

const RecentAuctions = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;
  const maxIndex = Math.max(0, mockAuctions.length - cardsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const visibleAuctions = mockAuctions.slice(currentIndex, currentIndex + cardsPerView);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section id="recent-auctions" className="recent-auctions" aria-labelledby="recent-auctions-title">
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
            Explore the latest cricket league auctions and their results
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="carousel-wrapper">
          <motion.button
            className="carousel-btn prev"
            onClick={prevSlide}
            aria-label="Previous auctions"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={mockAuctions.length <= cardsPerView}
          >
            <FiChevronLeft size={24} />
          </motion.button>

          <div className="carousel-track" role="list" aria-label="Recent auctions carousel">
            <AnimatePresence>
              {visibleAuctions.map((auction, index) => (
                <motion.div
                  key={auction.id}
                  className="auction-card-wrapper"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                  role="listitem"
                >
                  <AuctionCard auction={auction} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.button
            className="carousel-btn next"
            onClick={nextSlide}
            aria-label="Next auctions"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={mockAuctions.length <= cardsPerView}
          >
            <FiChevronRight size={24} />
          </motion.button>
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

  return (
    <article className="auction-card">
      <div className="card-image">
        <div className="card-logo" aria-hidden="true">{auction.logo}</div>
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
            <span>{auction.date}</span>
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