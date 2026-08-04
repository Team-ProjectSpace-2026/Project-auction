import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates Nodemailer Transporter using Brevo / SMTP configuration
 */
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER || 'heyprojectspace@gmail.com';
  const pass = process.env.EMAIL_PASS || process.env.BREVO_API_KEY || '';

  if (!pass) {
    console.warn('⚠️ SMTP password/key missing in EMAIL_PASS. Using jsonTransport fallback.');
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
};

/**
 * Send Automated Player Registration Email & Digital Pass
 */
export const sendPlayerRegistrationEmail = async ({ player, tournament }) => {
  if (!player.email) {
    console.log(`ℹ️ Player ${player.name} has no email address provided. Skipping email receipt.`);
    return;
  }

  try {
    const fromEmail = process.env.EMAIL_FROM || 'heyprojectspace@gmail.com';

    const tournamentName = tournament?.name || 'Esports Tournament';
    const tournamentLogo = tournament?.logo || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    const cricAuctionLogo = 'https://cricauctionhub.vercel.app/assets/cricauctionlogo1-CyVXwwA0.png';

    const regNo = String(player.registrationNumber || 1).padStart(3, '0');
    const amountPaid = player.paymentDetails?.amountPaid || tournament?.registrationFee || 0;
    const utr = player.paymentDetails?.utrLast4 || 'N/A';
    const paidAtDate = player.paymentDetails?.paidAt
      ? new Date(player.paymentDetails.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Receipt - ${tournamentName}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; text-align: center; border-bottom: 3px solid #2563eb; }
        .logo-row { display: flex; justify-content: space-between; align-items: center; padding: 0 10px; }
        .brand-name { color: #38bdf8; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-decoration: none; }
        .badge-verified { background: #dcfce7; border: 1px solid #86efac; color: #16a34a; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px; display: inline-block; margin-top: 15px; }
        .content { padding: 30px; }
        .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .sub-text { font-size: 14px; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
        .ticket-card { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px; position: relative; }
        .ticket-header { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
        .pass-title { font-size: 14px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
        .reg-number { font-size: 14px; font-weight: 800; color: #2563eb; }
        .grid-2 { display: table; width: 100%; margin-bottom: 12px; }
        .cell { display: table-cell; width: 50%; padding: 4px 0; font-size: 13px; }
        .label { color: #64748b; font-weight: 600; display: block; margin-bottom: 2px; font-size: 11px; text-transform: uppercase; }
        .val { color: #0f172a; font-weight: 700; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div style="text-align: center;">
            <a href="https://cricauctionhub.vercel.app" class="brand-name">🏏 CRICAUCTION HUB</a>
          </div>
          <div class="badge-verified">
            ✓ REGISTRATION CONFIRMED & VERIFIED
          </div>
        </div>

        <!-- Body Content -->
        <div class="content">
          <div class="greeting">Congratulations, ${player.name}! 🎉</div>
          <div class="sub-text">
            You are officially registered for <strong>${tournamentName}</strong>. Below is your official player pass and payment receipt.
          </div>

          <!-- Digital Ticket Pass -->
          <div class="ticket-card">
            <div class="ticket-header">
              <span class="pass-title">🎟️ Official Player Pass</span>
              <span class="reg-number">REG #${regNo}</span>
            </div>

            <div class="grid-2">
              <div class="cell">
                <span class="label">Player Name</span>
                <span class="val">${player.name}</span>
              </div>
              <div class="cell">
                <span class="label">Primary Role</span>
                <span class="val">${player.role}</span>
              </div>
            </div>

            <div class="grid-2">
              <div class="cell">
                <span class="label">Jersey Name</span>
                <span class="val">${player.jerseyName || player.name}</span>
              </div>
              <div class="cell">
                <span class="label">Jersey Size</span>
                <span class="val">${player.jerseySize || 'Standard'}</span>
              </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin: 12px 0; padding-top: 12px;"></div>

            <div class="grid-2">
              <div class="cell">
                <span class="label">Amount Paid</span>
                <span class="val" style="color: #16a34a; font-size: 16px;">₹${amountPaid}</span>
              </div>
              <div class="cell">
                <span class="label">Payment Status</span>
                <span class="val" style="color: #16a34a;">VERIFIED ✓</span>
              </div>
            </div>

            <div class="grid-2">
              <div class="cell">
                <span class="label">UTR / Ref No</span>
                <span class="val">${utr}</span>
              </div>
              <div class="cell">
                <span class="label">Date</span>
                <span class="val">${paidAtDate}</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 13px; color: #64748b; margin: 0;">
              Keep this email safe for your records. Show this digital pass to your tournament organizer on auction day.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          Sent with ❤️ by <strong>CricAuction Hub</strong> &bull; Tournament Management Platform<br>
          Have questions? Contact your tournament organizer or visit <a href="https://cricauctionhub.vercel.app" style="color: #2563eb; text-decoration: none;">cricauctionhub.vercel.app</a>
        </div>
      </div>
    </body>
    </html>
    `;

    const brevoApiKey = process.env.BREVO_API_KEY || (process.env.EMAIL_PASS?.startsWith('xkeysib-') ? process.env.EMAIL_PASS : null);

    // 1. Primary: Brevo REST API (Cloud API, 300 free emails/day)
    if (brevoApiKey) {
      try {
        console.log(`✉️ Attempting registration email dispatch via Brevo REST API to ${player.email}...`);
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": brevoApiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            sender: { name: "CricAuction Hub", email: fromEmail },
            to: [{ email: player.email, name: player.name }],
            subject: `🎉 Registration Confirmed: ${tournamentName} (Pass #${regNo})`,
            htmlContent
          })
        });

        const data = await response.json();
        if (response.ok) {
          console.log(`✅ Registration email successfully sent via Brevo REST API to ${player.email}. Message ID: ${data.messageId}`);
          return data;
        } else {
          console.warn(`⚠️ Brevo API returned error:`, data);
        }
      } catch (brevoErr) {
        console.error(`⚠️ Brevo REST API dispatch error:`, brevoErr);
      }
    }

    // 2. Fallback: Nodemailer SMTP
    const transporter = createTransporter();
    const mailOptions = {
      from: `"CricAuction Hub" <${fromEmail}>`,
      to: player.email,
      subject: `🎉 Registration Confirmed: ${tournamentName} (Pass #${regNo})`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Registration email successfully sent via SMTP to ${player.email}. Message ID: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error(`❌ Failed to send registration email to ${player.email}:`, error);
  }
};
