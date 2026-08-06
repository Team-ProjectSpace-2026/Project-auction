import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import AnimatedOtpInput from "../../components/common/AnimatedOtpInput";
import "./ForgotPasswordPage.css";
import batsmanLogo from "../../assets/cricauctionlogo1.png";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timer, setTimer] = useState(60);
  const canResend = timer === 0;

  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!email) {
      setError("Please enter your registered email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/forgot-password/request-otp", { email });
      setInfoMessage(res.data.message || "A 6-digit verification code has been sent to your email!");
      setStep(2);
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isSubmitting) return;
    setError("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/forgot-password/request-otp", { email });
      setInfoMessage(res.data.message || "A new verification code has been sent to your email.");
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setInfoMessage("");

    if (otp.length < 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/forgot-password/verify-otp", { email, otp });
      setResetToken(res.data.resetToken);
      setInfoMessage("Verification code accepted! Create your new password below.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/forgot-password/reset-password", {
        resetToken,
        newPassword,
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Reset Password";
      case 2: return "Verify Email";
      case 3: return "New Password";
      case 4: return "Success!";
      default: return "Reset Password";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return "Enter your registered email to receive a verification code";
      case 2: return `Enter the 6-digit code sent to ${email}`;
      case 3: return "Create a new strong password for your account";
      case 4: return "Your password has been successfully updated";
      default: return "";
    }
  };

  return (
    <div className="forgot-page">
      {/* LEFT PANEL */}
      <div className="forgot-left">
        <div className="forgot-left-content">
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
            Forgot Your<br />
            <span className="accent-gold">Password?</span>
          </h2>
          <p className="subtext">
            No worries! Enter your email address and we'll send you a verification
            code to reset your password securely.
          </p>

          <ul className="feature-list">
            <li>
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <div>
                <strong>Secure Reset Process</strong>
                <p>OTP verification ensures only you can reset your password.</p>
              </div>
            </li>
            <li>
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <strong>Data Protection</strong>
                <p>Your account security is our top priority.</p>
              </div>
            </li>
            <li>
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <strong>Quick Recovery</strong>
                <p>Reset your password in just a few simple steps.</p>
              </div>
            </li>
            <li>
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <div>
                <strong>Zero Cost</strong>
                <p>Email verification is completely free, always.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="forgot-right">
        <div className="forgot-card">
          <div className="card-icon">
            <img src={batsmanLogo} alt="CricAuction Logo" />
          </div>

          <h2 className="welcome-title">{getStepTitle()}</h2>
          <p className="welcome-subtitle">{getStepSubtitle()}</p>

          {error && <div className="error-box">{error}</div>}
          {infoMessage && <div className="info-box">{infoMessage}</div>}

          {/* STEP 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp}>
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

              <Button
                type="submit"
                className="forgot-btn"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? "Sending Code..." : "Send Verification Code"}
              </Button>

              <div className="back-link-wrapper">
                <Link to="/login" className="back-to-login">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <AnimatedOtpInput
                length={6}
                onOtpChange={(val) => setOtp(val)}
                onComplete={() => {}}
                isError={!!error}
              />

              <div className="resend-timer-row">
                {timer > 0 ? (
                  <span className="timer-text">
                    Resend code in <strong>00:{timer < 10 ? `0${timer}` : timer}</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResendOtp}
                    disabled={isSubmitting}
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>

              <Button
                type="submit"
                className="forgot-btn"
                disabled={isSubmitting || otp.length < 6}
              >
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="back-link-wrapper">
                <button
                  type="button"
                  className="change-email-btn"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                    setInfoMessage("");
                  }}
                >
                  Change Email Address
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <label className="field-label" htmlFor="newPassword">
                New Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <InputField
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
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
                Confirm New Password
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
                  placeholder="Re-enter new password"
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

              <Button
                type="submit"
                className="forgot-btn"
                disabled={isSubmitting || !newPassword || !confirmPassword}
              >
                {isSubmitting ? "Updating Password..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="success-container">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                  <circle cx="12" cy="12" r="12" fill="#22c55e" fillOpacity="0.15" />
                  <path
                    d="M7 13l3.5 3.5L17 8"
                    stroke="#16a34a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3 className="success-title">Password Reset Complete!</h3>
              <p className="success-desc">
                Your password has been reset successfully. You can now login to your account with your new credentials.
              </p>

              <Button
                type="button"
                className="forgot-btn"
                onClick={() => navigate("/login")}
              >
                Proceed to Login
              </Button>
            </div>
          )}
        </div>
        <p className="forgot-copyright">
          © 2026 CricAuction. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
