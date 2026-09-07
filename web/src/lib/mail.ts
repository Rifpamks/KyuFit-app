import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
const smtpUser = process.env.SMTP_USER || '';
// Clean any spaces from the 16-character Google App Password (e.g. 'oyko knvo qiqp leby' -> 'oykoknvoqiqpleby')
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const smtpFrom = process.env.SMTP_FROM || `KyuFit AI <${smtpUser}>`;

export const mailTransporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendPasswordResetOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
  if (!smtpUser || !smtpPass) {
    console.error('[Mailer] SMTP credentials are not configured in environment variables');
    throw new Error('Konfigurasi pengiriman email server belum lengkap.');
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kode OTP Reset Password KyuFit</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <tr>
          <td style="padding: 32px 32px 20px 32px; text-align: center; background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);">
            <div style="width: 56px; height: 56px; line-height: 56px; font-size: 32px; background-color: #f97316; border-radius: 16px; margin: 0 auto 16px auto; text-align: center;">
              🐱
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #1c1917; letter-spacing: -0.5px;">KyuFit AI</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #78716c; font-weight: 500;">Asisten Nutrisi & Kebugaran WhatsApp</p>
          </td>
        </tr>

        <!-- Content Body -->
        <tr>
          <td style="padding: 10px 32px 32px 32px;">
            <div style="border-top: 1px solid #f5f5f4; padding-top: 20px;">
              <h2 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #292524;">Permintaan Reset Password</h2>
              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #57534e;">
                Halo, kami menerima permintaan untuk mengatur ulang kata sandi akun KyuFit Anda. Gunakan kode OTP 6-digit di bawah ini untuk memverifikasi identitas Anda:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 2px dashed #f97316; border-radius: 16px; padding: 22px 16px; text-align: center; margin: 24px 0;">
                <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #ea580c; margin-bottom: 6px;">Kode Verifikasi OTP</span>
                <span style="display: block; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #c2410c; font-family: monospace;">
                  ${otpCode}
                </span>
                <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #9a3412; margin-top: 8px; background-color: #ffedd5; padding: 3px 10px; border-radius: 20px;">
                  ⏳ Berlaku selama 5 menit
                </span>
              </div>

              <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 1.5; color: #78716c;">
                Demi keamanan, <strong>jangan bagikan kode ini kepada siapa pun</strong>, termasuk pihak yang mengatasnamakan KyuFit.
              </p>

              <div style="background-color: #f5f5f4; border-radius: 12px; padding: 12px 16px; margin-top: 20px;">
                <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #78716c;">
                  💡 <em>Jika Anda tidak merasa meminta reset password ini, Anda dapat mengabaikan email ini dengan aman. Password lama Anda tidak akan berubah.</em>
                </p>
              </div>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 32px; background-color: #fafaf9; border-top: 1px solid #f5f5f4; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #a8a29e;">
              © 2026 KyuFit AI Platform • Terintegrasi dengan WhatsApp Gateway
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const info = await mailTransporter.sendMail({
    from: smtpFrom,
    to: toEmail,
    subject: `[KyuFit] Kode Verifikasi Reset Password: ${otpCode}`,
    text: `Kode verifikasi reset password KyuFit Anda adalah: ${otpCode}. Kode ini berlaku selama 5 menit.`,
    html: htmlContent,
  });

  console.log('[Mailer] OTP email sent successfully. MessageId:', info.messageId);
  return true;
}
