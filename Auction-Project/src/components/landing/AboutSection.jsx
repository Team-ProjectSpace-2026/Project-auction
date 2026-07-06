import { motion } from 'framer-motion';
import './AboutSection.css';

const statCounterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const AboutSection = () => {
  return (
    <section id="about" className="about-section" aria-labelledby="about-title">
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 id="about-title" className="section-title">Your Trusted Cricket Auction Platform</h2>
          <p className="section-subtitle">
            Dedicated to making cricket auctions simple, transparent, and engaging for everyone.
          </p>
        </motion.div>

        <div className="about-content">
          <motion.div
            className="content-text"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
            }}
          >
            <motion.p variants={statCounterVariants}>
              CricAuction is India's premier online platform designed to revolutionize how cricket tournaments and player auctions are managed. Our mission is to bring cricket lovers, gamers, and organizers together on one seamless and powerful platform.
            </motion.p>

            <motion.p variants={statCounterVariants}>
              We specialize in online player auction software for cricket, football, basketball, and other leagues. With our platform, team owners can participate in live auctions, place real-time bids, and build their dream teams with ultimate ease.
            </motion.p>
            <motion.p variants={statCounterVariants}>
              Our commitment extends beyond just technology; we aim to foster a vibrant community where passion for the sport meets cutting-edge innovation.
            </motion.p>
          </motion.div>

          <motion.div
            className="content-stats"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.5,
                },
              },
            }}
          >
            <div className="stat-item">
              <motion.h3 variants={statCounterVariants}>1000+</motion.h3>
              <motion.p variants={statCounterVariants}>Tournaments Hosted</motion.p>
            </div>
            <div className="stat-item">
              <motion.h3 variants={statCounterVariants}>50K+</motion.h3>
              <motion.p variants={statCounterVariants}>Players Auctioned</motion.p>
            </div>
            <div className="stat-item">
              <motion.h3 variants={statCounterVariants}>1500+</motion.h3>
              <motion.p variants={statCounterVariants}>Teams Created</motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;