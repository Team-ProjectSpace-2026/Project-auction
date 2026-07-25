import { motion } from 'framer-motion';
import {
  FiTwitter, FiLinkedin, FiInstagram, FiYoutube, FiFacebook,
  FiActivity, FiZap, FiShield
} from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section" aria-labelledby="footer-title">

      {/* ── Animated Gold Crease Line ── */}
      <div className="footer-crease-line" aria-hidden="true" />

      {/* ── Giant Watermark ── */}
      <div className="footer-watermark" aria-hidden="true">CRICAUCTIONHUB</div>

      <div className="footer-container">
        <div className="footer-content">
          {/* Column 1: Brand & Social Links */}
          <div className="footer-col brand-col">
            <div className="brand-logo">
              <img src="/images/cricauction-logo-footer.png" alt="CricAuctionHub Footer Logo" />
            </div>
            <p className="brand-description">
              The ultimate platform for organizing and participating in cricket auctions.
            </p>
            <div className="social-links">
              <motion.a href="#" className="social-pill" aria-label="Twitter" whileHover={{ scale: 1.08 }}>
                <FiTwitter size={18} />
                <span>Twitter</span>
              </motion.a>
              <motion.a href="#" className="social-pill" aria-label="LinkedIn" whileHover={{ scale: 1.08 }}>
                <FiLinkedin size={18} />
                <span>LinkedIn</span>
              </motion.a>
              <motion.a href="#" className="social-pill" aria-label="Instagram" whileHover={{ scale: 1.08 }}>
                <FiInstagram size={18} />
                <span>Insta</span>
              </motion.a>
              <motion.a href="#" className="social-pill" aria-label="YouTube" whileHover={{ scale: 1.08 }}>
                <FiYoutube size={18} />
                <span>YouTube</span>
              </motion.a>
              <motion.a href="#" className="social-pill" aria-label="Facebook" whileHover={{ scale: 1.08 }}>
                <FiFacebook size={18} />
                <span>Facebook</span>
              </motion.a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col links-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Partners</a></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="footer-col legal-col">
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cancellation & Refund</a></li>
              <li><a href="#">Shipping Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="footer-col contact-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <p className="contact-info">
              <span className="contact-label">Email:</span> info@cricauctionhub.com
            </p>
            <p className="contact-info">
              <span className="contact-label">Phone:</span> +91 9891586666
            </p>
            <p className="contact-info">
              <span className="contact-label">Location:</span> India
            </p>
          </div>
        </div>

        {/* ── System Status Bar ── */}
        <div className="system-status-bar">
          <div className="status-pill status-pill--green">
            <FiActivity size={14} />
            <span>Auction Engine: Operational</span>
          </div>
          <div className="status-pill status-pill--blue">
            <FiZap size={14} />
            <span>WebSockets: Active</span>
          </div>
          <div className="status-pill status-pill--purple">
            <FiShield size={14} />
            <span>Bank-Grade Security</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CricAuctionHub. All rights reserved.</p>
          <p>Crafted with passion for cricket lovers. 🏏</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;