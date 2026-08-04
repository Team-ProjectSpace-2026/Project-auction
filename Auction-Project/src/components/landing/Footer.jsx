import { motion } from 'framer-motion';
import { FiInstagram, FiMail } from 'react-icons/fi';
import batsmanLogo from '../../assets/cricauctionlogo1.png';
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
              <img src={batsmanLogo} alt="CricAuctionHub Logo" className="footer-logo-img" />
            </div>
            <p className="brand-description">
              The ultimate platform for organizing and participating in cricket auctions.
            </p>
            <div className="social-links">
              <motion.a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-pill" 
                aria-label="Instagram" 
                whileHover={{ scale: 1.08 }}
              >
                <FiInstagram size={18} />
                <span>Instagram</span>
              </motion.a>
              <motion.a 
                href="mailto:heyprojectspace@gmail.com" 
                className="social-pill" 
                aria-label="Email" 
                whileHover={{ scale: 1.08 }}
              >
                <FiMail size={18} />
                <span>Email</span>
              </motion.a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col links-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
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
              <span className="contact-label">Email:</span>{" "}
              <a href="mailto:heyprojectspace@gmail.com" className="contact-email-link">
                heyprojectspace@gmail.com
              </a>
            </p>
            <p className="contact-info">
              <span className="contact-label">Location:</span> India
            </p>
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