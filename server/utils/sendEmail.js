/**
 * Compatibility wrapper around the new email service.
 *
 * @module utils/sendEmail
 */

const {
  sendEmail: sendServiceEmail,
  buildPasswordResetEmailHtml,
} = require('./emailService');

const sendEmail = async (options) => {
  return sendServiceEmail({
    to: options.email || options.to,
    subject: options.subject,
    text: options.message || options.text,
    html: options.html,
  });
};

const generateResetPasswordEmail = (userName, resetUrl) => {
  return buildPasswordResetEmailHtml({ name: userName, resetUrl });
};

module.exports = {
  sendEmail,
  generateResetPasswordEmail,
};
