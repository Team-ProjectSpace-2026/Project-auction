import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiCompass, FiGlobe, FiPlayCircle, FiServer, FiSliders, FiBell, FiDollarSign, FiMonitor } from 'react-icons/fi';
import Button from '../../components/common/Button';
import './FeaturesSection.css';

const features = [
  { id: 1, title: 'Live Auction Engine', description: 'Experience real-time bidding with lightning-fast WebSocket integration for a dynamic and engaging auction.', icon: FiPlayCircle, color: 'var(--accent-light)' },
  { id: 2, title: 'Smart Player Pool', description: 'Manage categorized players (Batsman, Bowler, All-rounder, WK) for efficient tournament setup.', icon: FiUsers, color: 'var(--accent-gold)' },
  { id: 3, title: 'Team Budget Management', description: 'Track salary caps and purse values precisely for fair and strategic team building.', icon: FiDollarSign, color: 'var(--accent-blue)' }, // Assuming FiDollarSign is available or can be added
  { id: 4, title: 'Tournament Builder', description: 'Easily create custom tournament formats, rules, and schedules in minutes.', icon: FiAward, color: 'var(--accent-green)' },
  { id: 5, title: 'Analytics Dashboard', description: 'Gain insights into bid history, player values, and market trends with comprehensive data visualization.', icon: FiServer, color: 'var(--accent-purple)' },
  { id: 6, title: 'Role-Based Access', description: 'Securely manage permissions with different access levels for organizers, owners, coaches, and viewers.', icon: FiSliders, color: 'var(--accent-red)' },
  { id: 7, title: 'Instant Notifications', description: 'Keep everyone informed with real-time updates on bids, player reveals, and auction progress.', icon: FiBell, color: 'var(--accent-cyan)' },
  { id: 8, title: 'LED Display Integration', description: 'Seamlessly integrate with LED displays for live auction data, enhancing the viewing experience.', icon: FiMonitor, color: 'var(--accent-orange)' }, // Assuming FiMonitor is available
];

const FeaturesSection = () => {
  return (
    <section id="features" className="features-section" aria-labelledby="features-title">
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="section-badge">🚀 Key Features</span>
          <h2 id="features-title" className="section-title">All-In-One Cricket Auction Suite</h2>
          <p className="section-subtitle">
            Packed with powerful tools to manage every aspect of your cricket tournament and player auctions.
          </p>
        </motion.div>

        <motion.div
          className="features-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
          }}
        >
          {features.map((feature) => (
            <motion.div key={feature.id} className="feature-card" variants={featureCardVariants}>
              <div className="feature-icon" style={{ background: feature.color }}>
                <feature.icon size={32} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <Button variant="link" className="feature-learn-more">
                Learn More →
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const featureCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default FeaturesSection;