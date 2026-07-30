import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import SimpleCaptcha from "../../components/common/SimpleCaptcha";
import CricketParticles from "../../components/common/SpringPetals";
import CricketStumpsAnimation from "../../components/common/CyclingBoyAnimation";
import "./LoginPage.css";
import batsmanLogo from "../../assets/cricauctionlogo1.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const captchaRef = useRef(null);

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
      // Reset captcha on error
      if (captchaRef.current?.resetCaptcha) {
        captchaRef.current.resetCaptcha();
      }
      setCaptchaData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page spring-theme-bg">
      <CricketParticles count={30} />
      <CricketStumpsAnimation />
      <div className="spring-sunburst" />

      {/* TOP LEFT BRANDING LOGO */}
      <Link to="/" className="top-left-brand">
        <img
          src={batsmanLogo}
          alt="CricAuctionHub Logo"
          className="top-left-logo"
        />
        <div className="top-left-info">
          <h1 className="top-left-title">
            Cric<span className="accent-gold">Auction</span><span className="accent-white">Hub</span>
          </h1>
          <p className="top-left-tagline">CRICKET LEAGUE AUCTION MANAGEMENT</p>
        </div>
      </Link>

      <div className="login-card glass-card">
        <h2 className="welcome-title">Welcome Back!</h2>
        <p className="welcome-subtitle">Login to your organizer account</p>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                marginBottom: "16px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6l9 6 9-6" stroke="#9CA3AF" strokeWidth="1.5" />
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
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

            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="9"
                    rx="2"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 11V7a4 4 0 018 0v4"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
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
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.1A10.6 10.6 0 0112 5c5 0 9 4 10 7-0.4 1.1-1.1 2.3-2.1 3.4M6.4 6.4C4.3 7.8 2.8 9.7 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                    />
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
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <SimpleCaptcha
              ref={captchaRef}
              onVerify={handleCaptchaVerify}
            />

            <Button
              type="submit"
              className="login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <p className="register-text">
            Don't have an account?{" "}
            <Link to="/register" className="accent-link">
              Register Here
            </Link>
          </p>
        </div>
    </div>
  );
};

export default LoginPage;
