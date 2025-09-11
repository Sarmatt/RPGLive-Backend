const nodemailer = require('nodemailer');

async function sendBugReportEmail(subject, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.BUG_REPORT_EMAIL,
    subject: `[Bug Report] ${subject}`,
    text: message
  });
}

module.exports = sendBugReportEmail;