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
    const amountPaid = player.paymentDetails?.amountPaid !== undefined && player.paymentDetails?.amountPaid !== null
      ? player.paymentDetails.amountPaid
      : (tournament?.registrationFee || 0);
    const utr = player.paymentDetails?.utrLast4 || 'N/A';
    const paidAtDate = player.paymentDetails?.paidAt
      ? new Date(player.paymentDetails.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const invoiceNo = `INV-REG${regNo}`;
    const playerEmail = player.email || '';
    const playerMobile = player.mobile ? `${player.countryCode || '+91'} ${player.mobile}` : '';
    const playerRole = player.role || 'Player';
    const jerseyInfo = `${player.jerseyName || player.name} · Size ${player.jerseySize || 'Standard'}`;
    const paymentMethod = utr !== 'N/A' ? 'UPI / Direct Transfer' : 'Direct Payment';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceNo} - ${tournamentName}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#334155;">

      <!-- Outer wrapper -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9; padding:24px 0;">
        <tr>
          <td align="center">

            <!-- Main container -->
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- ═══ HEADER BAR ═══ -->
              <tr>
                <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%); padding:20px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="color:#38bdf8; font-size:18px; font-weight:800; letter-spacing:0.5px;">
                        <a href="https://cricauctionhub.vercel.app" style="color:#38bdf8; text-decoration:none;">🏏 CRICAUCTION HUB</a>
                      </td>
                      <td align="right">
                        <span style="background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.3); color:#4ade80; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; letter-spacing:0.5px;">● PAID</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ═══ INVOICE TITLE ROW ═══ -->
              <tr>
                <td style="padding:28px 32px 0 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        <h1 style="margin:0 0 4px 0; font-size:24px; font-weight:800; color:#0f172a;">INVOICE</h1>
                        <p style="margin:0; font-size:13px; color:#64748b;">Registration Receipt & Player Pass</p>
                      </td>
                      <td align="right" style="vertical-align:top;">
                        <p style="margin:0 0 2px 0; font-size:12px; color:#94a3b8; font-weight:600;">INVOICE NO.</p>
                        <p style="margin:0 0 8px 0; font-size:15px; font-weight:800; color:#2563eb;">${invoiceNo}</p>
                        <p style="margin:0 0 2px 0; font-size:12px; color:#94a3b8; font-weight:600;">DATE</p>
                        <p style="margin:0; font-size:13px; font-weight:700; color:#0f172a;">${paidAtDate}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ═══ DIVIDER ═══ -->
              <tr><td style="padding:20px 32px 0 32px;"><div style="border-top:2px solid #e2e8f0;"></div></td></tr>

              <!-- ═══ BILLED TO & TOURNAMENT INFO ═══ -->
              <tr>
                <td style="padding:20px 32px 0 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <!-- Billed To -->
                      <td style="vertical-align:top; width:55%;">
                        <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Billed To</p>
                        <p style="margin:0 0 3px 0; font-size:16px; font-weight:700; color:#0f172a;">${player.name}</p>
                        ${playerEmail ? `<p style="margin:0 0 2px 0; font-size:13px; color:#64748b;">📧 ${playerEmail}</p>` : ''}
                        ${playerMobile ? `<p style="margin:0 0 2px 0; font-size:13px; color:#64748b;">📱 ${playerMobile}</p>` : ''}
                        <p style="margin:4px 0 0 0; font-size:12px; color:#2563eb; font-weight:600;">🏏 ${playerRole} · Jersey: ${jerseyInfo}</p>
                      </td>
                      <!-- Tournament -->
                      <td style="vertical-align:top;" align="right">
                        <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Tournament</p>
                        <p style="margin:0 0 2px 0; font-size:14px; font-weight:700; color:#0f172a;">${tournamentName}</p>
                        <p style="margin:0; font-size:12px; color:#64748b;">Pass #REG-${regNo}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ═══ ITEMIZED BILLING TABLE ═══ -->
              <tr>
                <td style="padding:24px 32px 0 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <!-- Table Header -->
                    <tr>
                      <td style="background:#f8fafc; padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #e2e8f0; border-radius:8px 0 0 0;">Description</td>
                      <td style="background:#f8fafc; padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #e2e8f0;" align="center">Qty</td>
                      <td style="background:#f8fafc; padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #e2e8f0; border-radius:0 8px 0 0;" align="right">Amount</td>
                    </tr>
                    <!-- Line Item 1: Tournament Entry -->
                    <tr>
                      <td style="padding:14px 14px; font-size:14px; color:#0f172a; font-weight:600; border-bottom:1px solid #f1f5f9;">
                        Tournament Player Entry & Pass
                        <br><span style="font-size:12px; color:#94a3b8; font-weight:400;">${tournamentName}</span>
                      </td>
                      <td style="padding:14px 14px; font-size:14px; color:#475569; border-bottom:1px solid #f1f5f9;" align="center">1</td>
                      <td style="padding:14px 14px; font-size:14px; color:#0f172a; font-weight:700; border-bottom:1px solid #f1f5f9;" align="right">₹${amountPaid}</td>
                    </tr>
                    <!-- Line Item 2: Platform Fee -->
                    <tr>
                      <td style="padding:14px 14px; font-size:14px; color:#0f172a; font-weight:600; border-bottom:1px solid #f1f5f9;">
                        Platform & Processing Fee
                        <br><span style="font-size:12px; color:#94a3b8; font-weight:400;">CricAuction Hub Service</span>
                      </td>
                      <td style="padding:14px 14px; font-size:14px; color:#475569; border-bottom:1px solid #f1f5f9;" align="center">—</td>
                      <td style="padding:14px 14px; font-size:14px; color:#16a34a; font-weight:700; border-bottom:1px solid #f1f5f9;" align="right">FREE</td>
                    </tr>
                    <!-- Subtotal -->
                    <tr>
                      <td colspan="2" style="padding:12px 14px; font-size:13px; color:#64748b; font-weight:600; border-bottom:1px solid #e2e8f0;" align="right">Subtotal</td>
                      <td style="padding:12px 14px; font-size:14px; color:#0f172a; font-weight:700; border-bottom:1px solid #e2e8f0;" align="right">₹${amountPaid}</td>
                    </tr>
                    <!-- Taxes -->
                    <tr>
                      <td colspan="2" style="padding:10px 14px; font-size:13px; color:#64748b; font-weight:600; border-bottom:2px solid #e2e8f0;" align="right">Taxes & Fees</td>
                      <td style="padding:10px 14px; font-size:13px; color:#64748b; font-weight:600; border-bottom:2px solid #e2e8f0;" align="right">₹0.00</td>
                    </tr>
                    <!-- TOTAL -->
                    <tr>
                      <td colspan="2" style="padding:14px 14px; font-size:16px; color:#0f172a; font-weight:800;" align="right">TOTAL PAID</td>
                      <td style="padding:14px 14px; font-size:20px; color:#16a34a; font-weight:800;" align="right">₹${amountPaid}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ═══ TRANSACTION DETAILS ═══ -->
              <tr>
                <td style="padding:20px 32px 0 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden;">
                    <tr>
                      <td style="padding:14px 16px; border-right:1px solid #e2e8f0; width:33%;">
                        <p style="margin:0 0 3px 0; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Payment Method</p>
                        <p style="margin:0; font-size:13px; font-weight:700; color:#0f172a;">${paymentMethod}</p>
                      </td>
                      <td style="padding:14px 16px; border-right:1px solid #e2e8f0; width:33%;">
                        <p style="margin:0 0 3px 0; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">UTR / Ref No.</p>
                        <p style="margin:0; font-size:13px; font-weight:700; color:#0f172a;">${utr}</p>
                      </td>
                      <td style="padding:14px 16px; width:33%;">
                        <p style="margin:0 0 3px 0; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Status</p>
                        <p style="margin:0; font-size:13px; font-weight:800; color:#16a34a;">✓ VERIFIED</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ═══ PAID STAMP ═══ -->
              <tr>
                <td style="padding:24px 32px;" align="center">
                  <div style="display:inline-block; border:3px solid #16a34a; border-radius:12px; padding:10px 28px; transform:rotate(-3deg);">
                    <span style="font-size:22px; font-weight:900; color:#16a34a; letter-spacing:3px;">PAID & VERIFIED</span>
                  </div>
                </td>
              </tr>

              <!-- ═══ NOTICE ═══ -->
              <tr>
                <td style="padding:0 32px 24px 32px;" align="center">
                  <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.6;">
                    Keep this invoice safe for your records.<br>
                    Show this digital pass to your tournament organizer on auction day.
                  </p>
                </td>
              </tr>

              <!-- ═══ FOOTER ═══ -->
              <tr>
                <td style="background:#0f172a; padding:20px 32px; text-align:center;">
                  <p style="margin:0 0 6px 0; font-size:13px; color:rgba(255,255,255,0.6);">
                    Sent with ❤️ by <strong style="color:#38bdf8;">CricAuction Hub</strong> · Tournament Management Platform
                  </p>
                  <p style="margin:0; font-size:12px; color:rgba(255,255,255,0.4);">
                    Have questions? Contact your tournament organizer or visit
                    <a href="https://cricauctionhub.vercel.app" style="color:#38bdf8; text-decoration:none;">cricauctionhub.vercel.app</a>
                  </p>
                </td>
              </tr>

            </table>
            <!-- End main container -->

          </td>
        </tr>
      </table>
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
