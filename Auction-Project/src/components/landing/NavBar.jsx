import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiClock, FiAward, FiInfo, FiStar, FiLogIn } from 'react-icons/fi';
import batsmanLogo from '../../assets/cricauctionlogo1.png';
import './NavBar.css';

const navItems = [
  { id: 'hero', label: 'Home', icon: FiHome },
  { id: 'recent-auctions', label: 'Recent Auctions', icon: FiClock },
  { id: 'our-auctions', label: 'Our Auctions', icon: FiAward },
  { id: 'about', label: 'About', icon: FiInfo },
  { id: 'features', label: 'Features', icon: FiStar },
];

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleNavClick = (e, id) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <motion.header
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="CricAuction Home">
          <img src={batsmanLogo} alt="CricAuction" className="logo-img" />
          <span className="logo-text">Cric<span className="logo-accent">Auction</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-nav" aria-label="Primary navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.id}>
                <motion.button
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, item.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={item.label}
                >
                  <item.icon className="nav-icon" size={18} />
                  <span>{item.label}</span>
                </motion.button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop CTA */}
        <div className="navbar-cta">
          <Link to="/login">
            <motion.button
              className="btn-login"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiLogIn className="btn-icon" size={16} />
              <span>Login</span>
            </motion.button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.nav
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <ul className="mobile-nav-list">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <motion.button
                      className="mobile-nav-link"
                      onClick={(e) => handleNavClick(e, item.id)}
                      whileHover={{ x: 8 }}
                      layout
                    >
                      <item.icon className="nav-icon" size={22} />
                      <span>{item.label}</span>
                    </motion.button>
                  </li>
                ))}
              </ul>
              
              <div className="mobile-cta">
                <Link to="/login">
                  <motion.button
                    className="btn-login"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiLogIn className="btn-icon" size={18} />
                    <span>Login to Dashboard</span>
                  </motion.button>
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default NavBar;