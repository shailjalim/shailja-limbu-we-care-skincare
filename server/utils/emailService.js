const nodemailer = require('nodemailer');

let transporter;

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const escapeHtml = (value) => {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const getFrontendUrl = () => {
  return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials are not configured. Set EMAIL_USER and EMAIL_PASS.');
  }

  const allowSelfSigned = toBoolean(process.env.EMAIL_ALLOW_SELF_SIGNED, false);

  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: !allowSelfSigned,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const activeTransporter = getTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || 'We Care Skincare';
  const fromAddress = process.env.EMAIL_USER;

  return activeTransporter.sendMail({
    from: `${fromName} <${fromAddress}>`,
    to,
    subject,
    text,
    html,
  });
};

const buildPasswordResetEmailHtml = ({ name, resetUrl }) => {
  const safeName = escapeHtml(name || 'there');
  const safeResetUrl = escapeHtml(resetUrl);

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #db2777; margin-bottom: 12px;">Reset Your Password</h2>
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your We Care Skincare password.</p>
      <p style="margin: 24px 0;">
        <a href="${safeResetUrl}" style="background: #db2777; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If the button does not work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #db2777;">${safeResetUrl}</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
};

const buildWelcomeEmailHtml = ({ name }) => {
  const safeName = escapeHtml(name || 'there');
  const loginUrl = `${getFrontendUrl()}/login`;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #db2777; margin-bottom: 12px;">Welcome to We Care Skincare</h2>
      <p>Hi ${safeName},</p>
      <p>Welcome aboard. Your skincare journey starts here.</p>
      <p><strong>Your account is ready.</strong> Log in below to access your personalized skincare dashboard.</p>
      <p>With We Care Skincare, you can:</p>
      <ul>
        <li>Complete your skin profile and quiz</li>
        <li>Get personalized product recommendations</li>
        <li>Track your routine progress</li>
        <li>Request dermatologist consultations</li>
      </ul>
      <p style="margin: 24px 0;">
        <a href="${loginUrl}" style="background: #db2777; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Log In Now
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        Use the email and password you just provided during signup.
      </p>
    </div>
  `;
};

const buildConsultationReplyEmailHtml = ({ title, reply }) => {
  const safeTitle = escapeHtml(title || 'Consultation');
  const safeReply = escapeHtml(reply || '').replace(/\n/g, '<br />');
  const loginUrl = `${getFrontendUrl()}/login`;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #db2777; margin-bottom: 12px;">Your Consultation Has Been Answered</h2>
      <p>Your consultation has been reviewed by our admin team.</p>
      <p><strong>Consultation Title:</strong> ${safeTitle}</p>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Admin Reply:</strong></p>
        <p style="margin: 8px 0 0;">${safeReply || 'Please log in to your dashboard to view the full consultation details.'}</p>
      </div>
      <p><strong>Log in to your account</strong> to view your consultation with images and full details.</p>
      <p style="margin: 24px 0;">
        <a href="${loginUrl}" style="background: #db2777; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Log In to Dashboard
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        Use your registered email and password to access the consultation details and reply images.
      </p>
    </div>
  `;
};

const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${getFrontendUrl()}/reset-password/${token}`;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
    html: buildPasswordResetEmailHtml({ name, resetUrl }),
  });
};

const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to We Care Skincare',
    text: `Welcome to We Care Skincare, ${name || 'there'}! Visit your dashboard to get started.`,
    html: buildWelcomeEmailHtml({ name }),
  });
};

const sendConsultationReplyEmail = async (email, title, reply) => {
  return sendEmail({
    to: email,
    subject: 'Your Consultation Has Been Answered',
    text: `Your consultation "${title || 'Consultation'}" has been answered. Reply: ${reply || ''}`,
    html: buildConsultationReplyEmailHtml({ title, reply }),
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendConsultationReplyEmail,
  buildPasswordResetEmailHtml,
  buildWelcomeEmailHtml,
  buildConsultationReplyEmailHtml,
};
