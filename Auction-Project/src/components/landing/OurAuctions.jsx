import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiCompass, FiGlobe } from 'react-icons/fi';
import './OurAuctions.css';

const auctionFeatures = [
  { id: 1, title: 'Tournament Auction', description: 'Host live, real-time player auctions for your cricket tournaments. Set team budgets, define player categories, and let teams bid competitively for a thrilling auction experience.', icon: FiAward, iconColor: 'var(--accent-light)', actionColor: 'var(--accent-light)' },
  { id: 2, title: 'IPL Auction Experience', description: 'Experience the excitement of a professional IPL-style auction with advanced bidding rounds, player tiers, and team strategies, making every pick feel like the real thing.', icon: FiUsers, iconColor: 'var(--accent-gold)', actionColor: 'var(--accent-gold)' },
  { id: 3, title: 'Auto Assign Players', description: "Skip the bidding and let our smart system distribute players fairly across all teams. Balanced, rule-based, and done in seconds.", icon: FiCompass, iconColor: 'var(--accent-blue)', actionColor: 'var(--accent-blue)' },
  { id: 4, title: 'Dream Team Builder', description: 'Hand-pick top performers and build your ultimate fantasy squad. Compete with others based on real-match stats and prove you have the best eye for talent.', icon: FiGlobe, iconColor: 'var(--accent-green)', actionColor: 'var(--accent-green)' },
];

const OurAuctions = () => {
  return (
    <section id="our-auctions" className="our-auctions" aria-labelledby="our-auctions-title">
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 id="our-auctions-title" className="section-title">Experience the Excitement</h2>
          <p className="section-subtitle">
            Discover the unique features that make our auction platform the best choice for your league.
          </p>
        </motion.div>

        <motion.div
          className="features-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainerVariants}
        >
          {auctionFeatures.map((feature) => (
            <motion.div
              key={feature.id}
              className="feature-card"
              variants={cardVariants}
            >
              <div className="feature-icon-container" style={{ background: feature.iconColor }}>
                <feature.icon size={32} color="#fff" />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Animation variants
const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default OurAuctions;