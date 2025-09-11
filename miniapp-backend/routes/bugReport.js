const express = require('express');
const router = express.Router();
const sendBugReportEmail = require('../services/mailer');

router.post('/', async (req, res) => {
  const body = req.body || {};
  const query = req.query || {};

  const subject = body.subject || query.subject;
  const message = body.message || query.message;

  if (!subject || !message) {
    return res.status(400).json({ error: 'Потрібні subject і message' });
  }

  try {
    await sendBugReportEmail(subject, message);
    res.json({ success: true, message: 'Лист надіслано' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;