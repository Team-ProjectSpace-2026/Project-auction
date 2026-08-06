import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import SimpleCaptcha from "../../components/common/SimpleCaptcha";
import "./LoginPage.css";
import batsmanLogo from "../../assets/cricauctionlogo1.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRememberMe = () => {
    const next = !rememberMe;
    setRememberMe(next);
    if (next) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  };

  const handleCaptchaVerify = (answer, captchaId) => {
    setCaptchaData({ answer, captchaId });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaData) {
      setError("Please complete the security verification");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
        captchaId: captchaData.captchaId,
        captchaAnswer: captchaData.answer,
      });
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="brand">
            <img
              src={batsmanLogo}
              alt="CricAuctionHub Logo"
              className="brand-logo-lg"
            />
            <div>
              <h1 className="brand-title-lg">
                Cric<span className="accent-gold">Auction</span>
              </h1>
              <p className="brand-tagline">CRICKET LEAGUE AUCTION MANAGEMENT</p>
            </div>
          </div>

          <h2 className="headline">
            Manage. Auction.<br />
            <span className="accent-gold">Build Champions.</span>
          </h2>
          <p className="subtext">
            The complete platform for organizing and managing cricket league
            auctions with real-time bidding and team management.
          </p>

          <ul className="feature-list">
            <li>
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                  <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0012 0V2Z" />
                </svg>
              </div>
              <div>
                <strong>Live Auction</strong>
                <p>Real-time bidding with instant updates and dynamic price tracking</p>
              </div>
            </li>
            <li>
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
                  <path d="M13 6h3a2 2 0 012 2v7" /><path d="M11 18H8a2 2 0 01-2-2V9" />
                </svg>
              </div>
              <div>
                <strong>Smart Bidding</strong>
                <p>Automated bid management with intelligent price suggestions</p>
              </div>
            </li>
            <li>
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
                  <circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div>
                <strong>Team Management</strong>
                <p>Build and manage your squad with detailed player profiles</p>
              </div>
            </li>
            <li>
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                </svg>
              </div>
              <div>
                <strong>Live Analytics</strong>
                <p>Track spending, team value, and auction statistics in real-time</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">
          <div className="card-icon">
            <img src={batsmanLogo} alt="CricAuction Logo" />
          </div>

          <h2 className="welcome-title">Welcome Back!</h2>
          <p className="welcome-subtitle">Login to your organizer account</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 6L2 7" />
                </svg>
              </span>
              <InputField
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
              <InputField
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.5 5.1A10.6 10.6 0 0112 5c5 0 9 4 10 7-.4 1.1-1.1 2.3-2.1 3.4" />
                    <path d="M6.4 6.4C4.3 7.8 2.8 9.7 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="login-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMe}
                />
                Remember Me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <SimpleCaptcha onVerify={handleCaptchaVerify} />

            <Button
              type="submit"
              className="login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            <div className="divider">
              <span>OR</span>
            </div>

            <p className="login-text">
              Don't have an account?
              <Link to="/register" className="accent-link">
                Register Here
              </Link>
            </p>
          </form>
        </div>
        <p className="login-copyright">
          © 2026 CricAuction. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
