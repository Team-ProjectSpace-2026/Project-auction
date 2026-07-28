import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import RobotCaptcha from "../../components/common/RobotCaptcha";
import AnimatedOtpInput from "../../components/common/AnimatedOtpInput";
import CricketParticles from "../../components/common/SpringPetals";
import CricketStumpsAnimation from "../../components/common/CyclingBoyAnimation";
import "./ForgotPasswordPage.css";
import batsmanLogo from "../../assets/cricauctionlogo1.png";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email/Captcha, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState("");
  const [captchaData, setCaptchaData] = useState(null);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend OTP countdown
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

  const handleCaptchaVerify = (answer, captchaId) => {
    setCaptchaData({ answer, captchaId });
    setError("");
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!email) {
      setError("Please enter your registered email address");
      return;
    }

    if (!captchaData) {
      setError("Please complete the 'I am not a robot' security check");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post(
        "/auth/forgot-password/request-otp",
        {
          email,
          captchaId: captchaData.captchaId,
          captchaAnswer: captchaData.answer,
        },
        { timeout: 18000 }
      );

      setInfoMessage(res.data.message || "OTP code sent to your email address!");
      setStep(2);
      setTimer(60);
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Server request timed out. Please try again."
          : err.response?.data?.message || "Failed to send OTP code. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (!canResend || isSubmitting) return;
    setError("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      const res = await api.post(
        "/auth/forgot-password/request-otp",
        {
          email,
          captchaId: captchaData?.captchaId || `resend-${Date.now()}`,
          captchaAnswer: captchaData?.answer || "verified",
        },
        { timeout: 18000 }
      );

      setInfoMessage(res.data.message || "A new verification code has been sent to your email.");
      setTimer(60);
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Server request timed out. Please try again."
          : err.response?.data?.message || "Failed to resend OTP.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
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
      const res = await api.post("/auth/forgot-password/verify-otp", {
        email,
        otp,
      });

      setResetToken(res.data.resetToken);
      setInfoMessage("Code verified! Please enter your new password.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Reset Password
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

  return (
    <div className="forgot-password-page spring-theme-bg">
      {/* Cricket Auction Particles — balls, bid tags, confetti, sparkles */}
      <CricketParticles count={30} />

      {/* Cricket Stumps + Flying Ball + Auction Ticker */}
      <CricketStumpsAnimation />

      {/* Stadium Floodlight Glow overlay */}
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
            Cric<span className="accent-gold">Auction</span><span className="accent-cyan">Hub</span>
          </h1>
          <p className="top-left-tagline">CRICKET LEAGUE AUCTION MANAGEMENT</p>
        </div>
      </Link>

      <div className="forgot-card-container glass-card">
        <div className="forgot-card-header">
          <h2 className="step-title">Reset Password</h2>
          <p className="forgot-subtitle">
            {step === 1 && "Enter your email to receive a 6-digit verification code"}
            {step === 2 && `Enter the 6-digit code sent to ${email}`}
            {step === 3 && "Create a new strong password for your account"}
            {step === 4 && "Your password has been successfully updated"}
          </p>
        </div>

        {error && <div className="forgot-alert error-alert">{error}</div>}
        {infoMessage && <div className="forgot-alert info-alert">{infoMessage}</div>}

        {/* STEP 1: Email & Robot Captcha */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="forgot-form">
            <label className="field-label" htmlFor="email">
              Registered Email Address
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
                placeholder="e.g. name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Interactive Free Robot Captcha */}
            <RobotCaptcha onVerify={handleCaptchaVerify} />

            <Button
              type="submit"
              className="action-btn"
              disabled={isSubmitting || !captchaData}
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

        {/* STEP 2: Animated OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="forgot-form">
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
                  Resend Code
                </button>
              )}
            </div>

            <Button
              type="submit"
              className="action-btn"
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
                }}
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-form">
            <label className="field-label" htmlFor="newPassword">
              New Password
            </label>
            <div className="input-wrapper">
              <InputField
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label className="field-label" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="input-wrapper">
              <InputField
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            <Button
              type="submit"
              className="action-btn"
              disabled={isSubmitting || !newPassword || !confirmPassword}
            >
              {isSubmitting ? "Updating Password..." : "Reset Password"}
            </Button>
          </form>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="success-step-container">
            <div className="success-icon-badge">
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
              className="action-btn"
              onClick={() => navigate("/login")}
            >
              Proceed to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
