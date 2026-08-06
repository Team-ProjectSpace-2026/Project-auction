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
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceNo} - ${tournamentName}</title>
      <style>
        @media only screen and (max-width: 480px) {
          .outer-pad { padding: 8px !important; }
          .inner-pad { padding: 24px 18px !important; }
          .meta-row td { display: block !important; width: 100% !important; padding-bottom: 6px !important; }
          .meta-row td + td { text-align: left !important; }
        }
      </style>
    </head>
    <body style="margin:0; padding:0; background-color:#3b4894; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">

      <!-- Outer wrapper with blue/indigo background -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#3b4894;">
        <tr>
          <td align="center" class="outer-pad" style="padding:32px 16px;">

            <!-- ══ Main white card ══ -->
            <table cellpadding="0" cellspacing="0" border="0" style="max-width:560px; width:100%; background:#ffffff; border-radius:8px; overflow:hidden;">

              <!-- ── Header: INVOICE title + subtitle ── -->
              <tr>
                <td style="padding:28px 36px 16px 36px; text-align:center;">
                  <h1 style="margin:0 0 4px 0; font-size:28px; font-weight:900; color:#1e1e2f; letter-spacing:2px;">INVOICE</h1>
                  <p style="margin:0; font-size:13px; color:#888888; font-weight:500;">Player Registration Receipt & Digital Pass</p>
                </td>
              </tr>

              <!-- ── Orange accent banner ── -->
              <tr>
                <td style="padding:0 36px;">
                  <div style="background:#f5a623; border-radius:8px; padding:16px 20px; text-align:center;">
                    <span style="font-size:18px; font-weight:800; color:#ffffff; letter-spacing:0.5px;">🏏 CricAuction Hub</span>
                  </div>
                </td>
              </tr>

              <!-- ── Brand info line ── -->
              <tr>
                <td style="padding:16px 36px 12px 36px; text-align:center;">
                  <p style="margin:0; font-size:12px; color:#999999;">cricauctionhub.vercel.app · Tournament Management Platform</p>
                </td>
              </tr>

              <!-- ── Separator ── -->
              <tr><td style="padding:0 36px;"><div style="border-top:1px solid #eeeeee;"></div></td></tr>

              <!-- ── Billed To + Date/Invoice row ── -->
              <tr>
                <td class="inner-pad" style="padding:20px 36px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" class="meta-row">
                    <tr>
                      <td style="vertical-align:top; width:55%;">
                        <p style="margin:0 0 6px 0; font-size:15px; font-weight:700; color:#1e1e2f;">${player.name}</p>
                        ${playerEmail ? `<p style="margin:0 0 3px 0; font-size:12px; color:#666666; word-break:break-all;">${playerEmail}</p>` : ''}
                        ${playerMobile ? `<p style="margin:0 0 3px 0; font-size:12px; color:#666666;">${playerMobile}</p>` : ''}
                        <p style="margin:4px 0 0 0; font-size:12px; color:#999999;">${playerRole} · Jersey: ${player.jerseyName || player.name} · ${player.jerseySize || 'M'}</p>
                      </td>
                      <td align="right" style="vertical-align:top; width:45%;">
                        <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; color:#f5a623; text-transform:uppercase; letter-spacing:0.5px;">Date</p>
                        <p style="margin:0 0 10px 0; font-size:13px; font-weight:600; color:#1e1e2f;">${paidAtDate}</p>
                        <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; color:#f5a623; text-transform:uppercase; letter-spacing:0.5px;">Invoice</p>
                        <p style="margin:0; font-size:13px; font-weight:600; color:#1e1e2f;">${invoiceNo}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ── Tournament Info Box ── -->
              <tr>
                <td class="inner-pad" style="padding:0 36px 16px 36px;">
                  <div style="background:#fff8ee; border:1px solid #f5d89a; border-radius:8px; padding:12px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; color:#f5a623; text-transform:uppercase; letter-spacing:0.5px;">Tournament</p>
                          <p style="margin:0 0 2px 0; font-size:14px; font-weight:700; color:#1e1e2f;">${tournamentName}</p>
                        </td>
                        <td align="right">
                          <span style="background:#f5a623; color:#ffffff; font-size:11px; font-weight:700; padding:4px 10px; border-radius:12px;">Pass #REG-${regNo}</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- ══ ITEMS TABLE ══ -->
              <tr>
                <td class="inner-pad" style="padding:4px 36px 8px 36px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <!-- Table header (orange) -->
                    <tr>
                      <th align="left" style="background:#f5a623; padding:10px 12px; font-size:11px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.5px; border-radius:6px 0 0 0;">Description</th>
                      <th align="center" style="background:#f5a623; padding:10px 8px; font-size:11px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.5px;">Rate</th>
                      <th align="right" style="background:#f5a623; padding:10px 12px; font-size:11px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.5px; border-radius:0 6px 0 0;">Subtotal</th>
                    </tr>
                    <!-- Row 1: Player Entry -->
                    <tr>
                      <td align="left" style="padding:14px 12px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">Tournament Player Entry & Pass</td>
                      <td align="center" style="padding:14px 8px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">₹${amountPaid}</td>
                      <td align="right" style="padding:14px 12px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">₹${amountPaid}</td>
                    </tr>
                    <!-- Row 2: Platform Fee -->
                    <tr>
                      <td align="left" style="padding:14px 12px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">Platform & Processing Fee</td>
                      <td align="center" style="padding:14px 8px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">—</td>
                      <td align="right" style="padding:14px 12px; font-size:13px; color:#16a34a; font-weight:600; border-bottom:1px solid #f0f0f0;">FREE</td>
                    </tr>
                    <!-- Row 3: Taxes -->
                    <tr>
                      <td align="left" style="padding:14px 12px; font-size:13px; color:#333333; border-bottom:1px solid #eeeeee;">Taxes & Fees</td>
                      <td align="center" style="padding:14px 8px; font-size:13px; color:#333333; border-bottom:1px solid #eeeeee;">—</td>
                      <td align="right" style="padding:14px 12px; font-size:13px; color:#333333; border-bottom:1px solid #eeeeee;">₹0.00</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ── Total row ── -->
              <tr>
                <td class="inner-pad" style="padding:12px 36px 24px 36px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>&nbsp;</td>
                      <td align="right" style="width:50%;">
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                          <tr>
                            <td align="right" style="padding:8px 16px 8px 0; font-size:16px; font-weight:800; color:#1e1e2f;">TOTAL</td>
                            <td align="right" style="padding:8px 0; font-size:22px; font-weight:900; color:#f5a623;">₹${amountPaid}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ── Separator ── -->
              <tr><td style="padding:0 36px;"><div style="border-top:1px solid #eeeeee;"></div></td></tr>

              <!-- ── Payment Details ── -->
              <tr>
                <td class="inner-pad" style="padding:18px 36px 20px 36px;">
                  <p style="margin:0 0 10px 0; font-size:12px; font-weight:700; color:#1e1e2f; text-transform:uppercase; letter-spacing:0.5px;">💳 Payment Details</p>
                  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                    <tr>
                      <td style="padding:4px 0; font-size:12px; font-weight:600; color:#555555; width:40%;">Payment Method:</td>
                      <td style="padding:4px 0; font-size:13px; color:#333333;">${paymentMethod}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; font-size:12px; font-weight:600; color:#555555;">UTR / Ref No:</td>
                      <td style="padding:4px 0; font-size:13px; color:#333333; word-break:break-all;">${utr}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; font-size:12px; font-weight:600; color:#555555;">Status:</td>
                      <td style="padding:4px 0; font-size:13px; font-weight:700; color:#16a34a;">✓ Paid & Verified</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ── Separator ── -->
              <tr><td style="padding:0 36px;"><div style="border-top:1px solid #eeeeee;"></div></td></tr>

              <!-- ── Important Note ── -->
              <tr>
                <td class="inner-pad" style="padding:18px 36px 24px 36px;">
                  <p style="margin:0 0 8px 0; font-size:12px; font-weight:700; color:#1e1e2f; text-transform:uppercase; letter-spacing:0.5px;">📌 Important</p>
                  <p style="margin:0; font-size:11px; color:#999999; line-height:1.6;">
                    Keep this invoice for your records. This serves as your digital player pass — show it to your tournament organizer on auction day.
                    For any queries, please contact your tournament organizer or visit cricauctionhub.vercel.app.
                  </p>
                </td>
              </tr>

              <!-- ── Footer ── -->
              <tr>
                <td style="padding:16px 36px 24px 36px; text-align:center; background:#f9f9f9; border-top:1px solid #eeeeee;">
                  <p style="margin:0 0 4px 0; font-size:12px; color:#999999;">
                    Thank you for registering! <strong style="color:#1e1e2f;">CricAuction Hub</strong> 🏏
                  </p>
                  <p style="margin:0; font-size:11px; color:#bbbbbb;">
                    <a href="https://cricauctionhub.vercel.app" style="color:#f5a623; text-decoration:none; font-weight:600;">cricauctionhub.vercel.app</a>
                  </p>
                </td>
              </tr>

            </table>
            <!-- End main card -->

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

/**
 * Helper to render structured responsive HTML email shell
 */
const renderEmailShell = ({ title, subtitle, accentColor = '#f5a623', innerHtml }) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      @media only screen and (max-width: 480px) {
        .outer-pad { padding: 8px !important; }
        .inner-pad { padding: 24px 18px !important; }
        .meta-row td { display: block !important; width: 100% !important; padding-bottom: 6px !important; }
        .meta-row td + td { text-align: left !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#3b4894; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#3b4894;">
      <tr>
        <td align="center" class="outer-pad" style="padding:32px 16px;">
          <table cellpadding="0" cellspacing="0" border="0" style="max-width:560px; width:100%; background:#ffffff; border-radius:8px; overflow:hidden;">
            <tr>
              <td style="padding:28px 36px 16px 36px; text-align:center;">
                <h1 style="margin:0 0 4px 0; font-size:26px; font-weight:900; color:#1e1e2f; letter-spacing:1px;">${title}</h1>
                ${subtitle ? `<p style="margin:0; font-size:13px; color:#888888; font-weight:500;">${subtitle}</p>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px;">
                <div style="background:${accentColor}; border-radius:8px; padding:14px 20px; text-align:center;">
                  <span style="font-size:17px; font-weight:800; color:#ffffff;">🏏 CricAuction Hub</span>
                </div>
              </td>
            </tr>
            <tr><td style="padding:16px 36px 0 36px;"><div style="border-top:1px solid #eeeeee;"></div></td></tr>
            ${innerHtml}
            <tr>
              <td style="padding:16px 36px 24px 36px; text-align:center; background:#f9f9f9; border-top:1px solid #eeeeee;">
                <p style="margin:0 0 4px 0; font-size:12px; color:#999999;">
                  Thank you for choosing <strong style="color:#1e1e2f;">CricAuction Hub</strong> 🏏
                </p>
                <p style="margin:0; font-size:11px; color:#bbbbbb;">
                  <a href="https://cricauctionhub.vercel.app" style="color:${accentColor}; text-decoration:none; font-weight:600;">cricauctionhub.vercel.app</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Helper to dispatch emails via Brevo REST API with Nodemailer SMTP fallback
 */
const dispatchEmail = async ({ to, name, subject, htmlContent }) => {
  const fromEmail = process.env.EMAIL_FROM || 'heyprojectspace@gmail.com';
  const brevoApiKey = process.env.BREVO_API_KEY || (process.env.EMAIL_PASS?.startsWith('xkeysib-') ? process.env.EMAIL_PASS : null);

  if (brevoApiKey) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "accept": "application/json", "api-key": brevoApiKey, "content-type": "application/json" },
        body: JSON.stringify({
          sender: { name: "CricAuction Hub", email: fromEmail },
          to: [{ email: to, name: name || 'User' }],
          subject,
          htmlContent
        })
      });
      const data = await response.json();
      if (response.ok) return data;
      console.warn(`⚠️ Brevo API returned error:`, data);
    } catch (e) {
      console.error(`⚠️ Brevo REST API dispatch error:`, e);
    }
  }

  const transporter = createTransporter();
  return await transporter.sendMail({
    from: `"CricAuction Hub" <${fromEmail}>`,
    to,
    subject,
    html: htmlContent
  });
};

/**
 * Send Organizer Pack/Subscription Purchase Invoice Email
 */
export const sendOrganizerPackInvoiceEmail = async ({ organizer, plan, payment, tournament }) => {
  if (!organizer.email) return;

  try {
    const invoiceNo = `INV-PACK-${String(payment.orderId || Date.now()).slice(-6).toUpperCase()}`;
    const purchaseDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const planName = plan.name || 'Auction Hosting Plan';
    const planPrice = plan.price || 0;
    const maxTeams = plan.maxTeams || 0;
    const effectivePerTeam = plan.effectivePerTeam || 0;
    const planDescription = plan.description || '';

    const organizerName = organizer.name || 'Organizer';
    const organizerEmail = organizer.email || '';
    const organizerPhone = organizer.phone ? `${organizer.countryCode || '+91'} ${organizer.phone}` : '';
    const tournamentName = tournament?.name || 'Tournament';
    const numTeams = tournament?.numTeams || maxTeams;

    const innerHtml = `
      <tr>
        <td class="inner-pad" style="padding:20px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" class="meta-row">
            <tr>
              <td style="vertical-align:top; width:55%;">
                <p style="margin:0 0 6px 0; font-size:15px; font-weight:700; color:#1e1e2f;">${organizerName}</p>
                ${organizerEmail ? `<p style="margin:0 0 3px 0; font-size:12px; color:#666666;">${organizerEmail}</p>` : ''}
                ${organizerPhone ? `<p style="margin:0 0 3px 0; font-size:12px; color:#666666;">${organizerPhone}</p>` : ''}
                ${tournamentName ? `<p style="margin:4px 0 0 0; font-size:12px; color:#999999;">Tournament: ${tournamentName}</p>` : ''}
              </td>
              <td align="right" style="vertical-align:top; width:45%;">
                <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; color:#f5a623; text-transform:uppercase;">Date</p>
                <p style="margin:0 0 10px 0; font-size:13px; font-weight:600; color:#1e1e2f;">${purchaseDate}</p>
                <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; color:#f5a623; text-transform:uppercase;">Invoice</p>
                <p style="margin:0; font-size:13px; font-weight:600; color:#1e1e2f;">${invoiceNo}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td class="inner-pad" style="padding:0 36px 8px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <th align="left" style="background:#f5a623; padding:10px 12px; font-size:11px; font-weight:700; color:#ffffff;">Description</th>
              <th align="center" style="background:#f5a623; padding:10px 8px; font-size:11px; font-weight:700; color:#ffffff;">Rate</th>
              <th align="right" style="background:#f5a623; padding:10px 12px; font-size:11px; font-weight:700; color:#ffffff;">Subtotal</th>
            </tr>
            <tr>
              <td align="left" style="padding:14px 12px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">${planName} (Up to ${maxTeams} Teams)</td>
              <td align="center" style="padding:14px 8px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">₹${planPrice}</td>
              <td align="right" style="padding:14px 12px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">₹${planPrice}</td>
            </tr>
            <tr>
              <td align="left" style="padding:14px 12px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">Platform Service Fee</td>
              <td align="center" style="padding:14px 8px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">—</td>
              <td align="right" style="padding:14px 12px; font-size:13px; color:#16a34a; font-weight:600; border-bottom:1px solid #f0f0f0;">FREE</td>
            </tr>
            <tr>
              <td align="left" style="padding:14px 12px; font-size:13px; color:#333333; border-bottom:1px solid #eeeeee;">Teams Selected: ${numTeams}</td>
              <td align="center" style="padding:14px 8px; font-size:13px; color:#333333; border-bottom:1px solid #eeeeee;">~₹${effectivePerTeam}/team</td>
              <td align="right" style="padding:14px 12px; font-size:13px; color:#888888; border-bottom:1px solid #eeeeee;">—</td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td class="inner-pad" style="padding:12px 36px 24px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>&nbsp;</td>
              <td align="right" style="width:50%;">
                <p style="margin:0; font-size:16px; font-weight:800; color:#1e1e2f;">TOTAL: <span style="font-size:22px; color:#f5a623; margin-left:8px;">₹${planPrice}</span></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr><td style="padding:0 36px;"><div style="border-top:1px solid #eeeeee;"></div></td></tr>

      <tr>
        <td class="inner-pad" style="padding:18px 36px 20px 36px;">
          <p style="margin:0 0 10px 0; font-size:12px; font-weight:700; color:#1e1e2f; text-transform:uppercase;">💳 Payment Details</p>
          <p style="margin:0 0 4px 0; font-size:12px; color:#555555;">Payment Method: ${payment.method || 'Cashfree'}</p>
          <p style="margin:0 0 4px 0; font-size:12px; color:#555555;">Order ID: ${payment.orderId || 'N/A'}</p>
          <p style="margin:0; font-size:12px; font-weight:700; color:#16a34a;">✓ Paid & Verified</p>
        </td>
      </tr>
    `;

    const htmlContent = renderEmailShell({
      title: 'INVOICE',
      subtitle: 'Auction Hosting Plan Purchase',
      accentColor: '#f5a623',
      innerHtml
    });

    return await dispatchEmail({
      to: organizer.email,
      name: organizerName,
      subject: `🧾 Invoice: ${planName} — Auction Hosting (${invoiceNo})`,
      htmlContent
    });
  } catch (error) {
    console.error(`❌ Failed to send pack invoice email to ${organizer.email}:`, error);
  }
};

/**
 * Send Organizer Upgrade Plan Invoice Email
 */
export const sendOrganizerUpgradeInvoiceEmail = async ({ organizer, oldPlan, newPlan, netPaid, payment, tournament }) => {
  if (!organizer.email) return;

  try {
    const invoiceNo = `INV-UPG-${String(payment.orderId || Date.now()).slice(-6).toUpperCase()}`;
    const upgradeDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const organizerName = organizer.name || 'Organizer';
    const organizerEmail = organizer.email || '';
    const organizerPhone = organizer.phone ? `${organizer.countryCode || '+91'} ${organizer.phone}` : '';
    const tournamentName = tournament?.name || 'Tournament';

    const innerHtml = `
      <tr>
        <td class="inner-pad" style="padding:20px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" class="meta-row">
            <tr>
              <td style="vertical-align:top; width:55%;">
                <p style="margin:0 0 4px 0; font-size:15px; font-weight:700; color:#1e1e2f;">${organizerName}</p>
                ${organizerEmail ? `<p style="margin:0 0 2px 0; font-size:12px; color:#666666;">${organizerEmail}</p>` : ''}
                ${organizerPhone ? `<p style="margin:0 0 2px 0; font-size:12px; color:#666666;">${organizerPhone}</p>` : ''}
                <p style="margin:4px 0 0 0; font-size:12px; color:#999999;">Tournament: ${tournamentName}</p>
              </td>
              <td align="right" style="vertical-align:top; width:45%;">
                <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; color:#f5a623; text-transform:uppercase;">Date</p>
                <p style="margin:0 0 8px 0; font-size:13px; font-weight:600; color:#1e1e2f;">${upgradeDate}</p>
                <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; color:#f5a623; text-transform:uppercase;">Invoice No.</p>
                <p style="margin:0; font-size:13px; font-weight:600; color:#1e1e2f;">${invoiceNo}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td class="inner-pad" style="padding:0 36px 12px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <th align="left" style="background:#f5a623; padding:10px 12px; font-size:11px; font-weight:700; color:#ffffff;">Description</th>
              <th align="right" style="background:#f5a623; padding:10px 12px; font-size:11px; font-weight:700; color:#ffffff;">Amount</th>
            </tr>
            <tr>
              <td align="left" style="padding:12px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">
                Upgraded Plan: <strong>${newPlan.name}</strong> (Up to ${newPlan.maxTeams} Teams)
              </td>
              <td align="right" style="padding:12px; font-size:13px; color:#333333; border-bottom:1px solid #f0f0f0;">₹${newPlan.price}</td>
            </tr>
            <tr>
              <td align="left" style="padding:12px; font-size:13px; color:#666666; border-bottom:1px solid #eeeeee;">
                Previous Plan Credit: <em>${oldPlan.name || 'Previous Plan'} (${oldPlan.maxTeams || ''} Teams)</em>
              </td>
              <td align="right" style="padding:12px; font-size:13px; color:#16a34a; font-weight:600; border-bottom:1px solid #eeeeee;">- ₹${oldPlan.price || 0}</td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td class="inner-pad" style="padding:12px 36px 20px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>&nbsp;</td>
              <td align="right" style="width:60%;">
                <p style="margin:0; font-size:15px; font-weight:800; color:#1e1e2f;">
                  NET AMOUNT PAID: <span style="font-size:22px; color:#f5a623; margin-left:8px;">₹${netPaid}</span>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr><td style="padding:0 36px;"><div style="border-top:1px solid #eeeeee;"></div></td></tr>

      <tr>
        <td class="inner-pad" style="padding:16px 36px 20px 36px;">
          <p style="margin:0 0 6px 0; font-size:12px; font-weight:700; color:#1e1e2f;">💳 Payment Details</p>
          <p style="margin:0 0 4px 0; font-size:12px; color:#555555;">Payment Method: ${payment.method || 'Cashfree'}</p>
          <p style="margin:0 0 4px 0; font-size:12px; color:#555555;">Order ID: ${payment.orderId || 'N/A'}</p>
          <p style="margin:0; font-size:12px; font-weight:700; color:#16a34a;">✓ Upgrade Active & Verified</p>
        </td>
      </tr>
    `;

    const htmlContent = renderEmailShell({
      title: '⚡ PLAN UPGRADE INVOICE',
      subtitle: 'Difference Amount Payment Receipt',
      accentColor: '#f5a623',
      innerHtml
    });

    return await dispatchEmail({
      to: organizer.email,
      name: organizerName,
      subject: `⚡ Plan Upgraded: ${newPlan.name} (${invoiceNo})`,
      htmlContent
    });
  } catch (error) {
    console.error('Failed to send upgrade email:', error);
  }
};

/**
 * Send Organizer Plan Cancellation & Refund Email
 */
export const sendOrganizerCancellationRefundEmail = async ({ organizer, plan, refundAmount, refundId, refundStatus, payment, tournament }) => {
  if (!organizer.email) return;

  try {
    const invoiceNo = `INV-CNC-${String(refundId || Date.now()).slice(-6).toUpperCase()}`;

    const organizerName = organizer.name || 'Organizer';
    const tournamentName = tournament?.name || 'Tournament';

    const isPending = refundStatus === 'PENDING_ADMIN_REVIEW';
    const statusText = isPending ? '⏳ Pending Admin Review' : '✓ Refund Processed / Initiated';
    const statusColor = isPending ? '#d97706' : '#16a34a';

    const innerHtml = `
      <tr>
        <td class="inner-pad" style="padding:20px 36px;">
          <p style="margin:0 0 4px 0; font-size:15px; font-weight:700; color:#1e1e2f;">Dear ${organizerName},</p>
          <p style="margin:0 0 14px 0; font-size:13px; color:#555555; line-height:1.5;">
            Your subscription plan for <strong>${tournamentName}</strong> has been cancelled per your request.
            ${isPending ? 'Your refund request has been logged and is pending admin review.' : 'A full refund has been initiated to your original payment method.'}
          </p>

          <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:14px 18px; margin-bottom:16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:12px; color:#991b1b; font-weight:700;">Cancelled Plan:</td>
                <td align="right" style="font-size:13px; color:#1e1e2f; font-weight:600;">${plan?.name || 'Hosting Plan'} (${plan?.maxTeams || ''} Teams)</td>
              </tr>
              <tr>
                <td style="font-size:12px; color:#991b1b; font-weight:700; padding-top:6px;">Original Payment:</td>
                <td align="right" style="font-size:13px; color:#1e1e2f; font-weight:600; padding-top:6px;">₹${plan?.price || refundAmount}</td>
              </tr>
              <tr>
                <td style="font-size:12px; color:#991b1b; font-weight:800; padding-top:8px;">REFUND AMOUNT:</td>
                <td align="right" style="font-size:18px; color:#dc2626; font-weight:900; padding-top:8px;">₹${refundAmount}</td>
              </tr>
            </table>
          </div>

          <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px 16px;">
            <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase;">Refund Details</p>
            <p style="margin:0 0 2px 0; font-size:12px; color:#374151;">Refund Reference ID: <strong>${refundId}</strong></p>
            <p style="margin:0 0 2px 0; font-size:12px; color:#374151;">Original Order ID: ${payment?.orderId || 'N/A'}</p>
            <p style="margin:0; font-size:12px; color:${statusColor}; font-weight:700;">Status: ${statusText}</p>
          </div>
        </td>
      </tr>
    `;

    const htmlContent = renderEmailShell({
      title: '❌ CANCELLATION & REFUND',
      subtitle: 'Tournament Plan Refund Confirmation',
      accentColor: '#dc2626',
      innerHtml
    });

    return await dispatchEmail({
      to: organizer.email,
      name: organizerName,
      subject: `${isPending ? '⏳ Subscription Cancelled & Refund Pending Review' : '❌ Subscription Cancelled & Refund Initiated'} (${invoiceNo})`,
      htmlContent
    });
  } catch (error) {
    console.error('Failed to send refund email:', error);
  }
};

