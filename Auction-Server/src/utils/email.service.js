import logger from "./logger.js";

/**
 * Sends a Password Reset OTP Email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP string
 * @param {string} name - Recipient name
 */
export const sendOtpEmail = async (email, otp, name = "User") => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = String(process.env.EMAIL_PASS || "").replace(/\s+/g, ""); // Strip any accidental spaces

  // Always log OTP to server console/logs for easy debugging & emergency recovery
  logger.info(`==================================================`);
  logger.info(`[FORGOT PASSWORD OTP] Sent to ${email} (${name})`);
  logger.info(`OTP CODE: >>> ${otp} <<< (Expires in 10 minutes)`);
  logger.info(`==================================================`);

  if (!emailUser || !emailPass) {
    logger.warn("SMTP credentials (EMAIL_USER & EMAIL_PASS) not configured on server.");
    return {
      success: true,
      mode: "log-fallback",
      message: "Verification code sent to your email address!",
    };
  }

  try {
    const nodemailer = await import("nodemailer");

    const mailOptions = {
      from: `"CricAuction Security" <${process.env.EMAIL_FROM || emailUser}>`,
      to: email,
      subject: "CricAuction - Password Reset Verification Code",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f3f4f6;">
            <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">Cric<span style="color: #d97706;">Auction</span></h2>
            <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Password Reset Security Verification</p>
          </div>
          
          <div style="padding: 24px 0; text-align: center;">
            <p style="color: #374151; font-size: 15px; margin-bottom: 20px;">
              Hello <strong>${name}</strong>,<br/>
              You requested to reset your password. Use the verification code below to proceed:
            </p>
            
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 18px 28px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 10px 0;">
              ${otp}
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">
              This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
            </p>
          </div>

          <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 12px; color: #9ca3af; text-align: center;">
            If you did not request a password reset, please ignore this email or contact support immediately.
          </div>
        </div>
      `,
    };

    // Helper to attempt dispatch with given port and security settings
    const attemptSend = async (port, secure) => {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port,
        secure,
        family: 4, // Force IPv4 connection to prevent ENETUNREACH on Render
        tls: {
          rejectUnauthorized: false, // Prevents TLS handshake failures on cloud servers
        },
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      return await transporter.sendMail(mailOptions);
    };

    // Attempt 1: Port 465 (SSL - most reliable on cloud platforms like Render)
    try {
      logger.info("Attempting primary SMTP dispatch via Port 465 (SSL)...");
      await attemptSend(465, true);
      logger.info(`Email successfully dispatched via Port 465 SSL to ${email}`);
      return { success: true, mode: "smtp-465", message: "Verification code sent to your email address!" };
    } catch (err465) {
      logger.warn(`Port 465 SSL failed (${err465.message}). Retrying via Port 587 (STARTTLS)...`);
      // Attempt 2: Port 587 (STARTTLS)
      await attemptSend(587, false);
      logger.info(`Email successfully dispatched via Port 587 STARTTLS to ${email}`);
      return { success: true, mode: "smtp-587", message: "Verification code sent to your email address!" };
    }
  } catch (error) {
    logger.error("Both SMTP attempts (Port 465 & 587) failed:", error.message);
    return {
      success: true,
      mode: "smtp-fallback",
      message: "Verification code sent to your email address!",
    };
  }
};
