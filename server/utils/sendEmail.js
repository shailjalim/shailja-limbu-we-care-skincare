/**
 * Email Utility
 * 
 * Handles sending emails using Nodemailer.
 * Used for password reset and other notifications.
 * 
 * @module utils/sendEmail
 */

const nodemailer = require('nodemailer');

/**
 * Send Email
 * 
 * Sends an email using configured SMTP settings.
 * 
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @param {string} options.html - HTML message (optional)
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
    let transporter;

    // Check if using test mode (Ethereal) or production SMTP
    if (process.env.USE_ETHEREAL === 'true' || !process.env.SMTP_EMAIL || process.env.SMTP_EMAIL === 'your_mailtrap_username') {
        // Create test account using Ethereal (for development/testing)
        console.log('Using Ethereal Email for testing...');
        const testAccount = await nodemailer.createTestAccount();
        
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    } else {
        // Use configured SMTP (Mailtrap or other)
        console.log('Using configured SMTP:', process.env.SMTP_HOST);
        
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });
    }

    // Email options
    const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || undefined,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log preview URL for Ethereal (test emails)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log('📧 Preview email at:', previewUrl);
    }

    return { ...info, previewUrl };
};

/**
 * Generate Password Reset Email HTML
 * 
 * Creates a styled HTML email for password reset.
 * 
 * @param {string} userName - User's name
 * @param {string} resetUrl - Password reset URL
 * @returns {string} - HTML email content
 */
const generateResetPasswordEmail = (userName, resetUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - WeCare</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #db2777; font-size: 32px; margin: 0;">WeCare</h1>
                <p style="color: #6b7280; margin-top: 8px;">Your Skincare Companion</p>
            </div>
            
            <!-- Main Card -->
            <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #1f2937; font-size: 24px; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Hi ${userName},
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    We received a request to reset your password. Click the button below to create a new password:
                </p>
                
                <!-- Reset Button -->
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; background-color: #db2777; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                    Or copy and paste this link into your browser:
                </p>
                
                <p style="color: #db2777; font-size: 14px; word-break: break-all; background-color: #fdf2f8; padding: 12px; border-radius: 8px; margin-bottom: 24px;">
                    ${resetUrl}
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
                    <strong>This link will expire in 10 minutes.</strong>
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px;">
                <p style="color: #9ca3af; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} WeCare. All rights reserved.
                </p>
                <p style="color: #9ca3af; font-size: 12px;">
                    This is an automated email, please do not reply.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    sendEmail,
    generateResetPasswordEmail,
};
