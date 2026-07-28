import { useState, useRef, useEffect } from "react";
import "./AnimatedOtpInput.css";

const AnimatedOtpInput = ({ length = 6, onOtpChange, onComplete, isError = false }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const [activeBox, setActiveBox] = useState(0);
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take last entered character
    const char = value.substring(value.length - 1);
    newOtp[index] = char;
    setOtp(newOtp);

    // Trigger keypress pulse animation
    setAnimatingIndex(index);
    setTimeout(() => setAnimatingIndex(null), 300);

    const combinedOtp = newOtp.join("");
    if (onOtpChange) onOtpChange(combinedOtp);

    // Move to next input if value entered
    if (char && index < length - 1) {
      inputRefs.current[index + 1].focus();
      setActiveBox(index + 1);
    }

    // Trigger completion callback if all filled
    if (combinedOtp.length === length && !newOtp.includes("")) {
      if (onComplete) onComplete(combinedOtp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move back and clear previous
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
        setActiveBox(index - 1);
        if (onOtpChange) onOtpChange(newOtp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
      setActiveBox(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1].focus();
      setActiveBox(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, length).split("");
    const newOtp = [...otp];

    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);
    const combinedOtp = newOtp.join("");
    if (onOtpChange) onOtpChange(combinedOtp);

    const targetIndex = Math.min(digits.length, length - 1);
    if (inputRefs.current[targetIndex]) {
      inputRefs.current[targetIndex].focus();
      setActiveBox(targetIndex);
    }

    if (combinedOtp.length === length) {
      if (onComplete) onComplete(combinedOtp);
    }
  };

  const isFilled = otp.every((digit) => digit !== "");

  return (
    <div className={`otp-container ${isError ? "otp-shake-error" : ""} ${isFilled ? "otp-success-glow" : ""}`}>
      {otp.map((digit, index) => {
        const isPulse = animatingIndex === index;
        const isActive = activeBox === index;
        const hasValue = digit !== "";

        return (
          <div
            key={index}
            className={`otp-box-wrapper ${isActive ? "active" : ""} ${hasValue ? "filled" : ""} ${isPulse ? "pulse" : ""}`}
          >
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setActiveBox(index)}
              onPaste={handlePaste}
              className="otp-input-field"
              autoComplete="off"
            />
            {hasValue && <span className="otp-digit-dot"></span>}
          </div>
        );
      })}
    </div>
  );
};

export default AnimatedOtpInput;
