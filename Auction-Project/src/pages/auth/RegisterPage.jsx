import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import SimpleCaptcha from "../../components/common/SimpleCaptcha";
import "./RegisterPage.css";
import batsmanLogo from "../../assets/cricauctionlogo1.png";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const captchaRef = useRef(null);

  const handleCaptchaVerify = (answer, captchaId) => {
    setCaptchaData({ answer, captchaId });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!captchaData) {
      setError("Please complete the security verification");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: fullName,
        email,
        mobile,
        password,
        captchaId: captchaData.captchaId,
        captchaAnswer: captchaData.answer,
      });
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.errors?.map((e) => e.msg).join(". ") ||
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(message);
      if (captchaRef.current?.resetCaptcha) {
        captchaRef.current.resetCaptcha();
      }
      setCaptchaData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      {/* LEFT PANEL */}
      <div className="register-left">
        <div className="register-left-content">
          <div className="brand">
            <img
              src={batsmanLogo}
              alt="CricAuction Logo"
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
            Create Your<br />
            <span className="accent-gold">Organizer Account</span>
          </h2>
          <p className="subtext">
            Join CricAuction and manage your cricket tournaments, players, and live auctions
            all in one powerful platform.
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
                <strong>Easy Tournament Setup</strong>
                <p>Create and configure tournaments in just a few steps.</p>
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
                <strong>Manage Players & Teams</strong>
                <p>Approve players, manage teams and build the perfect squads.</p>
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
                <strong>Live Auction Experience</strong>
                <p>Conduct real-time auctions with dynamic bidding.</p>
              </div>
            </li>
            <li>
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                </svg>
              </div>
              <div>
                <strong>Reports & Analytics</strong>
                <p>Get detailed insights and downloadable reports instantly.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="register-right">
        <div className="register-card">
          <div className="card-icon">
            <img src={batsmanLogo} alt="CricAuction Logo" />
          </div>

          <h2 className="welcome-title">Create Organizer Account</h2>
          <p className="welcome-subtitle">Fill in the details below to get started</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="fullName">
              Full Name
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
                </svg>
              </span>
              <InputField
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

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

            <label className="field-label" htmlFor="mobile">
              Mobile Number
            </label>
            <div className="phone-wrapper">
              <span className="country-code">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                +91
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
              <InputField
                id="mobile"
                type="tel"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="phone-input"
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
                placeholder="Enter password"
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

            <label className="field-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
              <InputField
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
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

            <SimpleCaptcha
              ref={captchaRef}
              onVerify={handleCaptchaVerify}
            />

            <Button
              type="submit"
              className="register-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="login-text">
            Already have an account?{" "}
            <Link to="/login" className="accent-link">
              Login Here
            </Link>
          </p>
        </div>
        <p className="register-copyright">
          © 2026 CricAuction. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
