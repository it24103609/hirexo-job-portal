const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  // Strip spaces from Gmail App Passwords (they are sometimes written with spaces for readability)
  const pass = (process.env.SMTP_PASS || '').replace(/\s/g, '');

  if (!host || !user || !pass) {
    return null;
  }

  if (host === 'smtp.example.com' || user === 'your_username' || pass === 'your_password') {
    return null;
  }

  // Use Gmail service shorthand when host is smtp.gmail.com for best compatibility
  if (host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000
    });
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user,
      pass
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });
}

module.exports = getTransporter;
