import { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import "./LoginPage.css";
import batsmanLogo from "../../assets/batsman.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Backend call will go here later
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE - branding panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="brand">
            <img src={batsmanLogo} alt="CricAuction logo" width="78" height="78" />
            <div>
              <h1>
                Cric<span className="accent">Auction</span>
              </h1>
              <p className="brand-tagline">CRICKET LEAGUE AUCTION MANAGEMENT</p>
            </div>
          </div>

          <h2 className="headline">
            Manage. Auction. <br />
            <span className="accent">Build Champions.</span>
          </h2>

          <p className="subtext">
            CricAuction is a complete platform to manage cricket tournaments,
            player registrations, live auctions and squad management with
            ease.
          </p>

          <ul className="feature-list">
            <li>
              <span className="feature-icon">🏆</span>
              <div>
                <strong>Create &amp; Manage Tournaments</strong>
                <p>Set up and manage your tournaments effortlessly.</p>
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
              <span className="feature-icon">👥</span>
              <div>
                <strong>Team &amp; Player Management</strong>
                <p>Manage teams, players and auction pools.</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">📊</span>
              <div>
                <strong>Reports &amp; Analytics</strong>
                <p>Get detailed insights and downloadable reports.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE - login form */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-icon">
  <img src={batsmanLogo} alt="CricAuction logo" width="78" height="78" />
</div>

          <h2 className="welcome-title">Welcome Back!</h2>
          <p className="welcome-subtitle">Login to your organizer account</p>

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6l9 6 9-6" stroke="#9CA3AF" strokeWidth="1.5" />
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
              </span>
              <InputField
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="#9CA3AF" strokeWidth="1.5" />
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
              </span>
              <InputField
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              <button
                type="button"
                className="input-icon-right"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
              >
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
              </button>
            </div>

            <div className="row-between">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>

            <Button type="submit" className="login-btn">
              Login
            </Button>
          </form>

          <div className="divider"><span>OR</span></div>

          <p className="register-text">
  Don't have an account?{" "}
  <Link to="/register" className="accent-link">
    Register Here
  </Link>
</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
