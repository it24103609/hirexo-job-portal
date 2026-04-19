const getTransporter = require('../config/email');
const EmailLog = require('../models/EmailLog');

async function sendEmail({ to, subject, html, text, attachments = [] }) {
  const transporter = getTransporter();

  if (!transporter) {
    await EmailLog.create({
      to,
      subject,
      html,
      text,
      attachmentNames: attachments.map((item) => item.filename).filter(Boolean),
      status: 'skipped',
      skipped: true,
      error: 'SMTP not configured'
    });
    return { skipped: true };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text,
      attachments
    });

    await EmailLog.create({
      to,
      subject,
      html,
      text,
      attachmentNames: attachments.map((item) => item.filename).filter(Boolean),
      status: 'sent',
      skipped: false,
      messageId: info?.messageId,
      accepted: info?.accepted || [],
      rejected: info?.rejected || [],
      response: info?.response,
      previewUrl: info?.previewUrl || null
    });

    return info;
  } catch (error) {
    await EmailLog.create({
      to,
      subject,
      html,
      text,
      attachmentNames: attachments.map((item) => item.filename).filter(Boolean),
      status: 'failed',
      skipped: false,
      error: error.message
    });
    return { skipped: true, error: error.message };
  }
}

module.exports = {
  sendEmail
};
