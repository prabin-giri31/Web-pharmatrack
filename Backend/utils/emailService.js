import nodemailer from "nodemailer";

// Cache for Ethereal test account
let etherealTransporter = null;

// Create reusable transporter
const createTransporter = async () => {
  // For production, use real SMTP credentials
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production configuration
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // Development: Use Ethereal test account (free test SMTP)
  // This creates a real test inbox you can view at https://ethereal.email
  if (!etherealTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("=".repeat(60));
      console.log("ETHEREAL TEST EMAIL ACCOUNT CREATED");
      console.log("View sent emails at: https://ethereal.email");
      console.log(`Login: ${testAccount.user}`);
      console.log(`Password: ${testAccount.pass}`);
      console.log("=".repeat(60));
    } catch (err) {
      console.error("Failed to create Ethereal account:", err);
      return null;
    }
  }
  
  return etherealTransporter;
};

/**
 * Send password reset code email
 * @param {string} to - Recipient email
 * @param {string} code - 6-digit reset code
 * @param {string} ownerName - User's name for personalization
 */
export const sendPasswordResetEmail = async (to, code, ownerName = "User") => {
  const transporter = await createTransporter();
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #2563eb; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">PharmaTrack</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px;">Password Reset Request</h2>
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                    Hello ${ownerName},
                  </p>
                  <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                    We received a request to reset your password. Use the verification code below to proceed:
                  </p>
                  
                  <!-- Code Box -->
                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1f2937;">${code}</span>
                  </div>
                  
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                    This code will expire in <strong>15 minutes</strong>.
                  </p>
                  <p style="margin: 0 0 30px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} PharmaTrack. All rights reserved.
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

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"PharmaTrack" <noreply@pharmatrack.com>',
    to,
    subject: "Password Reset Code - PharmaTrack",
    html: emailHtml,
    text: `Hello ${ownerName},\n\nYour password reset code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\nPharmaTrack Team`,
  };

  if (transporter) {
    // Send actual email
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    
    // Get preview URL for Ethereal emails
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("=".repeat(60));
      console.log("VIEW EMAIL AT:", previewUrl);
      console.log("=".repeat(60));
    }
    
    return { success: true, messageId: info.messageId, previewUrl };
  } else {
    // No transporter configured - log to console for development
    console.log("=".repeat(60));
    console.log("EMAIL SERVICE FAILED - Could not create transporter");
    console.log("Reset Code for", to, ":", code);
    console.log("=".repeat(60));
    console.log("To enable email sending, set these environment variables:");
    console.log("  EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM");
    console.log("=".repeat(60));
    return { success: true, development: true };
  }
};
