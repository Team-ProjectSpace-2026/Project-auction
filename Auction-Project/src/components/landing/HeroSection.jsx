import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlay, FiTrendingUp, FiChevronDown, FiArrowDown } from 'react-icons/fi';
import Button from '../../components/common/Button';
import './HeroSection.css';

const HeroSection = () => {
  // Floating particles data for background animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  // Gavel icons floating
  const gavels = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 30 + 20,
    delay: Math.random() * 3,
    duration: Math.random() * 15 + 10,
    rotation: Math.random() * 360,
  }));

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      {/* Video Background */}
      <div className="hero-video-wrapper">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
          <source src="/videos/hero-bg.webm" type="video/webm" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-gradient-overlay" />
      </div>

      {/* Floating decorative elements */}
      <div className="hero-particles" aria-hidden="true">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.4, 0.6, 0.4, 0],
              scale: [0, 1, 1.2, 1, 0],
              y: [0, -100, -200],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
        {gavels.map((g) => (
          <motion.div
            key={g.id}
            className="gavel-icon"
            style={{
              left: `${g.x}%`,
              top: `${g.y}%`,
              fontSize: `${g.size}px`,
            }}
            initial={{ opacity: 0, rotate: g.rotation }}
            animate={{
              opacity: [0, 0.15, 0.1, 0],
              y: [0, -150],
              rotate: [g.rotation, g.rotation + 180],
            }}
            transition={{
              duration: g.duration,
              delay: g.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            🔨
          </motion.div>
        ))}
      </div>

      {/* Mouse-follow glow effect */}
      <motion.div className="mouse-glow" aria-hidden="true" />

      {/* Main Content */}
      <div className="hero-content">
        <div className="hero-inner">
          {/* Badge */}
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <span className="badge-dot" aria-hidden="true" />
            <span>🏏 Cricket League Auction Platform</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            id="hero-title"
            className="hero-headline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            Where Champions
            <br />
            <span className="hero-accent">Are Born</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="hero-subheadline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          >
            Experience the thrill of live cricket auctions. Build your dream team,
            manage tournaments, and create legends with the most advanced auction platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
          >
            <Link to="/login">
              <Button
                className="hero-btn-primary"
                variant="primary"
                size="lg"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <FiPlay className="btn-icon" size={20} />
                Start Auction Now
              </Button>
            </Link>
            <Button
              className="hero-btn-secondary"
              variant="outline"
              size="lg"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiTrendingUp className="btn-icon" size={20} />
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="hero-trust"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: 'easeOut' }}
          >
            <div className="trust-item">
              <span className="trust-number">500+</span>
              <span className="trust-label">Tournaments Hosted</span>
            </div>
            <div className="trust-divider" aria-hidden="true" />
            <div className="trust-item">
              <span className="trust-number">50K+</span>
              <span className="trust-label">Players Auctioned</span>
            </div>
            <div className="trust-divider" aria-hidden="true" />
            <div className="trust-item">
              <span className="trust-number">1000+</span>
              <span className="trust-label">Teams Created</span>
            </div>
            <div className="trust-divider" aria-hidden="true" />
            <div className="trust-item">
              <span className="trust-number">99.9%</span>
              <span className="trust-label">Uptime Guarantee</span>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="scroll-indicator"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <FiChevronDown className="scroll-mouse" size={24} />
            <FiArrowDown className="scroll-arrow" size={16} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;