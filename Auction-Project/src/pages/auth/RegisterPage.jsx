import { useState } from "react";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration form submitted.");
    // Backend call will go here later
  };

  return (
    <div className="register-page">
      {/* LEFT SIDE - branding panel */}
      <div className="register-left">
        <div className="register-left-content">
          <div className="brand">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 21l8-8M16 3l5 5-5 5-5-5 5-5z"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="20" r="2" fill="#FBBF24" />
            </svg>
            <div>
              <h1>
                Cric<span className="accent">Auction</span>
              </h1>
              <p className="brand-tagline">CRICKET LEAGUE AUCTION MANAGEMENT</p>
            </div>
          </div>

          <h2 className="headline">
            Create Your <br />
            <span className="accent">Organizer Account</span>
          </h2>

          <p className="subtext">
            Join CricAuction and manage your cricket tournaments, players,
            and live auctions all in one powerful platform.
          </p>

          <ul className="feature-list">
            <li>
              <span className="feature-icon">🏆</span>
              <div>
                <strong>Easy Tournament Setup</strong>
                <p>Create and configure tournaments in just a few steps.</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">👥</span>
              <div>
                <strong>Manage Players &amp; Teams</strong>
                <p>Approve players, manage teams and build the perfect squads.</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🔨</span>
              <div>
                <strong>Live Auction Experience</strong>
                <p>Conduct real-time auctions with dynamic bidding.</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">📊</span>
              <div>
                <strong>Reports &amp; Analytics</strong>
                <p>Get detailed insights and downloadable reports instantly.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE - register form */}
      <div className="register-right">
        <div className="register-card">
          <div className="register-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                fill="#1E3A8A"
                stroke="#FBBF24"
                strokeWidth="1"
              />
              <path
                d="M8 9h8M9 9v2a3 3 0 006 0V9M11 14h2v2h-2z"
                stroke="#FBBF24"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="welcome-title">Create Organizer Account</h2>
          <p className="welcome-subtitle">Fill in the details below to get started</p>

          <form onSubmit={handleSubmit}>
            <label className="field-label">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#9CA3AF" strokeWidth="1.5" />
                  <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
              </span>
              <InputField
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <label className="field-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6l9 6 9-6" stroke="#9CA3AF" strokeWidth="1.5" />
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
              </span>
              <InputField
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <label className="field-label">Mobile Number</label>
            <div className="phone-wrapper">
              <span className="country-code">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 3h3l1.5 5L8 9.5a12 12 0 006.5 6.5L16 14l5 1.5v3a2 2 0 01-2 2C10.5 20.5 3.5 13.5 4 5a2 2 0 012-2z"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
                </svg>
                +91
              </span>
              <InputField
                type="tel"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="form-input phone-input"
                required
              />
            </div>

            <label className="field-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="#9CA3AF" strokeWidth="1.5" />
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
              </span>
              <InputField
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              <span className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.1A10.6 10.6 0 0112 5c5 0 9 4 10 7-0.4 1.1-1.1 2.3-2.1 3.4M6.4 6.4C4.3 7.8 2.8 9.7 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="#9CA3AF" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="3" stroke="#9CA3AF" strokeWidth="1.5" />
                  </svg>
                )}
              </span>
            </div>

            <label className="field-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="#9CA3AF" strokeWidth="1.5" />
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
              </span>
              <InputField
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
              <span
                className="input-icon-right"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.1A10.6 10.6 0 0112 5c5 0 9 4 10 7-0.4 1.1-1.1 2.3-2.1 3.4M6.4 6.4C4.3 7.8 2.8 9.7 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="#9CA3AF" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="3" stroke="#9CA3AF" strokeWidth="1.5" />
                  </svg>
                )}
              </span>
            </div>

            <Button type="submit" className="register-btn">
              Create Account
            </Button>
          </form>

          <p className="login-text">
            Already have an account? <a href="/login" className="accent-link">Login Here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;