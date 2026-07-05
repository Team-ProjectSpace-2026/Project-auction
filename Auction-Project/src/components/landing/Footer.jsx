import { motion } from 'framer-motion';
import { FiTwitter, FiLinkedin, FiInstagram, FiYoutube, FiFacebook } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section" aria-labelledby="footer-title">
      <div className="footer-container">
        <div className="footer-content">
          {/* Column 1: Brand & Social Links */}
          <div className="footer-col brand-col">
            <div className="brand-logo">
              <img src="/images/cricauction-logo-footer.png" alt="CricAuction Footer Logo" />
            </div>
            <p className="brand-description">
              The ultimate platform for organizing and participating in cricket auctions.
            </p>
            <div className="social-links">
              <motion.a href="#" aria-label="Twitter" whileHover={{ scale: 1.2 }}><FiTwitter size={20} /></motion.a>
              <motion.a href="#" aria-label="LinkedIn" whileHover={{ scale: 1.2 }}><FiLinkedin size={20} /></motion.a>
              <motion.a href="#" aria-label="Instagram" whileHover={{ scale: 1.2 }}><FiInstagram size={20} /></motion.a>
              <motion.a href="#" aria-label="YouTube" whileHover={{ scale: 1.2 }}><FiYoutube size={20} /></motion.a>
              <motion.a href="#" aria-label="Facebook" whileHover={{ scale: 1.2 }}><FiFacebook size={20} /></motion.a>
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
              <span className="contact-label">Email:</span> info@cricauction.com
            </p>
            <p className="contact-info">
              <span className="contact-label">Phone:</span> +91 9891586666
            </p>
            <p className="contact-info">
              <span className="contact-label">Location:</span> India
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CricAuction. All rights reserved.</p>
          <p>Crafted with passion for cricket lovers. 🏏</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;